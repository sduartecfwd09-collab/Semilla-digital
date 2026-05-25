// ============================================================
// Service: ProductorAutoReviewer
// Orquesta la revisión automática de una solicitud de Productor:
//   1. Carga solicitud + puesto del usuario
//   2. Pre-check determinista + revisión semántica con Groq
//   3. Aprueba o rechaza vía solicitudCambioRolService
//   4. Notifica al usuario por email
//   5. Registra la decisión en AuditLog
//
// Diseñado para ser invocado fire-and-forget desde el service de
// creación de solicitudes. Nunca lanza excepción al caller.
// ============================================================
'use strict';

const validator = require('./productorValidator');
const templates = require('./productorMailTemplates');
const emailService = require('../emailService');
const auditService = require('../auditService');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const obtenerCorreo = (solicitud) =>
  solicitud?.correoUsuario || solicitud?.correo_usuario || null;

const obtenerNombre = (solicitud, puesto) => {
  if (solicitud?.nombreUsuario) return solicitud.nombreUsuario;
  if (solicitud?.nombre_usuario) return solicitud.nombre_usuario;
  const ext = puesto?.datosExtendidos || puesto?.datos_extendidos || {};
  const p = ext.personal || {};
  const partes = [p.nombre, p.primerApellido, p.segundoApellido].filter(Boolean);
  return partes.length > 0 ? partes.join(' ') : 'Aplicante';
};

const cargarPuestoDelUsuario = async (usuarioId) => {
  // Require lazy: evita ciclos de carga y solo se ejecuta cuando la IA está activa
  const { PuestoProductor } = require('../../models');
  let puesto = await PuestoProductor.findOne({
    where: { usuario_id: usuarioId },
    order: [['created_at', 'DESC']],
  });
  // Pequeño reintento por race condition con el POST previo del frontend
  if (!puesto) {
    await sleep(800);
    puesto = await PuestoProductor.findOne({
      where: { usuario_id: usuarioId },
      order: [['created_at', 'DESC']],
    });
  }
  if (!puesto) return null;
  const raw = puesto.toJSON();
  return {
    id: raw.id,
    usuarioId: raw.usuario_id,
    feriaId: raw.feria_id,
    nombrePuesto: raw.nombre_puesto,
    descripcion: raw.descripcion,
    telefono: raw.telefono,
    email: raw.email,
    horarios: raw.horarios,
    tiposProducto: raw.tipos_producto,
    metodosCultivo: raw.metodos_cultivo,
    fotosBase64: Array.isArray(raw.fotos_base64) ? raw.fotos_base64 : [],
    fotosNombres: Array.isArray(raw.fotos_nombres) ? raw.fotos_nombres : [],
    datosExtendidos: raw.datos_extendidos || null,
  };
};

const notificarFallbackAdmin = async (solicitudId, errorMsg) => {
  const to = process.env.AI_FALLBACK_NOTIFY_EMAIL;
  if (!to) return;
  try {
    await emailService.sendMail({
      to,
      subject: `⚠️ AgroMap: revisión IA falló para solicitud #${solicitudId}`,
      text: `La validación automática de la solicitud de Productor #${solicitudId} no pudo completarse.\n\nError: ${errorMsg}\n\nLa solicitud quedó en estado Pendiente para revisión manual.`,
    });
  } catch (e) {
    console.error('[productorAutoReviewer] fallo notificando admin:', e.message);
  }
};

/**
 * Revisión automática de una solicitud. Idempotente: si la solicitud
 * ya no está Pendiente o no es de rol Productor, no hace nada.
 * @param {number} solicitudId
 * @returns {Promise<{procesado: boolean, decision?: object, motivo?: string}>}
 */
const review = async (solicitudId) => {
  const solicitudService = require('../solicitudCambioRolService');
  try {
    const solicitud = await solicitudService.findById(solicitudId);
    if (!solicitud) {
      return { procesado: false, motivo: 'solicitud no encontrada' };
    }
    if ((solicitud.rolSolicitado || solicitud.rol_solicitado) !== 'Productor') {
      return { procesado: false, motivo: 'rol distinto a Productor' };
    }
    if (solicitud.estado !== 'Pendiente') {
      return { procesado: false, motivo: `estado ${solicitud.estado}` };
    }

    const puesto = await cargarPuestoDelUsuario(solicitud.usuarioId);

    let decision;
    try {
      decision = await validator.revisarCompleto({ solicitud, puesto });
    } catch (errIA) {
      console.error(`[productorAutoReviewer] IA falló para solicitud #${solicitudId}:`, errIA.message);
      await notificarFallbackAdmin(solicitudId, errIA.message);
      await auditService.registrar({
        usuarioId: solicitud.usuarioId,
        accion: 'AI_REVIEW_FAIL',
        recurso: 'solicitudes_cambio_rol',
        recursoId: solicitudId,
        detalles: { error: errIA.message },
      });
      return { procesado: false, motivo: 'IA error' };
    }

    const motivoFinal = decision.faltantes && decision.faltantes.length > 0
      ? `${decision.resumen} Motivos: ${decision.faltantes.join('; ')}`
      : decision.resumen;

    if (decision.aprobado) {
      await solicitudService.approve(solicitudId, { motivo_respuesta: motivoFinal });
    } else {
      await solicitudService.reject(solicitudId, { motivo_respuesta: motivoFinal });
    }

    // ── Envío de email al aplicante ────────────────────────────
    const correo = obtenerCorreo(solicitud);
    const nombre = obtenerNombre(solicitud, puesto);
    if (correo) {
      const tpl = decision.aprobado
        ? templates.aprobado({ nombre, resumen: decision.resumen })
        : templates.rechazado({ nombre, faltantes: decision.faltantes, resumen: decision.resumen });
      try {
        await emailService.sendMail({
          to: correo,
          bcc: process.env.AI_NOTIFY_ADMIN_BCC || undefined,
          subject: tpl.subject,
          html: tpl.html,
          text: tpl.text,
        });
      } catch (errMail) {
        console.error(`[productorAutoReviewer] fallo envío email a ${correo}:`, errMail.message);
      }
    } else {
      console.warn(`[productorAutoReviewer] solicitud #${solicitudId} sin correo destino`);
    }

    // ── Auditoría ───────────────────────────────────────────────
    await auditService.registrar({
      usuarioId: solicitud.usuarioId,
      accion: decision.aprobado ? 'AI_REVIEW_APPROVE' : 'AI_REVIEW_REJECT',
      recurso: 'solicitudes_cambio_rol',
      recursoId: solicitudId,
      detalles: {
        origen: decision.origen,
        faltantes: decision.faltantes,
        resumen: decision.resumen,
        correo,
      },
    });

    return { procesado: true, decision };
  } catch (err) {
    console.error(`[productorAutoReviewer] error inesperado solicitud #${solicitudId}:`, err.message);
    await notificarFallbackAdmin(solicitudId, err.message);
    return { procesado: false, motivo: err.message };
  }
};

module.exports = { review };
