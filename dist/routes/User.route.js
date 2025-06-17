"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const User_controller_1 = require("../controllers/User.controller");
const router = (0, express_1.Router)();
// User management routes
router.get('/check-session', User_controller_1.checkSession);
router.post('/login', User_controller_1.loginUser);
router.post('/logout', User_controller_1.logoutUser);
router.get('/', User_controller_1.getAllUsers);
router.get('/:id', User_controller_1.getUserById);
router.post('/', User_controller_1.createUser);
router.put('/:id', User_controller_1.updateUser);
router.patch('/:id', User_controller_1.updateUser); // Thêm route PATCH để cập nhật một phần thông tin người dùng
router.delete('/:id', User_controller_1.deleteUser);
exports.default = router;
