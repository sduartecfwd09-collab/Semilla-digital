'use strict';
// ============================================================
// Servicio: Cloudinary
// Wrapper para subir y eliminar imágenes en Cloudinary.
// Usa las credenciales de .env (CLOUDINARY_*).
// ============================================================
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube un buffer (multer memoryStorage) a Cloudinary.
 * @param {Buffer} buffer
 * @param {object} options { folder, public_id? }
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
 * Alias de uploadBuffer para compatibilidad con cloudinaryMiddleware.
 * @param {Buffer} fileBuffer
 * @param {string} folder
 */
const uploadFromBuffer = (fileBuffer, folder = 'agromap') =>
  uploadBuffer(fileBuffer, { folder });

/**
 * Sube un archivo desde ruta física a Cloudinary y opcionalmente lo borra del disco.
 * @param {string} localPath
 * @param {string} folder
 * @param {boolean} autoDeleteLocal
 */
const uploadFromPath = async (localPath, folder = 'agromap', autoDeleteLocal = true) => {
  try {
    const result = await cloudinary.uploader.upload(localPath, {
      folder,
      resource_type: 'auto',
    });
    if (autoDeleteLocal && fs.existsSync(localPath)) fs.unlinkSync(localPath);
    return result;
  } catch (error) {
    if (autoDeleteLocal && fs.existsSync(localPath)) {
      try { fs.unlinkSync(localPath); } catch {}
    }
    throw error;
  }
};

/**
 * Elimina un asset por public_id (silencioso si no existe).
 * @param {string} publicId
 */
async function destroy(publicId) {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
  } catch (err) {
    console.warn('[cloudinaryService] destroy error:', err.message);
    return null;
  }
}

/**
 * Extrae el public_id de una URL Cloudinary.
 * @param {string} url
 * @returns {string|null}
 */
function extractPublicId(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/upload\/(?:v\d+\/)?([^.]+)\./);
  return match ? match[1] : null;
}

module.exports = { cloudinary, uploadBuffer, uploadFromBuffer, uploadFromPath, destroy, extractPublicId };
