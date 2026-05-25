'use strict';
// ============================================================
// Service: Cloudinary
// Configuración y métodos auxiliares para gestionar subidas
// de archivos a Cloudinary.
// ============================================================
const cloudinary = require('cloudinary').v2;
const fs = require('fs');

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
const uploadFromBuffer = (fileBuffer, folder = 'agromap') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: 'auto', // Detecta automáticamente si es imagen, pdf, etc.
      },
      (error, result) => {
        if (error) return reject(error);
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

module.exports = {
  cloudinary,
  uploadFromBuffer,
  uploadFromPath,
};
