'use strict';
// ============================================================
// Middleware: Cloudinary Upload
// Procesa archivos recibidos por multipart/form-data en memoria
// y los sube de manera transparente a Cloudinary.
// ============================================================
const multer = require('multer');
const { uploadFromBuffer } = require('../services/cloudinaryService');

// Usar almacenamiento en memoria (evita escribir archivos temporales en el disco)
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Límite de 10MB
  fileFilter: (_req, file, cb) => {
    // Permitir imágenes y PDFs
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes (JPG, PNG, WebP) o archivos PDF.'));
    }
  },
});

/**
 * Middleware generador para subir un único archivo a Cloudinary.
 * @param {string} fieldName - Nombre del campo del archivo en la solicitud HTTP (ej: 'selfie', 'foto').
 * @param {string} folderName - Carpeta de destino dentro de Cloudinary (ej: 'selfies', 'documentos').
 * @param {boolean} isRequired - Si es true, fallará con 400 si no se envía ningún archivo.
 */
const handleCloudinaryUpload = (fieldName, folderName = 'agromap', isRequired = false) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, async (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: `El archivo en el campo '${fieldName}' no puede superar los 10MB`,
          });
        }
        return res.status(400).json({ success: false, message: err.message });
      }

      // Si no hay archivo y es requerido, devolver error
      if (!req.file) {
        if (isRequired) {
          return res.status(400).json({
            success: false,
            message: `El archivo en el campo '${fieldName}' es obligatorio`,
          });
        }
        return next(); // Continuar si no es obligatorio
      }

      try {
        console.log(`[Cloudinary] Subiendo archivo del campo '${fieldName}' a la carpeta '${folderName}'...`);
        const uploadResult = await uploadFromBuffer(req.file.buffer, folderName);
        
        // Inyectar el resultado de la subida en el body de la petición para que el controlador lo guarde
        req.body[`${fieldName}_url`] = uploadResult.secure_url;
        req.body[`${fieldName}_public_id`] = uploadResult.public_id; // Útil para eliminar archivos luego

        console.log(`[Cloudinary] Archivo subido con éxito. URL: ${uploadResult.secure_url}`);
        next();
      } catch (uploadErr) {
        console.error('[Cloudinary Middleware Error]', uploadErr);
        return res.status(500).json({
          success: false,
          message: 'Error al subir el archivo al almacenamiento en la nube',
        });
      }
    });
  };
};

module.exports = { handleCloudinaryUpload };
