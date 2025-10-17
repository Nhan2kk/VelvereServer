// ✅ PRODUCT ROUTES SAU KHI FIX
import express from 'express';
import {
    getAllProducts,
    getProductById,
    addProduct,
    updateProduct,
    updateProductStock,
    updateMultipleProductsStock,
    getBestSellingProduct,
    updateVariantStock,
} from '../controllers/Product.controller';

const router = express.Router();

// 1️⃣ Chức năng đặc biệt phải đặt TRƯỚC ID
router.get('/best-selling', getBestSellingProduct);
router.put('/update-variant-stock', updateVariantStock);
router.put('/update-stock', updateProductStock);
router.put('/update-multiple-stock', updateMultipleProductsStock);

// 2️⃣ CRUD thông thường
router.get('/', getAllProducts);
router.post('/', addProduct);

// 3️⃣ 🚨 Đặt cuối cùng để tránh nuốt route
router.get('/:id', getProductById);
router.put('/:id', updateProduct);

export default router;
