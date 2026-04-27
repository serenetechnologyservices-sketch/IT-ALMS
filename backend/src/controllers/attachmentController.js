const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Ticket, TicketAttachment } = require('../models');

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

const uploadDir = path.join(__dirname, '../../uploads/tickets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) cb(null, true);
    else cb(new Error('File type not allowed. Allowed: images, PDF, documents.'));
  },
}).single('file');

exports.upload = async (req, res, next) => {
  const ticket = await Ticket.findByPk(req.params.id);
  if (!ticket) return res.status(404).json({ success: false, error: 'Ticket not found.' });

  upload(req, res, async (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') return res.status(400).json({ success: false, error: 'File exceeds maximum size of 10 MB.' });
      return res.status(400).json({ success: false, error: err.message });
    }
    if (!req.file) return res.status(400).json({ success: false, error: 'No file provided.' });
    try {
      const attachment = await TicketAttachment.create({
        ticket_id: ticket.id, file_name: req.file.originalname,
        file_path: req.file.path, file_type: req.file.mimetype,
        file_size: req.file.size, uploaded_by: req.user.id,
      });
      res.status(201).json({ success: true, data: attachment });
    } catch (e) { next(e); }
  });
};

exports.list = async (req, res, next) => {
  try {
    const attachments = await TicketAttachment.findAll({
      where: { ticket_id: req.params.id },
      order: [['created_at', 'DESC']],
    });
    res.json({ success: true, data: attachments });
  } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try {
    const att = await TicketAttachment.findOne({ where: { id: req.params.aid, ticket_id: req.params.id } });
    if (!att) return res.status(404).json({ success: false, error: 'Attachment not found.' });
    if (fs.existsSync(att.file_path)) fs.unlinkSync(att.file_path);
    await att.destroy();
    res.json({ success: true, message: 'Attachment deleted.' });
  } catch (err) { next(err); }
};

// Export for validation reuse
exports.ALLOWED_TYPES = ALLOWED_TYPES;
exports.MAX_SIZE = MAX_SIZE;
