"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Product = void 0;
// Product.model.ts
const mongoose_1 = require("mongoose");
const VariantSchema = new mongoose_1.Schema({
    size: { type: String, required: true },
    color: { type: String, required: true },
    stock: { type: Number, required: true },
});
const ProductSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    variants: [VariantSchema],
});
exports.Product = (0, mongoose_1.model)('Product', ProductSchema);
