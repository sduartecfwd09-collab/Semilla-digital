// ============================================================
// Controller: Receta
// Descripción: Orquesta las peticiones HTTP para recetas.
// Soporta upload de imagen via Cloudinary cuando llega req.file.
// ============================================================
const recetaService = require('../services/recetaService');
const cloudinaryService = require('../services/cloudinaryService');

/**
 * Convierte FormData (multipart) en un body limpio para el service.
 * Parsea campos JSON serializados ("ingredients", "steps") y elimina
 * keys vacíos.
 */
function normalizeBody(body) {
  const out = { ...body };
  for (const key of ['ingredients', 'steps']) {
    if (typeof out[key] === 'string' && out[key].trim().startsWith('[')) {
      try { out[key] = JSON.parse(out[key]); } catch { /* dejar string */ }
    }
  }
  // remove_image: bandera del frontend para borrar imagen actual
  if (out.remove_image === 'true' || out.remove_image === true) {
    out.image_url = null;
    out.__remove_image__ = true;
  }
  delete out.remove_image;
  return out;
}

const getAll = async (req, res) => {
  try {
    const data = await recetaService.findAll(req.query);
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const getById = async (req, res) => {
  try {
    const data = await recetaService.findById(req.params.id);
    if (!data) {
      return res.status(404).json({ success: false, message: 'Receta no encontrada' });
    }
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

const create = async (req, res) => {
  try {
    const body = normalizeBody(req.body);

    if (req.file && req.file.buffer) {
      const uploaded = await cloudinaryService.uploadBuffer(req.file.buffer, {
        folder: 'agromap/recetas',
      });
      body.image_url = uploaded.secure_url;
    }

    const data = await recetaService.create(body);
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

const update = async (req, res) => {
  try {
    const body = normalizeBody(req.body);
    const wasRemoveRequested = body.__remove_image__ === true;
    delete body.__remove_image__;

    // Obtener URL previa para limpieza en Cloudinary si llega imagen nueva o se solicita remover
    const previous = await recetaService.findById(req.params.id);
    const previousUrl = previous?.image_url || null;

    if (req.file && req.file.buffer) {
      const uploaded = await cloudinaryService.uploadBuffer(req.file.buffer, {
        folder: 'agromap/recetas',
      });
      body.image_url = uploaded.secure_url;
    }

    const data = await recetaService.update(req.params.id, body);

    // Limpieza diferida de la imagen anterior (no bloquea la respuesta)
    const replacingImage = (req.file && req.file.buffer) || wasRemoveRequested;
    if (replacingImage && previousUrl) {
      const oldPublicId = cloudinaryService.extractPublicId(previousUrl);
      if (oldPublicId) {
        cloudinaryService.destroy(oldPublicId).catch(() => { /* ya logueado */ });
      }
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    if (error.message && error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(400).json({ success: false, message: error.message });
  }
};

const remove = async (req, res) => {
  try {
    // Capturar URL antes de borrar para limpieza Cloudinary
    const existing = await recetaService.findById(req.params.id);
    const url = existing?.image_url || null;

    await recetaService.remove(req.params.id);

    if (url) {
      const publicId = cloudinaryService.extractPublicId(url);
      if (publicId) {
        cloudinaryService.destroy(publicId).catch(() => { /* ya logueado */ });
      }
    }

    return res.status(200).json({ success: true, data: { message: 'Receta eliminada correctamente' } });
  } catch (error) {
    if (error.message && error.message.includes('no encontrad')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Error interno del servidor' });
  }
};

module.exports = { getAll, getById, create, update, remove };
