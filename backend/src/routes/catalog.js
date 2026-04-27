const router = require('express').Router();
const c = require('../controllers/catalogController');
const roleGuard = require('../middleware/roleGuard');
router.get('/', c.list);
router.post('/', roleGuard('Admin'), c.create);
router.put('/:id', roleGuard('Admin'), c.update);
router.delete('/:id', roleGuard('Admin'), c.remove);
module.exports = router;
