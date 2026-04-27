const router = require('express').Router();
const c = require('../controllers/contractController');
const roleGuard = require('../middleware/roleGuard');
router.get('/expiring', roleGuard('Admin'), c.expiringAlerts);
router.get('/', c.list);
router.post('/', roleGuard('Admin'), c.create);
router.put('/:id', roleGuard('Admin'), c.update);
router.delete('/:id', roleGuard('Admin'), c.remove);
module.exports = router;
