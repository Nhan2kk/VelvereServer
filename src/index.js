"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_1 = __importDefault(require("connect-mongo"));
const Product_route_1 = __importDefault(require("./routes/Product.route"));
const User_route_1 = __importDefault(require("./routes/User.route"));
const Order_route_1 = __importDefault(require("./routes/Order.route"));
const Chat_route_1 = __importDefault(require("./routes/Chat.route"));
const Cart_route_1 = __importDefault(require("./routes/Cart.route"));
dotenv_1.default.config();
const app = (0, express_1.default)();
// Cấu hình CORS với hỗ trợ credentials
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
    'https://velvere.vercel.app',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Cho phép requests không có origin (như mobile apps hoặc curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, origin);
        }
        else {
            console.log(`Origin ${origin} không được phép`);
            callback(null, allowedOrigins[2]); // Fallback to first allowed origin
        }
    },
    credentials: true, // Quan trọng: cho phép gửi cookies qua CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express_1.default.json());
// Kết nối MongoDB
const MONGO_URI = process.env.MONGO_URI;
mongoose_1.default
    .connect(MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch((err) => console.error('❌ MongoDB error:', err));
// Cấu hình session
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your_session_secret',
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_1.default.create({
        mongoUrl: MONGO_URI,
        ttl: 24 * 60 * 60,                                  // Thời gian sống của session: 1 ngày (tính bằng giây)
        autoRemove: 'native',                               // Tự động xóa session hết hạn
    }),
    cookie: {
        httpOnly: true, // Không cho phép JavaScript truy cập cookie
        secure: process.env.NODE_ENV === 'production', // Chỉ sử dụng HTTPS trong production
        maxAge: 24 * 60 * 60 * 1000, // Thời gian sống của cookie: 1 ngày (tính bằng mili giây)
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Cấu hình SameSite
    },
}));
// Route API theo tài nguyên
app.use('/api/products', Product_route_1.default);
app.use('/api/users', User_route_1.default);
app.use('/api/orders', Order_route_1.default);
app.use('/api/chat', Chat_route_1.default);
app.use('/api/cart', Cart_route_1.default);
// Error handling middleware - SỬA LỖI Ở ĐÂY
app.use((
// eslint-disable-next-line @typescript-eslint/no-explicit-any
err, req, res, next) => {
    console.error('Server error:', err);
    if (res.headersSent) {
        return next(err); // Delegate to the default error handler if headers are already sent
    }
    res.status(500).json({
        message: 'Lỗi server',
        error: process.env.NODE_ENV === 'production' ? {} : err,
    });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Server running at port ${PORT}`);
});
exports.default = app;
