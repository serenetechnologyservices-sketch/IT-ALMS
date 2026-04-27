const router = require('express').Router();
const c = require('../controllers/qrController');
router.get('/scan/:code', c.scan);
module.exports = router;
