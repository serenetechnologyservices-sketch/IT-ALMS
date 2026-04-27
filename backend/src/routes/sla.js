const router = require('express').Router();
const c = require('../controllers/slaController');
const roleGuard = require('../middleware/roleGuard');

// SLA Master CRUD
router.get('/master', c.listSla);
router.post('/master', roleGuard('Admin'), c.createSla);
router.put('/master/:id', roleGuard('Admin'), c.updateSla);
router.delete('/master/:id', roleGuard('Admin'), c.deleteSla);

// SLA Tracking
router.get('/ticket/:ticketId', c.getTicketSla);
router.get('/reports', c.slaReports);
router.get('/insights', roleGuard('Admin', 'CIO'), c.slaInsights);

module.exports = router;
