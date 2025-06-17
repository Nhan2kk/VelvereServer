"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Order_controller_1 = require("../controllers/Order.controller");
const router = (0, express_1.Router)();
// Routes quản lý đơn hàng
router.get("/", Order_controller_1.getRevenueStats);
router.get('/all', Order_controller_1.getAllOrders); // GET     /api/orders
router.get('/min-max-total', Order_controller_1.getMinMaxOrderTotalAmount);
router.get('/user/:userId', Order_controller_1.getOrdersByUserId); // GET     /api/orders/user/:userId
router.get('/:id', Order_controller_1.getOrderById); // GET     /api/orders/:id
router.post('/', Order_controller_1.createOrder); // POST    /api/orders
router.put('/:id/status', Order_controller_1.updateOrderStatus); // PUT     /api/orders/:id/status
router.put('/:id/cancel', Order_controller_1.cancelOrder); // PUT     /api/orders/:id/cancel
exports.default = router;
