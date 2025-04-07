const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../middleware/authController');

router.post('/signup', authController.signupUser);

router.post('/login', authController.loginUser);

router.post('/', userController.createUser);

router.get('/', userController.getAllUsers);

module.exports = router;