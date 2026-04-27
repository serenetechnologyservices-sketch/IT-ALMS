const router = require('express').Router();
const c = require('../controllers/approvalController');
const roleGuard = require('../middleware/roleGuard');
router.put('/:id', roleGuard('Reporting Manager', 'Admin'), c.process);
module.exports = router;
