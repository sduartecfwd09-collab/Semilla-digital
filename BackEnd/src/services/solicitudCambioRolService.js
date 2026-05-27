// ============================================================
// Service: SolicitudCambioRol
// Descripción: Lógica de negocio para solicitudes de cambio
//              de rol (flujo de aprobación admin)
// ============================================================
const { sequelize, SolicitudCambioRol, Usuario, DeliveryDriver, Role, PuestoProductor, PuestoFeria } = require('../models');
const fs = require('fs');
const path = require('path');
const { uploadFromPath } = require('./cloudinaryService');

const saveBase64Documents = (userId, vehicleType, documentosBase64) => {
  if (!documentosBase64 || Object.keys(documentosBase64).length === 0) return null;
  
  const basePath = path.join(__dirname, '../../storage/delivery-applications', String(userId), vehicleType);
  if (!fs.existsSync(basePath)) {
    fs.mkdirSync(basePath, { recursive: true });
  }

  const filePaths = {};
  for (const [docId, base64Str] of Object.entries(documentosBase64)) {
    if (!base64Str) continue;
    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      if (base64Str.startsWith('http') || base64Str.startsWith('/')) {
        filePaths[docId] = base64Str;
      }
      continue;
    }
    
    const mimeType = matches[1];
    const dataBuffer = Buffer.from(matches[2], 'base64');
    let ext = 'pdf';
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('png')) ext = 'png';
    else if (mimeType.includes('webp')) ext = 'webp';

    const filename = `${docId}.${ext}`;
    const fullPath = path.join(basePath, filename);
    
    fs.writeFileSync(fullPath, dataBuffer);
    
    // Guardamos la ruta relativa
    filePaths[docId] = `/storage/delivery-applications/${userId}/${vehicleType}/${filename}`;
  }
  return filePaths;
};

const mapSolicitudParaFrontend = (s) => {
  if (!s) return null;
  const raw = s.toJSON ? s.toJSON() : s;
  return {
    id: raw.id,
    usuarioId: raw.usuario_id,
    nombreUsuario: raw.nombre_usuario,
    nombreDelPuesto: raw.nombre_del_puesto,
    correoUsuario: raw.correo_usuario,
    rolSolicitado: raw.rol_solicitado,
    estado: raw.estado,
    fechaSolicitud: raw.fecha_solicitud,
    motivoRespuesta: raw.motivo_respuesta,
    fechaRespuesta: raw.fecha_respuesta,
    vehicle_type: raw.vehicle_type || raw.vehicleType,
    license_plate: raw.license_plate || raw.licensePlate,
    marca_vehiculo: raw.marca_vehiculo || raw.marcaVehiculo,
    modelo_vehiculo: raw.modelo_vehiculo || raw.modeloVehiculo,
    anio_vehiculo: raw.anio_vehiculo || raw.anioVehiculo,
    selfie_verificacion_url: raw.selfie_verificacion_url || raw.selfieVerificacionUrl,
    documentos_base64: raw.documentos_base64 || raw.documentosBase64,
    documentos_rutas: raw.documentos_rutas || raw.documentosRutas,
    confirmaciones: raw.confirmaciones,
    createdAt: raw.createdAt || raw.created_at,
    updatedAt: raw.updatedAt || raw.updated_at,
    usuario: raw.usuario ? {
      id: raw.usuario.id,
      name: raw.usuario.name,
      nombre: raw.usuario.nombre,
      email: raw.usuario.email,
      role: raw.usuario.role || (raw.usuario.rol ? raw.usuario.rol.nombre : 'Usuario')
    } : null
  };
};

const findAll = async (query = {}) => {
  const where = {};

  if (query.estado) {
    where.estado = query.estado;
  }

  const list = await SolicitudCambioRol.findAll({
    where,
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
    order: [['fecha_solicitud', 'DESC']],
  });
  return list.map(mapSolicitudParaFrontend);
};

const findById = async (id) => {
  const item = await SolicitudCambioRol.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
  });
  return mapSolicitudParaFrontend(item);
};

const findByUsuario = async (usuarioId) => {
  const list = await SolicitudCambioRol.findAll({
    where: { usuario_id: usuarioId },
    order: [['fecha_solicitud', 'DESC']],
  });
  return list.map(mapSolicitudParaFrontend);
};

const findPendientes = async () => {
  const list = await SolicitudCambioRol.findAll({
    where: { estado: 'Pendiente' },
    include: [{ model: Usuario, as: 'usuario', attributes: ['id', 'name', 'nombre', 'email', 'roleId'] }],
    order: [['fecha_solicitud', 'ASC']],
  });
  return list.map(mapSolicitudParaFrontend);
};

