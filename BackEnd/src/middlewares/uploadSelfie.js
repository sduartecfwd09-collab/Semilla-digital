'use strict';
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const userId = req.body.usuario_id || 'temp';
    const dir = path.join(__dirname, '../../storage/selfies', String(userId));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    const ext = file.mimetype === 'image/png' ? 'png' : 'jpg';
    cb(null, `selfie_${Date.now()}.${ext}`);
  },
});

const uploadSelfie = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    cb(null, file.mimetype.startsWith('image/'));
  },
}).single('selfie');

const handleSelfieUpload = (req, res, next) => {
  uploadSelfie(req, res, (err) => {
    if (!err) return next();
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'La selfie no puede superar 5MB' });
    }
    return res.status(400).json({ success: false, message: err.message || 'Error al subir la selfie' });
  });
};

module.exports = { handleSelfieUpload };
