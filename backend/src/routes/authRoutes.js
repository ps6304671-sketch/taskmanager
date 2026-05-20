const express = require('express');
const router = express.Router();
const { signupUser, loginUser, getMe, getUsers } = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { adminOnly } = require('../middlewares/roleMiddleware');

router.post('/signup', protect, adminOnly, signupUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.get('/users', protect, getUsers);

module.exports = router;
