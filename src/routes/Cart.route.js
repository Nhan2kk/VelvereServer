"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Cart_controller_1 = require("../controllers/Cart.controller");
const router = express_1.default.Router();
// GET /api/cart - Get current user's cart
router.get('/', Cart_controller_1.getCart);
// PUT /api/cart - Update current user's cart (dùng PUT thay vì POST để đúng chuẩn REST khi update)
router.put('/', Cart_controller_1.updateCart);
// DELETE /api/cart - Clear current user's cart
router.delete('/', Cart_controller_1.clearCart);
exports.default = router;
