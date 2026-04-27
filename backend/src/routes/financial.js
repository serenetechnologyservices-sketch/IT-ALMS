const router = require('express').Router();
const c = require('../controllers/financialController');
const roleGuard = require('../middleware/roleGuard');

router.get('/asset/:id', roleGuard('Admin', 'CIO'), c.assetFinancials);
router.get('/summary', roleGuard('Admin', 'CIO'), c.summary);

module.exports = router;