const create = async (data) => {
  const usuario_id = data.usuario_id || data.usuarioId;
  const rol_solicitado = data.rol_solicitado || data.rolSolicitado;
  const nombre_del_puesto = data.nombre_del_puesto || data.nombreDelPuesto;
  const correo_usuario = data.correo_usuario || data.correoUsuario;
  const nombre_usuario = data.nombre_usuario || data.nombreUsuario;

  if (!usuario_id) {
    throw new Error('El ID del usuario es requerido');
  }
  if (!rol_solicitado) {
    throw new Error('El rol solicitado es requerido');
  }

  // Verificar que no tenga una solicitud pendiente
  const pendiente = await SolicitudCambioRol.findOne({
    where: { usuario_id, estado: 'Pendiente' },
  });
  if (pendiente) {
    throw new Error('Ya existe una solicitud pendiente para este usuario');
  }

  if (data.rol_solicitado === 'DRIVER' && !data.selfie_verificacion_url) {
    throw new Error('La selfie de verificación es obligatoria');
  }

  if (data.documentos_base64 && data.vehicle_type) {
    const savedPaths = saveBase64Documents(data.usuario_id, data.vehicle_type, data.documentos_base64);
    if (savedPaths) data.documentos_rutas = savedPaths;
  }
  delete data.documentos_base64;

  const created = await SolicitudCambioRol.create({
    ...data,
    usuario_id,
    rol_solicitado,
    nombre_del_puesto,
    correo_usuario,
    nombre_usuario,
    estado: 'Pendiente',
    fecha_solicitud: new Date(),
  });

  // ── Revisión automática con IA (solo rol Productor) ─────────
  if (rol_solicitado === 'Productor' && process.env.AI_AUTO_REVIEW_ENABLED === 'true') {
    setImmediate(() => {
      require('./ai/productorAutoReviewer')
        .review(created.id)
        .catch((err) => console.error('[autoReview] error:', err.message));
    });
  }

  return mapSolicitudParaFrontend(created);
};

const update = async (id, data) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }

  const updateData = { ...data };
  delete updateData.estado;
  delete updateData.motivoRespuesta;
  delete updateData.motivo_respuesta;
  delete updateData.fechaRespuesta;
  delete updateData.fecha_respuesta;

  if (data.nombreUsuario !== undefined) updateData.nombre_usuario = data.nombreUsuario;
  if (data.nombreDelPuesto !== undefined) updateData.nombre_del_puesto = data.nombreDelPuesto;
  if (data.correoUsuario !== undefined) updateData.correo_usuario = data.correoUsuario;
  if (data.rolSolicitado !== undefined) updateData.rol_solicitado = data.rolSolicitado;

  if (data.documentos_base64) {
    const vType = data.vehicle_type || solicitud.vehicle_type;
    const uId = data.usuario_id || solicitud.usuario_id;
    if (vType && uId) {
      const savedPaths = saveBase64Documents(uId, vType, data.documentos_base64);
      if (savedPaths) {
        updateData.documentos_rutas = { ...(solicitud.documentos_rutas || {}), ...savedPaths };
      }
    }
  }
  delete updateData.documentos_base64;

  const updated = await solicitud.update(updateData);
  return mapSolicitudParaFrontend(updated);
};

