const router = require('express').Router();
const c = require('../controllers/assetController');
const roleGuard = require('../middleware/roleGuard');

router.get('/categories', c.categories);
router.get('/', c.list);
router.get('/:id', c.getById);
router.get('/:id/timeline', c.timeline);
router.post('/', roleGuard('Admin'), c.create);
router.put('/:id', roleGuard('Admin'), c.update);
router.delete('/:id', roleGuard('Admin'), c.remove);

module.exports = router;
