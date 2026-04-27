const router = require('express').Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.post('/register', auth, authController.register);
router.get('/me', auth, authController.me);

module.exports = router;
