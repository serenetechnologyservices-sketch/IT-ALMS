const router = require('express').Router();
const c = require('../controllers/userController');
const roleGuard = require('../middleware/roleGuard');

router.get('/', c.list);
router.get('/:id', c.getById);
router.post('/', roleGuard('Admin'), c.create);
router.put('/:id', roleGuard('Admin'), c.update);
router.delete('/:id', roleGuard('Admin'), c.remove);

module.exports = router;
