const router = require('express').Router();
const c = require('../controllers/allocationController');
const roleGuard = require('../middleware/roleGuard');

router.get('/', c.list);
router.post('/', roleGuard('Admin'), c.allocate);
router.post('/transfer', roleGuard('Admin'), c.transfer);
router.post('/return', roleGuard('Admin'), c.returnAsset);
router.post('/scrap', roleGuard('Admin'), c.scrap);

module.exports = router;
