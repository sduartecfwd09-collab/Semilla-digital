// ============================================================
// Middleware: uploadRecetaImage
// Descripción: Recibe un archivo `image` en memoria (multer)
// con límite de 3MB y filtro a image/*. El controlador decide
// si lo sube a Cloudinary.
// ============================================================
'use strict';
const multer = require('multer');

const storage = multer.memoryStorage();

const uploadRecetaImage = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) return cb(null, true);
    return cb(null, false);
  },
}).single('image');

const handleRecetaImageUpload = (req, res, next) => {
  uploadRecetaImage(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'La imagen no puede superar 3MB' });
    }
    return res.status(400).json({ success: false, message: err.message || 'Error al procesar la imagen' });
  });
};

module.exports = { handleRecetaImageUpload };
