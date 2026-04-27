const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { EntityAttachment } = require('../models');

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 10 * 1024 * 1024;

const uploadDir = path.join(__dirname, '../../uploads/entities');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage, limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed. Allowed: images, PDF, documents.'));
  },
}).single('file');

exports.upload = (entityType) => async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: 'File exceeds maximum size of 10 MB.' });
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided.' });
    try {
      const att = await EntityAttachment.create({
        entity_type: entityType, entity_id: req.params.id,
        file_name: req.file.originalname, file_path: req.file.path,
        file_type: req.file.mimetype, file_size: req.file.size,
        uploaded_by: req.user.id,
      });
      res.status(201).json({ success: true, data: att });
    } catch (e) { next(e); }
  });
};

exports.list = (entityType) => async (req, res, next) => {
  try {
    const atts = await EntityAttachment.findAll({
      where: { entity_type: entityType, entity_id: req.params.id },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: atts });
  } catch (err) { next(err); }
};

exports.delete = (entityType) => async (req, res, next) => {
  try {
    const att = await EntityAttachment.findOne({
      where: { id: req.params.aid, entity_type: entityType, entity_id: req.params.id },
    });
    if (!att) return res.status(404).json({ success: false, error: 'Attachment not found.' });
    if (fs.existsSync(att.file_path)) fs.unlinkSync(att.file_path);
    await att.destroy();
    res.json({ success: true, message: 'Attachment deleted.' });
  } catch (err) { next(err); }
};
