"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Product_controller_1 = require("../controllers/Product.controller");
const router = express_1.default.Router();
router.get('/', Product_controller_1.getAllProducts);
router.post('/', Product_controller_1.addProduct);
router.get('/best-selling', Product_controller_1.getBestSellingProduct);
router.get('/:id', Product_controller_1.getProductById); // Thêm dòng này để xử lý lấy 1 sản phẩm theo ID
router.put('/update-variant-stock', Product_controller_1.updateVariantStock);
router.put('/:id', Product_controller_1.updateProduct);
router.put('/update-stock', Product_controller_1.updateProductStock); // Cập nhật số lượng sản phẩm đơn lẻ
router.put('/update-multiple-stock', Product_controller_1.updateMultipleProductsStock); // Cập nhật số lượng nhiều sản phẩm
exports.default = router;
