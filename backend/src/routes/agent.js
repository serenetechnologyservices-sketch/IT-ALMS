const router = require('express').Router();
const c = require('../controllers/agentController');
router.post('/software', c.pushSoftware);
router.post('/usage', c.pushUsage);
router.post('/logs', c.pushLogs);
router.get('/', c.getLogs);
module.exports = router;
