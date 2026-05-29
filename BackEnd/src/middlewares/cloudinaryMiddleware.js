'use strict';

const multer = require('multer');
const { toAssetMetadata, uploadFromBuffer } = require('../services/cloudinaryService');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedMimeTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de archivo no permitido. Solo se aceptan JPG, PNG, WebP o PDF.'));
  },
});

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

      if (!req.file) {
        if (isRequired) {
          return res.status(400).json({
            success: false,
            message: `El archivo en el campo '${fieldName}' es obligatorio`,
          });
        }
        return next();
      }

      try {
        const requestedFolder = String(req.body.folder || '').replace(/[^a-zA-Z0-9/_-]/g, '');
        const uploadFolder = requestedFolder || folderName;
        const uploadResult = await uploadFromBuffer(req.file.buffer, uploadFolder, req.file.originalname);
        req.body[`${fieldName}_url`] = uploadResult.secure_url;
        req.body[`${fieldName}_public_id`] = uploadResult.public_id;
        req.cloudinaryUpload = toAssetMetadata(uploadResult, req.file.mimetype);
        return next();
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
