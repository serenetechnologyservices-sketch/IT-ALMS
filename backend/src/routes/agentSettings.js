const router = require('express').Router();
const c = require('../controllers/agentSettingsController');
const roleGuard = require('../middleware/roleGuard');

router.get('/', c.get);
router.put('/', roleGuard('Admin'), c.update);
router.get('/agent-config', c.getForAgent); // called by Go agent

module.exports = router;
