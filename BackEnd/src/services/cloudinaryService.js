'use strict';
// ============================================================
// Servicio: Cloudinary
// Wrapper para subir y eliminar imágenes en Cloudinary o localmente como fallback.
// Usa las credenciales de .env (CLOUDINARY_*).
// ============================================================
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_URL ||
  (process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET)
);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Sube un archivo en disco local de forma temporal/fallback
 */
const saveBufferLocally = (fileBuffer, folder = 'agromap', originalName = 'asset.bin') => {
  const safeFolder = String(folder).replace(/[^a-zA-Z0-9/_-]/g, '_');
  const outputDir = path.join(__dirname, '..', 'storage', 'cloudinary-fallback', safeFolder);
  fs.mkdirSync(outputDir, { recursive: true });
  const ext = path.extname(originalName) || '.bin';
  const publicId = `${safeFolder}/${Date.now()}_${Math.random().toString(16).slice(2)}`;
  const filename = `${path.basename(publicId)}${ext}`;
  fs.writeFileSync(path.join(outputDir, filename), fileBuffer);
  const publicPath = `/storage/cloudinary-fallback/${safeFolder}/${filename}`.replace(/\\/g, '/');
  const baseUrl = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 3002}`;
  return {
    secure_url: `${baseUrl}${publicPath}`,
    public_id: `local/${safeFolder}/${filename}`,
    resource_type: ext.toLowerCase() === '.pdf' ? 'raw' : 'image',
    format: ext.replace('.', '').toLowerCase(),
    bytes: fileBuffer.length,
    original_filename: path.basename(originalName, ext),
  };
};

/**
 * Sube un buffer (multer memoryStorage) a Cloudinary (o fallback local).
 * @param {Buffer} buffer
 * @param {object} options { folder, public_id, originalName }
 */
function uploadBuffer(buffer, options = {}) {
  const folder = options.folder || 'agromap';
  const originalName = options.originalName || 'asset.bin';

  if (!hasCloudinaryConfig) {
    return Promise.resolve(saveBufferLocally(buffer, folder, originalName));
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'image',
        public_id: options.public_id,
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          const message = String(error.message || error.http_code || '');
          if (/timeout/i.test(message)) {
            return resolve(saveBufferLocally(buffer, folder, originalName));
          }
          return reject(error);
        }
        if (!result) return reject(new Error('Cloudinary upload returned no result'));
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type || 'image',
          format: result.format,
          bytes: result.bytes,
          original_filename: result.original_filename,
        });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Wrapper de uploadBuffer para compatibilidad con middlewares heredados.
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
    if (!hasCloudinaryConfig) {
      const result = saveBufferLocally(fs.readFileSync(localPath), folder, path.basename(localPath));
      if (autoDeleteLocal && fs.existsSync(localPath)) fs.unlinkSync(localPath);
      return result;
    }
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
 * Mapea la metadata para la persistencia del archivo.
 */
const toAssetMetadata = (result, fallbackMimeType) => ({
  secureUrl: result.secure_url,
  publicId: result.public_id,
  resourceType: result.resource_type || 'image',
  format: result.format,
  bytes: result.bytes,
  width: result.width,
  height: result.height,
  originalFilename: result.original_filename,
  mimeType: fallbackMimeType || result.resource_type || 'image',
});

/**
 * Elimina un asset por public_id (silencioso si no existe).
 * @param {string} publicId
 * @param {string} resourceType
 */
async function destroy(publicId, resourceType = 'image') {
  if (!publicId) return null;
  if (String(publicId).startsWith('local/')) {
    return { result: 'ok' };
  }
  try {
    return await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType === 'raw' ? 'raw' : 'image',
      invalidate: true,
    });
  } catch (err) {
    console.warn('[cloudinaryService] destroy error:', err.message);
    return null;
  }
}

/**
 * Alias de destroy para compatibilidad con controladores antiguos.
 */
const deleteAsset = (publicId, resourceType = 'image') => destroy(publicId, resourceType);

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

module.exports = {
  cloudinary,
  hasCloudinaryConfig,
  uploadBuffer,
  uploadFromBuffer,
  uploadFromPath,
  toAssetMetadata,
  destroy,
  deleteAsset,
  extractPublicId,
};
