const router = require('express').Router();
const ea = require('../controllers/entityAttachmentController');

// Catalog attachments
router.post('/catalog/:id/attachments', ea.upload('catalog'));
router.get('/catalog/:id/attachments', ea.list('catalog'));
router.delete('/catalog/:id/attachments/:aid', ea.delete('catalog'));

// Allocation attachments
router.post('/allocations/:id/attachments', ea.upload('allocation'));
router.get('/allocations/:id/attachments', ea.list('allocation'));
router.delete('/allocations/:id/attachments/:aid', ea.delete('allocation'));

// Vendor attachments
router.post('/vendors/:id/attachments', ea.upload('vendor'));
router.get('/vendors/:id/attachments', ea.list('vendor'));
router.delete('/vendors/:id/attachments/:aid', ea.delete('vendor'));

// Contract attachments
router.post('/contracts/:id/attachments', ea.upload('contract'));
router.get('/contracts/:id/attachments', ea.list('contract'));
router.delete('/contracts/:id/attachments/:aid', ea.delete('contract'));

// Service Partner attachments
router.post('/service-partners/:id/attachments', ea.upload('service_partner'));
router.get('/service-partners/:id/attachments', ea.list('service_partner'));
router.delete('/service-partners/:id/attachments/:aid', ea.delete('service_partner'));

// User attachments
router.post('/users/:id/attachments', ea.upload('user'));
router.get('/users/:id/attachments', ea.list('user'));
router.delete('/users/:id/attachments/:aid', ea.delete('user'));

module.exports = router;
