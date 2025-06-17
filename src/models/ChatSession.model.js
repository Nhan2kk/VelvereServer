"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatSessionSchema = new mongoose_1.default.Schema({
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Có thể null nếu là khách không đăng nhập
    },
    user_name: {
        type: String,
        required: true, // Tên người dùng hoặc "Khách"
    },
    user_email: {
        type: String,
        required: false,
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active',
    },
    last_message: {
        type: Date,
        default: Date.now,
    },
    assigned_admin: {
        type: String,
        required: false, // ID của admin được gán xử lý chat này
    },
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
});
// Tạo index cho các trường tìm kiếm phổ biến
chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ user_id: 1 });
chatSessionSchema.index({ last_message: -1 });
exports.default = mongoose_1.default.model('ChatSession', chatSessionSchema, 'ChatSessions');
