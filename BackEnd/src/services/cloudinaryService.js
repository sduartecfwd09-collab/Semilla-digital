// ============================================================
// Servicio: Cloudinary
// Descripción: Wrapper para subir y eliminar imágenes en
// Cloudinary. Usa las credenciales de .env (CLOUDINARY_*).
// ============================================================
'use strict';

const cloudinary = require('cloudinary').v2;

// El SDK autoparsea CLOUDINARY_URL (formato cloudinary://key:secret@cloud_name).
// Reforzamos con secure:true y override explícito por si el deploy usa
// variables individuales en vez del URL.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube un buffer (multer memoryStorage) a Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options { folder, public_id? }
 * @returns {Promise<{secure_url:string, public_id:string}>}
 */
function uploadBuffer(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || 'agromap',
        resource_type: 'image',
        public_id: options.public_id,
        overwrite: true,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error('Cloudinary upload returned no result'));
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Elimina un asset por public_id (silencioso si no existe).
 * @param {string} publicId
 */
async function destroy(publicId) {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    // Log silencioso, no rompe el flujo
    console.warn('[cloudinaryService] destroy error:', err.message);
    return null;
  }
}

/**
 * Intenta extraer el public_id de una URL Cloudinary previamente subida
 * (ej. https://res.cloudinary.com/<cloud>/image/upload/v1234/folder/file.jpg).
 * @param {string} url
 * @returns {string|null}
 */
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)\./);
  return match ? match[1] : null;
}

module.exports = { uploadBuffer, destroy, extractPublicId };
