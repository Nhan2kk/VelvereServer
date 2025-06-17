"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const userSchema = new mongoose_1.default.Schema({
    user_id: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    birthDate: { type: Date, required: true },
    email: { type: String, required: true, unique: true, index: true },
    phone: { type: String, required: true, unique: true, index: true },
    address: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    currentSessionId: { type: String, default: null, index: true },
}, { timestamps: true });
const User = mongoose_1.default.model('User', userSchema, 'Users');
exports.default = User;
