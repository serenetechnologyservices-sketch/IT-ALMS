const router = require('express').Router();
const c = require('../controllers/subMasterController');
const roleGuard = require('../middleware/roleGuard');

router.get('/types', c.listTypes);
router.get('/type/:type', c.listByType);
router.get('/', c.listAll);
router.post('/', roleGuard('Admin'), c.create);
router.put('/:id', roleGuard('Admin'), c.update);
router.delete('/:id', roleGuard('Admin'), c.remove);

module.exports = router;
