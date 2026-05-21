// ============================================================
// Controller: AuditLog
// Descripción: Endpoint para consultar logs de auditoría
// ============================================================
'use strict';
const auditService = require('../services/auditService');

/**
 * GET /auditoria
 * Consulta logs con filtros opcionales: ?usuarioId=1&accion=LOGIN&desde=2026-01-01&page=1
 */
const getLogs = async (req, res) => {
  try {
    const { usuarioId, accion, recurso, desde, hasta, page, limit } = req.query;

    const result = await auditService.consultar({
      usuarioId: usuarioId ? parseInt(usuarioId) : undefined,
      accion,
      recurso,
      desde,
      hasta,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 50,
    });

    return res.status(200).json({ success: true, ...result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error al consultar auditoría' });
  }
};

module.exports = { getLogs };
