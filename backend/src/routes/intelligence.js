const router = require('express').Router();
const c = require('../controllers/intelligenceController');
const roleGuard = require('../middleware/roleGuard');

router.get('/health/:assetId', roleGuard('Admin', 'CIO', 'Employee', 'Reporting Manager'), c.healthScore);
router.get('/alerts', roleGuard('Admin', 'CIO'), c.alerts);
router.get('/cost-insights', roleGuard('Admin', 'CIO'), c.costInsights);

module.exports = router;
