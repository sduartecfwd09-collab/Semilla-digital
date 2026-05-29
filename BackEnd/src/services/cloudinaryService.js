'use strict';
// ============================================================
// Service: Cloudinary
// Configuración y métodos auxiliares para gestionar subidas
// de archivos a Cloudinary.
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

// Configuración con variables de entorno
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Sube un buffer de archivo directamente a Cloudinary.
 * Útil cuando se usa multer.memoryStorage() para evitar escribir a disco local.
 * @param {Buffer} fileBuffer - Buffer del archivo en memoria.
 * @param {string} folder - Nombre de la carpeta destino en Cloudinary.
 * @returns {Promise<Object>} Resultado de la subida con la URL segura.
 */
const uploadFromBuffer = (fileBuffer, folder = 'agromap', originalName = 'asset.bin') => {
  if (!hasCloudinaryConfig) {
    return Promise.resolve(saveBufferLocally(fileBuffer, folder, originalName));
  }
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Detecta automáticamente si es imagen, pdf, etc.
      },
      (error, result) => {
        if (error) {
          const message = String(error.message || error.http_code || '');
          if (/timeout/i.test(message)) {
            return resolve(saveBufferLocally(fileBuffer, folder, originalName));
          }
          return reject(error);
        }
        resolve(result);
      }
    );

    // Escribe el buffer en el stream
    uploadStream.end(fileBuffer);
  });
};

/**
 * Sube un archivo local desde su ruta física a Cloudinary y opcionalmente
 * elimina el archivo local después de la subida.
 * @param {string} localPath - Ruta física absoluta o relativa del archivo.
 * @param {string} folder - Nombre de la carpeta destino en Cloudinary.
 * @param {boolean} autoDeleteLocal - Si true, borra el archivo temporal local.
 * @returns {Promise<Object>} Resultado de la subida con la URL segura.
 */
const uploadFromPath = async (localPath, folder = 'agromap', autoDeleteLocal = true) => {
  try {
    if (!hasCloudinaryConfig) {
      const result = saveBufferLocally(fs.readFileSync(localPath), folder, path.basename(localPath));
      if (autoDeleteLocal && fs.existsSync(localPath)) fs.unlinkSync(localPath);
      return result;
    }
    const result = await cloudinary.uploader.upload(localPath, {
      folder: folder,
      resource_type: 'auto',
    });

    if (autoDeleteLocal && fs.existsSync(localPath)) {
      fs.unlinkSync(localPath); // Elimina el archivo local temporal
    }

    return result;
  } catch (error) {
    if (autoDeleteLocal && fs.existsSync(localPath)) {
      try { fs.unlinkSync(localPath); } catch {}
    }
    throw error;
  }
};

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

const toAssetMetadata = (result, fallbackMimeType) => ({
  secureUrl: result.secure_url,
  publicId: result.public_id,
  resourceType: result.resource_type,
  format: result.format,
  bytes: result.bytes,
  width: result.width,
  height: result.height,
  originalFilename: result.original_filename,
  mimeType: fallbackMimeType || result.resource_type,
});

const deleteAsset = (publicId, resourceType = 'image') =>
  publicId && String(publicId).startsWith('local/')
    ? Promise.resolve({ result: 'ok' })
    : cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType === 'raw' ? 'raw' : 'image',
    invalidate: true,
  });

module.exports = {
  cloudinary,
  hasCloudinaryConfig,
  uploadFromBuffer,
  uploadFromPath,
  toAssetMetadata,
  deleteAsset,
};
