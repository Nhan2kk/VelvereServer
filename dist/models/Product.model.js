"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
// Variant schema
const variantSchema = new mongoose_1.Schema({
    size: { type: String, required: true, trim: true },
    color: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0 },
}, { _id: false });
// Product schema
const productSchema = new mongoose_1.Schema({
    product_id: { type: String, required: true, unique: true, trim: true },
    product_name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category_id: {
        type: String,
        required: true,
        trim: true,
        default: 'Áo len',
    },
    sex: { type: String, required: true, trim: true, default: 'Nam' },
    images: { type: [String], required: true, default: [] },
    price: { type: Number, required: true, min: 0 },
    xuatXu: { type: String, required: true, trim: true },
    chatLieu: { type: String, required: true, trim: true },
    variants: { type: [variantSchema], required: true, default: [] },
}, {
    collection: 'Products',
    timestamps: true, // Add createdAt and updatedAt fields
});
// Index for product_id
productSchema.index({ product_id: 1 }, { unique: true });
// Export the model
exports.default = mongoose_1.default.model('Product', productSchema);
