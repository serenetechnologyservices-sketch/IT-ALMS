const router = require('express').Router();
const c = require('../controllers/ticketController');
const att = require('../controllers/attachmentController');
const wp = require('../controllers/workProgressController');
const parts = require('../controllers/partsController');
const ack = require('../controllers/acknowledgementController');
const esc = require('../controllers/escalationController');
const roleGuard = require('../middleware/roleGuard');
router.get('/', c.list);
router.get('/:id', c.getById);
router.post('/', c.create);
router.put('/:id', c.updateStatus);
router.put('/:id/assign', roleGuard('Admin', 'Service Partner', 'Service Engineer'), c.assign);
router.put('/:id/rca', c.updateRca);
// Attachments
router.post('/:id/attachments', att.upload);
router.get('/:id/attachments', att.list);
router.delete('/:id/attachments/:aid', att.delete);
// Work Progress
router.post('/:id/work-progress', wp.addWorkProgress);
router.get('/:id/work-progress', wp.listWorkProgress);
// Parts
router.post('/:id/parts', parts.addPart);
router.get('/:id/parts', parts.listParts);
router.put('/:id/parts/:pid', parts.updatePartStatus);
// Acknowledgement
router.post('/:id/acknowledgement', ack.submit);
router.get('/:id/acknowledgement', ack.get);
// Escalation
router.post('/:id/escalate', esc.escalate);
router.get('/:id/escalations', esc.listEscalations);
module.exports = router;
