"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const chatMessageSchema = new mongoose_1.default.Schema({
    session_id: {
        type: String,
        required: true,
        index: true,
    },
    user_id: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: false, // Có thể null nếu là khách không đăng nhập
    },
    sender_type: {
        type: String,
        enum: ['user', 'admin', 'system'],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    read: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true, // Tự động tạo createdAt và updatedAt
});
exports.default = mongoose_1.default.model('ChatMessage', chatMessageSchema, 'ChatMessages');
