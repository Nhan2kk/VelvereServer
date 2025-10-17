"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBestSellingProduct = exports.updateMultipleProductsStock = exports.updateProductStock = exports.placeOrder = exports.updateVariantStock = exports.updateProduct = exports.addProduct = exports.getProductById = exports.getAllProducts = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const Product_model_1 = __importDefault(require("../models/Product.model")); // Đảm bảo đường dẫn đúng
const Order_model_1 = __importDefault(require("../models/Order.model"));
const generateProductId = async () => {
    // Tìm sản phẩm có product_id lớn nhất
    const lastProduct = await Product_model_1.default.findOne({})
        .sort({ product_id: -1 }) // sắp xếp giảm dần theo product_id
        .lean();
    let nextNumber = 1;
    if (lastProduct && lastProduct.product_id) {
        const match = lastProduct.product_id.match(/PROD(\d+)/);
        if (match && match[1]) {
            nextNumber = parseInt(match[1], 10) + 1;
        }
    }
    // Format lại với padding 0: PROD0001
    return `PROD${nextNumber.toString().padStart(4, '0')}`;
};
// Get all products
const getAllProducts = async (req, res) => {
    try {
        const products = await Product_model_1.default.find();
        res.status(200).json(products);
    }
    catch (err) {
        console.error('Lỗi server khi lấy sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.getAllProducts = getAllProducts;
// Get product by ID
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = await Product_model_1.default.findById(id);
        if (!product || !product.variants || product.variants.length === 0) {
            res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một biến thể hợp lệ.',
            });
        }
        res.status(200).json(product);
    }
    catch (err) {
        console.error('Lỗi server khi lấy sản phẩm theo ID:', err);
        res.status(500).json({
            message: 'Lỗi server',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.getProductById = getProductById;
// Add a new product
const addProduct = async (req, res) => {
    try {
        const { product_name, description, category_id, sex, images, price, xuatXu, chatLieu, variants, } = req.body;
        // Validate required fields
        if (!product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some((v) => !v.size || !v.color || v.stock < 0) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img) => img.trim() !== '').length === 0) {
            res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một size hợp lệ.',
            });
            return;
        }
        // Generate a unique product_id
        const product_id = generateProductId();
        // Create a new product
        const newProduct = new Product_model_1.default({
            product_id,
            product_name,
            description,
            category_id,
            sex,
            images: images.filter((img) => img.trim() !== ''),
            price: Number(price),
            xuatXu,
            chatLieu,
            variants: variants.map((v) => ({
                size: v.size,
                color: v.color,
                stock: Number(v.stock),
            })),
        });
        // Save the product
        const savedProduct = await newProduct.save();
        res.status(201).json({
            message: 'Sản phẩm đã được thêm thành công',
            product: savedProduct,
        });
    }
    catch (err) {
        console.error('Lỗi khi thêm sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi thêm sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.addProduct = addProduct;
// Update an existing product
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, description, category_id, sex, images, price, xuatXu, chatLieu, variants, } = req.body;
        // Validate required fields
        if (!product_name?.trim() ||
            !description?.trim() ||
            !category_id ||
            !sex ||
            !price ||
            price <= 0 ||
            !xuatXu?.trim() ||
            !chatLieu?.trim() ||
            !variants ||
            !Array.isArray(variants) ||
            variants.length === 0 ||
            variants.some((v) => !v.size || !v.color || v.stock < 0) ||
            !images ||
            !Array.isArray(images) ||
            images.filter((img) => img.trim() !== '').length === 0) {
            res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin hợp lệ, bao gồm ít nhất một ảnh và một biến thể hợp lệ.',
            });
            return;
        }
        // Find the product by _id instead of product_id
        const product = await Product_model_1.default.findById(id);
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        // Update the product fields
        product.product_name = product_name;
        product.description = description;
        product.category_id = category_id;
        product.sex = sex;
        product.images = images.filter((img) => img.trim() !== '');
        product.price = Number(price);
        product.xuatXu = xuatXu;
        product.chatLieu = chatLieu;
        product.variants = variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: Number(v.stock),
        }));
        // Save the updated product
        const updatedProduct = await product.save();
        res.status(200).json({
            message: 'Sản phẩm đã được cập nhật thành công',
            product: updatedProduct,
        });
    }
    catch (err) {
        console.error('Lỗi khi cập nhật sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.updateProduct = updateProduct;
const updateVariantStock = async (req, res) => {
    try {
        const { product_id, size, color, quantity } = req.body; // Sử dụng quantity thay vì stock
        // Kiểm tra dữ liệu đầu vào
        if (!product_id || !size || !color || quantity === undefined) {
            res.status(400).json({
                message: 'Vui lòng cung cấp đầy đủ thông tin: product_id, size, color và quantity.',
            });
            return;
        }
        const product = await Product_model_1.default.findOne({ product_id });
        if (!product) {
            res.status(404).json({
                message: `Không tìm thấy sản phẩm với product_id: ${product_id}`,
            });
            return;
        }
        const variant = product.variants.find((v) => v.size === size && v.color === color);
        if (!variant) {
            res.status(404).json({
                message: `Không tìm thấy biến thể với size: ${size} và color: ${color}`,
            });
            return;
        }
        // Kiểm tra số lượng tồn kho
        if (variant.stock < quantity) {
            res.status(400).json({
                message: `Số lượng trong kho không đủ. Còn ${variant.stock} sản phẩm.`,
            });
            return;
        }
        // Giảm số lượng tồn kho
        variant.stock -= Number(quantity);
        await product.save();
        res.status(200).json({
            message: 'Cập nhật số lượng tồn kho thành công',
            product_id,
            size,
            color,
            stock: variant.stock,
        });
    }
    catch (err) {
        console.error('Lỗi khi cập nhật số lượng tồn kho:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng tồn kho',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.updateVariantStock = updateVariantStock;
// Place an order
const placeOrder = async (req, res) => {
    const session = await mongoose_1.default.startSession();
    session.startTransaction();
    try {
        // eslint-disable-next-line
        const { items } = req.body; // items: [{ productId, size, color, quantity }]
        for (const item of req.body.items) {
            const product = await Product_model_1.default.findById(item.productId);
            if (!product) {
                res.status(404).json({
                    message: `Sản phẩm với ID ${item.productId} không tồn tại.`,
                });
                return;
            }
            // Tìm biến thể phù hợp
            const variant = product.variants.find((v) => v.size === item.size && v.color === item.color);
            if (!variant) {
                res.status(400).json({
                    message: `Không tìm thấy biến thể với size ${item.size} và color ${item.color}.`,
                });
                return;
            }
            // Kiểm tra tồn kho
            if (variant.stock < item.quantity) {
                res.status(400).json({
                    message: `Sản phẩm ${product.product_name} với size ${item.size} và color ${item.color} không đủ hàng tồn kho.`,
                });
                return;
            }
            // Giảm số lượng tồn kho
            variant.stock -= item.quantity;
            await product.save();
        }
        // Commit transaction
        await session.commitTransaction();
        session.endSession();
        res.status(200).json({ message: 'Đặt hàng thành công' });
    }
    catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({
            message: error instanceof Error ? error.message : 'Lỗi không xác định',
        });
    }
};
exports.placeOrder = placeOrder;
// Update stock for a single product
const updateProductStock = async (req, res) => {
    try {
        const { productId, size, color, quantity } = req.body;
        if (!productId ||
            !size ||
            !color ||
            quantity === undefined ||
            quantity === null) {
            res.status(400).json({
                message: 'Thiếu thông tin cần thiết: productId, size, color, quantity',
            });
            return;
        }
        if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
            res.status(400).json({ message: 'ID sản phẩm không hợp lệ' });
            return;
        }
        const product = (await Product_model_1.default.findById(productId));
        if (!product) {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
            return;
        }
        const variantIndex = product.variants.findIndex((variant) => variant.size === size && variant.color === color);
        if (variantIndex === -1) {
            res.status(404).json({
                message: 'Không tìm thấy biến thể của sản phẩm với size và color đã chọn',
            });
            return;
        }
        if (quantity > 0 && product.variants[variantIndex].stock < quantity) {
            res.status(400).json({
                message: 'Số lượng trong kho không đủ',
                available: product.variants[variantIndex].stock,
            });
            return;
        }
        product.variants[variantIndex].stock -= quantity;
        await product.save();
        res.status(200).json({
            message: 'Cập nhật số lượng sản phẩm thành công',
            updatedStock: product.variants[variantIndex].stock,
        });
    }
    catch (err) {
        console.error('Lỗi khi cập nhật số lượng sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi cập nhật số lượng sản phẩm',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.updateProductStock = updateProductStock;
// Update stock for multiple products
const updateMultipleProductsStock = async (req, res) => {
    try {
        const { items } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            res.status(400).json({
                message: 'Danh sách sản phẩm không hợp lệ',
            });
            return;
        }
        const updateResults = [];
        let hasError = false;
        for (const item of items) {
            const { productId, size, color, quantity } = item;
            if (!productId ||
                !size ||
                !color ||
                quantity === undefined ||
                quantity === null) {
                updateResults.push({
                    productId: productId || 'unknown',
                    success: false,
                    message: 'Thiếu thông tin cần thiết cho sản phẩm trong danh sách',
                });
                hasError = true;
                continue;
            }
            if (!mongoose_1.default.Types.ObjectId.isValid(productId)) {
                updateResults.push({
                    productId,
                    success: false,
                    message: 'ID sản phẩm không hợp lệ',
                });
                hasError = true;
                continue;
            }
            try {
                const product = (await Product_model_1.default.findById(productId));
                if (!product) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Không tìm thấy sản phẩm',
                    });
                    hasError = true;
                    continue;
                }
                const variantIndex = product.variants.findIndex((variant) => variant.size === size && variant.color === color);
                if (variantIndex === -1) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: 'Không tìm thấy biến thể sản phẩm với size và color đã chọn',
                    });
                    hasError = true;
                    continue;
                }
                if (quantity > 0 &&
                    product.variants[variantIndex].stock < quantity) {
                    updateResults.push({
                        productId,
                        success: false,
                        message: `Số lượng trong kho không đủ (${product.variants[variantIndex].stock} có sẵn)`,
                        available: product.variants[variantIndex].stock,
                    });
                    hasError = true;
                    continue;
                }
                product.variants[variantIndex].stock -= quantity;
                await product.save();
                updateResults.push({
                    productId,
                    success: true,
                    updatedStock: product.variants[variantIndex].stock,
                });
            }
            catch (err) {
                console.error(`Lỗi khi cập nhật sản phẩm ${item.productId}:`, err);
                updateResults.push({
                    productId,
                    success: false,
                    message: 'Lỗi server khi xử lý sản phẩm',
                });
                hasError = true;
            }
        }
        if (hasError) {
            res.status(207).json({
                message: 'Đã xử lý yêu cầu, nhưng có lỗi xảy ra với một số sản phẩm',
                results: updateResults,
            });
        }
        else {
            res.status(200).json({
                message: 'Cập nhật số lượng tất cả sản phẩm thành công',
                results: updateResults,
            });
        }
    }
    catch (err) {
        console.error('Lỗi server khi cập nhật số lượng nhiều sản phẩm:', err);
        res.status(500).json({
            message: 'Lỗi server khi xử lý yêu cầu cập nhật số lượng',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.updateMultipleProductsStock = updateMultipleProductsStock;
// Get best-selling products
const getBestSellingProduct = async (req, res) => {
    try {
        const { timeRange = 'month', category = 'all', search = '', } = req.query;
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setMonth(now.getMonth() - 1);
        }
        // eslint-disable-next-line
        const orders = await Order_model_1.default.find({
            orderDate: { $gte: startDate, $lte: now },
            status: { $nin: ['cancelled'] },
        }).lean();
        //eslint-disable-next-line @typescript-eslint/no-explicit-any
        const productQuery = {};
        if (category !== 'all') {
            productQuery.category_id = category;
        }
        if (search) {
            productQuery.$or = [
                { product_name: { $regex: search, $options: 'i' } },
                { product_id: { $regex: search, $options: 'i' } },
            ];
        }
        const products = await Product_model_1.default.find(productQuery).lean();
        const enrichedProducts = await Promise.all(products.map(async (product) => {
            const id = product.product_id?.toString() ||
                product._id.toString();
            const stats = await Order_model_1.default.aggregate([
                { $match: { 'items.product_id': id } },
                { $unwind: '$items' },
                { $match: { 'items.product_id': id } },
                {
                    $group: {
                        _id: '$items.product_id',
                        totalQuantity: { $sum: '$items.quantity' },
                        totalRevenue: {
                            $sum: {
                                $multiply: [
                                    '$items.quantity',
                                    '$items.price',
                                ],
                            },
                        },
                    },
                },
            ]);
            const statsResult = stats.length > 0
                ? stats[0]
                : { totalQuantity: 0, totalRevenue: 0 };
            return {
                id,
                name: product.product_name,
                category: product.category_id,
                price: product.price,
                sold: statsResult.totalQuantity,
                revenue: statsResult.totalRevenue,
                stock: product.variants.reduce((sum, v) => sum + (v.stock || 0), 0),
                image: getImage(product.images),
            };
        }));
        enrichedProducts.sort((a, b) => b.sold - a.sold);
        const categoryStats = enrichedProducts.reduce((acc, p) => {
            if (!acc[p.category]) {
                acc[p.category] = { name: p.category, value: 0 };
            }
            acc[p.category].value += p.sold;
            return acc;
        }, {});
        const categoryData = Object.values(categoryStats).sort((a, b) => b.value - a.value);
        const summary = {
            totalProducts: products.length,
            totalSold: enrichedProducts.reduce((sum, p) => sum + p.sold, 0),
            totalRevenue: enrichedProducts.reduce((sum, p) => sum + p.revenue, 0),
            totalCategories: categoryData.length,
        };
        res.status(200).json({
            products: enrichedProducts,
            categories: categoryData,
            summary,
        });
    }
    catch (err) {
        console.error('Lỗi khi lấy sản phẩm bán chạy:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy sản phẩm bán chạy',
            error: err instanceof Error ? err.message : 'Unknown error',
        });
    }
};
exports.getBestSellingProduct = getBestSellingProduct;
// Helper: Get first non-video image
function getImage(images) {
    if (!images || images.length === 0)
        return null;
    const firstImage = images[0];
    if (isVideo(firstImage)) {
        return images[1] || null;
    }
    return firstImage;
}
// Helper: Check if URL is a video
function isVideo(url) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.mkv'];
    return videoExtensions.some((extension) => url.toLowerCase().endsWith(extension));
}
