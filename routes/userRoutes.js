const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../middleware/authController');
const authenticateToken = require('../middleware/user-auth');

router.post('/signup', authController.signupUser);

router.post('/login', authController.loginUser);

router.get('/logout', authenticateToken, authController.logout);

// router.post('/', userController.createUser);

router.get('/', userController.getAllUsers);

router.post("/admin/get-users", userController.getUsers);

router.post("/admin/set-role", userController.setUserRole);

router.get("/admin/get-roles", userController.getCurrentRoles);

router.post("/admin/setHierarchy", userController.setNewHierarchy);



module.exports = router;