const approve = async (id, data = {}) => {
  const solicitud = await SolicitudCambioRol.findByPk(id, {
    include: [{ model: Usuario, as: 'usuario' }]
  });
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new Error('Solo se pueden aprobar solicitudes pendientes');
  }

  // Mapeo DRIVER → nombre de rol en BD (puede llamarse 'Repartidor')
  const role = await Role.findOne({
    where: {
      nombre: solicitud.rol_solicitado === 'DRIVER' ? ['Repartidor', 'DRIVER'] : solicitud.rol_solicitado,
    },
  });

  // Subidas a Cloudinary para DRIVER fuera de la TX (I/O externo no debe bloquear la transacción)
  let selfieCloudinaryUrl = solicitud.selfie_verificacion_url;
  let docsCloudinary = { ...(solicitud.documentos_rutas || {}) };

  if (solicitud.rol_solicitado === 'DRIVER') {
    if (selfieCloudinaryUrl && !selfieCloudinaryUrl.includes('cloudinary.com')) {
      const absoluteSelfiePath = path.join(__dirname, '../../', selfieCloudinaryUrl);
      if (fs.existsSync(absoluteSelfiePath)) {
        try {
          const res = await uploadFromPath(absoluteSelfiePath, 'delivery_selfies', false);
          selfieCloudinaryUrl = res.secure_url;
        } catch (err) {
          console.error('[Cloudinary approve] Error uploading selfie:', err);
        }
      }
    }
    for (const [key, relativePath] of Object.entries(docsCloudinary)) {
      if (relativePath && typeof relativePath === 'string' && !relativePath.includes('cloudinary.com')) {
        const absoluteDocPath = path.join(__dirname, '../../', relativePath);
        if (fs.existsSync(absoluteDocPath)) {
          try {
            const res = await uploadFromPath(absoluteDocPath, 'delivery_documents', false);
            docsCloudinary[key] = res.secure_url;
          } catch (err) {
            console.error(`[Cloudinary approve] Error uploading doc ${key}:`, err);
          }
        }
      }
    }
  }

  // Toda la aprobación (cambio de rol + entidad asociada + cierre) en una sola TX.
  const approved = await sequelize.transaction(async (t) => {
    if (role && solicitud.usuario) {
      await solicitud.usuario.update({ roleId: role.id }, { transaction: t });
    }

    if (solicitud.rol_solicitado === 'DRIVER') {
      const driverDefaults = {
        vehicle_type: solicitud.vehicle_type,
        license_plate: solicitud.license_plate,
        marca_vehiculo: solicitud.marca_vehiculo,
        modelo_vehiculo: solicitud.modelo_vehiculo,
        anio_vehiculo: solicitud.anio_vehiculo,
        confirmaciones: solicitud.confirmaciones,
        selfie_verificacion_url: selfieCloudinaryUrl,
        documentos_rutas: docsCloudinary,
        status: 'OFFLINE',
        full_name: solicitud.nombre_usuario,
        email: solicitud.correo_usuario,
        phone: solicitud.usuario?.phone || null,
        plate_number: solicitud.license_plate,
        brand: solicitud.marca_vehiculo,
        model: solicitud.modelo_vehiculo,
        identity_document_url: docsCloudinary.cedula || docsCloudinary.cedulaPasaporte || docsCloudinary.cedulaBici || null,
        criminal_record_url: docsCloudinary.hojaDelincuencia || docsCloudinary.hojaDelincuenciaBM || docsCloudinary.antecedentesBici || null,
        license_url: docsCloudinary.licenciaConducir || docsCloudinary.licenciaMoto || docsCloudinary.licenciaBM || null,
        property_card_url: docsCloudinary.tarjetaPropiedad || null,
        riteve_url: docsCloudinary.revisionTecnica || docsCloudinary.revisionTecnicaMoto || docsCloudinary.riteveBM || null,
        marchamo_url: docsCloudinary.marchamo || docsCloudinary.marchamoMoto || docsCloudinary.marchamoBM || null,
        selfie_verification_url: selfieCloudinaryUrl,
      };

      const [driverRecord, created] = await DeliveryDriver.findOrCreate({
        where: { user_id: solicitud.usuario_id },
        defaults: driverDefaults,
        transaction: t,
      });

      if (!created) {
        await driverRecord.update(driverDefaults, { transaction: t });
      }

      // Actualizar solicitud con URLs finales de Cloudinary
      await solicitud.update(
        { selfie_verificacion_url: selfieCloudinaryUrl, documentos_rutas: docsCloudinary },
        { transaction: t }
      );
    }

    if (solicitud.rol_solicitado === 'Productor') {
      const [puesto] = await PuestoProductor.findOrCreate({
        where: { usuario_id: solicitud.usuario_id },
        defaults: {
          usuario_id: solicitud.usuario_id,
          feria_id: solicitud.usuario?.feriaId || null,
          nombre_puesto: solicitud.nombre_del_puesto
            || `Puesto de ${solicitud.usuario?.name || solicitud.nombre_usuario || 'productor'}`,
          descripcion: 'Puesto creado al aprobar la solicitud de productor.',
          fecha_registro: new Date(),
        },
        transaction: t,
      });

      // Autorización inicial en puesto_ferias (fuente de verdad para productoService)
      if (puesto.feria_id) {
        await PuestoFeria.findOrCreate({
          where: { puesto_id: puesto.id, feria_id: puesto.feria_id },
          defaults: { puesto_id: puesto.id, feria_id: puesto.feria_id },
          transaction: t,
        });
      }
    }

    return await solicitud.update({
      estado: 'Aprobada',
      motivo_respuesta: data.motivo_respuesta || 'Solicitud aprobada',
      fecha_respuesta: new Date(),
    }, { transaction: t });
  });

  return mapSolicitudParaFrontend(approved);
};

const reject = async (id, data = {}) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  if (solicitud.estado !== 'Pendiente') {
    throw new Error('Solo se pueden rechazar solicitudes pendientes');
  }

  const rejected = await solicitud.update({
    estado: 'Rechazada',
    motivo_respuesta: data.motivo_respuesta || 'Solicitud rechazada',
    fecha_respuesta: new Date(),
  });

  return mapSolicitudParaFrontend(rejected);
};



const remove = async (id) => {
  const solicitud = await SolicitudCambioRol.findByPk(id);
  if (!solicitud) {
    throw new Error('Solicitud no encontrada');
  }
  await solicitud.destroy();
  return true;
};

module.exports = {
  findAll,
  findById,
  findByUsuario,
  findPendientes,
  create,
  update,
  approve,
  reject,
  remove,
};
