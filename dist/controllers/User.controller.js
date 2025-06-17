"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = exports.logoutUser = exports.loginUser = exports.checkSession = exports.checkAuth = void 0;
const User_model_1 = __importDefault(require("../models/User.model"));
const mongoose_1 = __importDefault(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Helper function to check authentication
const checkAuth = async (req) => {
    if (!req.session || !req.session.userId) {
        return {
            authenticated: false,
            message: 'Bạn cần đăng nhập để truy cập.',
        };
    }
    // Validate ObjectId
    if (!mongoose_1.default.Types.ObjectId.isValid(req.session.userId)) {
        req.session.destroy((err) => {
            if (err)
                console.error('Lỗi khi hủy session không hợp lệ:', err);
        });
        return {
            authenticated: false,
            message: 'Phiên đăng nhập không hợp lệ.',
        };
    }
    try {
        const user = await User_model_1.default.findById(req.session.userId);
        if (!user) {
            req.session.destroy((err) => {
                if (err)
                    console.error('Lỗi khi hủy session không hợp lệ:', err);
            });
            return {
                authenticated: false,
                message: 'Người dùng không tồn tại hoặc phiên đăng nhập không hợp lệ.',
            };
        }
        // Check if the current session matches the one in the database
        if (user.currentSessionId && user.currentSessionId !== req.sessionID) {
            console.log(`Phát hiện phiên cũ không khớp ${user.currentSessionId} cho user ${user.email}. Phiên hiện tại: ${req.sessionID}. Đang hủy session cũ...`);
            req.sessionStore.destroy(user.currentSessionId, (err) => {
                if (err)
                    console.error('Lỗi khi hủy session cũ không khớp:', err);
                else
                    console.log(`Session cũ ${user.currentSessionId} đã bị hủy thành công.`);
            });
            await User_model_1.default.findByIdAndUpdate(user._id, {
                $set: { currentSessionId: null },
            });
            req.session.destroy((err) => {
                if (err)
                    console.error('Lỗi khi hủy session hiện tại không hợp lệ:', err);
            });
            return {
                authenticated: false,
                message: 'Phiên đăng nhập đã hết hạn hoặc bạn đã đăng nhập ở nơi khác. Vui lòng đăng nhập lại.',
            };
        }
        return {
            authenticated: true,
            user: {
                _id: user._id,
                isAdmin: user.isAdmin,
            },
        };
    }
    catch (error) {
        console.error('Lỗi server khi xác thực session:', error);
        req.session.destroy((err) => {
            if (err)
                console.error('Lỗi khi hủy session sau lỗi server:', err);
        });
        return { authenticated: false, message: 'Lỗi server khi xác thực.' };
    }
};
exports.checkAuth = checkAuth;
// Check session status
const checkSession = async (req, res) => {
    try {
        const authResult = await (0, exports.checkAuth)(req);
        if (!authResult.authenticated) {
            res.status(401).json({
                authenticated: false,
                message: authResult.message,
            });
            return;
        }
        const user = authResult.user
            ? await User_model_1.default.findById(authResult.user._id).select('-password -currentSessionId')
            : null;
        if (!user) {
            res.status(404).json({
                authenticated: false,
                message: 'Không tìm thấy thông tin người dùng',
            });
            return;
        }
        res.status(200).json({
            authenticated: true,
            user: {
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                address: user.address,
                isAdmin: user.isAdmin,
            },
        });
    }
    catch (err) {
        console.error('Lỗi server khi kiểm tra session:', err);
        res.status(500).json({
            authenticated: false,
            message: 'Lỗi server khi kiểm tra session',
            error: err,
        });
    }
};
exports.checkSession = checkSession;
// Login user
const loginUser = async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) {
            res.status(400).json({
                message: 'Vui lòng nhập số điện thoại và mật khẩu',
            });
            return;
        }
        const user = await User_model_1.default.findOne({ phone });
        if (!user) {
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({
                message: 'Số điện thoại hoặc mật khẩu không đúng',
            });
            return;
        }
        // Đảm bảo user._id tồn tại và hợp lệ
        if (!user._id ||
            !mongoose_1.default.Types.ObjectId.isValid(user._id.toString())) {
            res.status(500).json({
                message: 'Lỗi hệ thống: ID người dùng không hợp lệ',
            });
            return;
        }
        if (user.currentSessionId && req.sessionID !== user.currentSessionId) {
            console.log(`Phát hiện phiên cũ ${user.currentSessionId} cho user ${user.email}. Đang hủy...`);
            req.sessionStore.destroy(user.currentSessionId, (err) => {
                if (err)
                    console.error('Lỗi khi hủy session cũ:', err);
                console.log(`Session cũ ${user.currentSessionId} đã bị hủy.`);
            });
        }
        req.session.userId = user._id; // Đảm bảo gán user._id trực tiếp
        req.session.isAdmin = user.isAdmin;
        user.currentSessionId = req.sessionID;
        await user.save();
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ id: user._id, isAdmin: user.isAdmin }, process.env.JWT_SECRET || 'your_secret', { expiresIn: '1d' });
        res.status(200).json({
            message: 'Đăng nhập thành công.',
            user: {
                _id: user._id,
                user_id: user.user_id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                birthDate: user.birthDate,
                address: user.address,
                isAdmin: user.isAdmin,
            },
            token,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        console.error('Lỗi server khi đăng nhập:', err);
        res.status(500).json({
            message: 'Lỗi server khi đăng nhập',
            error: err,
        });
    }
};
exports.loginUser = loginUser;
// Logout user
const logoutUser = async (req, res) => {
    const userId = req.session.userId;
    req.session.destroy(async (err) => {
        if (err) {
            console.error('Lỗi khi hủy session:', err);
            return res.status(500).json({ message: 'Lỗi khi đăng xuất.' });
        }
        if (userId && mongoose_1.default.Types.ObjectId.isValid(userId)) {
            try {
                await User_model_1.default.findByIdAndUpdate(userId, {
                    $set: { currentSessionId: null },
                });
                console.log(`User ${userId} đã đăng xuất và currentSessionId đã được reset.`);
            }
            catch (updateErr) {
                console.error('Lỗi khi cập nhật currentSessionId sau đăng xuất:', updateErr);
            }
        }
        res.clearCookie('connect.sid'); // Xóa cookie session
        res.status(200).json({ message: 'Đăng xuất thành công' });
    });
};
exports.logoutUser = logoutUser;
// Lấy danh sách tất cả người dùng (có hỗ trợ phân trang và tìm kiếm)
const getAllUsers = async (req, res) => {
    try {
        const authResult = await (0, exports.checkAuth)(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }
        const adminResult = checkAdmin(authResult.user ?? {});
        if (!adminResult.isAdmin) {
            res.status(403).json({ message: adminResult.message });
            return;
        }
        // Xử lý phân trang và tìm kiếm
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const search = req.query.search || '';
        const skip = (page - 1) * limit;
        // Tạo điều kiện tìm kiếm
        const searchQuery = search
            ? {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ],
            }
            : {};
        // Đếm tổng số người dùng thỏa mãn điều kiện tìm kiếm
        const total = await User_model_1.default.countDocuments(searchQuery);
        // Lấy danh sách người dùng với phân trang và tìm kiếm
        const users = await User_model_1.default.find(searchQuery)
            .select('-password -currentSessionId')
            .sort({ user_id: 1 })
            .skip(skip)
            .limit(limit);
        res.status(200).json({
            users,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        });
    }
    catch (err) {
        console.error('Lỗi server khi lấy danh sách người dùng:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy danh sách người dùng',
            error: err,
        });
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    try {
        const authResult = await (0, exports.checkAuth)(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }
        const user = await User_model_1.default.findById(req.params.id).select('-password -currentSessionId');
        if (!user) {
            res.status(404).json({ message: 'Không tìm thấy người dùng' });
            return;
        }
        if (!(authResult.user ?? {}).isAdmin &&
            authResult.user &&
            authResult.user._id &&
            authResult.user._id.toString() !==
                user._id.toString()) {
            res.status(403).json({
                message: 'Không có quyền xem thông tin người dùng này.',
            });
            return;
        }
        res.status(200).json(user);
    }
    catch (err) {
        console.error('Lỗi server khi lấy người dùng bằng ID:', err);
        res.status(500).json({
            message: 'Lỗi server khi lấy người dùng',
            error: err,
        });
    }
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        const { name, password, birthDate, email, phone, address } = req.body;
        if (!name || !password || !birthDate || !email || !phone || !address) {
            res.status(400).json({
                message: 'Vui lòng điền đầy đủ thông tin người dùng',
            });
            return;
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const lastUser = await User_model_1.default.findOne().sort({ user_id: -1 }).lean();
        const newUserId = lastUser && typeof lastUser.user_id === 'number'
            ? lastUser.user_id + 1
            : 1;
        const newUser = new User_model_1.default({
            user_id: newUserId,
            name,
            password: hashedPassword,
            birthDate: new Date(birthDate),
            email,
            phone,
            address,
            isAdmin: false,
            currentSessionId: null,
        });
        await newUser.save();
        res.status(201).json({
            message: 'Đăng ký thành công.',
            user: {
                _id: newUser._id,
                user_id: newUser.user_id,
                name: newUser.name,
                email: newUser.email,
                phone: newUser.phone,
                isAdmin: newUser.isAdmin,
            },
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        console.error('Lỗi server khi tạo người dùng:', err);
        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            let message = `Trường '${field}' đã tồn tại.`;
            if (field === 'phone')
                message = 'Số điện thoại đã được sử dụng.';
            if (field === 'email')
                message = 'Email đã tồn tại.';
            if (field === 'user_id')
                message =
                    'Lỗi hệ thống khi tạo ID người dùng. Vui lòng thử lại.';
            res.status(409).json({
                message: 'Dữ liệu bị trùng lặp.',
                detail: message,
                error: err,
            });
        }
        else if (err instanceof mongoose_1.default.Error.ValidationError) {
            const messages = Object.values(err.errors).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (val) => val.message);
            res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ.',
                errors: err.errors,
                detail: messages,
            });
        }
        else {
            res.status(500).json({
                message: 'Lỗi server khi tạo người dùng',
                error: err,
            });
        }
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    try {
        const authResult = await (0, exports.checkAuth)(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }
        if (!(authResult.user ?? {}).isAdmin &&
            authResult.user &&
            authResult.user._id &&
            authResult.user._id.toString() !== req.params.id) {
            res.status(403).json({
                message: 'Bạn không có quyền cập nhật thông tin người dùng này.',
            });
            return;
        }
        if (!authResult.user?.isAdmin && req.body.isAdmin !== undefined) {
            delete req.body.isAdmin;
        }
        const updatedUser = await User_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true,
        }).select('-password -currentSessionId');
        if (!updatedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để cập nhật',
            });
            return;
        }
        res.status(200).json({
            message: 'Cập nhật người dùng thành công.',
            user: updatedUser,
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        console.error('Lỗi server khi cập nhật người dùng:', err);
        if (err.code === 11000 && err.keyPattern) {
            const field = Object.keys(err.keyPattern)[0];
            let message = `Trường '${field}' đã tồn tại.`;
            if (field === 'phone')
                message = 'Số điện thoại đã được sử dụng.';
            if (field === 'email')
                message = 'Email đã tồn tại.';
            res.status(409).json({
                message: 'Dữ liệu bị trùng lặp.',
                detail: message,
                error: err,
            });
        }
        else if (err instanceof mongoose_1.default.Error.ValidationError) {
            const messages = Object.values(err.errors).map(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (val) => val.message);
            res.status(400).json({
                message: 'Dữ liệu gửi lên không hợp lệ.',
                errors: err.errors,
                detail: messages,
            });
        }
        else {
            res.status(500).json({
                message: 'Lỗi server khi cập nhật người dùng',
                error: err,
            });
        }
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const authResult = await (0, exports.checkAuth)(req);
        if (!authResult.authenticated) {
            res.status(401).json({ message: authResult.message });
            return;
        }
        const adminResult = checkAdmin(authResult.user ?? {});
        if (!adminResult.isAdmin) {
            res.status(403).json({ message: adminResult.message });
            return;
        }
        const deletedUser = await User_model_1.default.findByIdAndDelete(req.params.id);
        if (!deletedUser) {
            res.status(404).json({
                message: 'Không tìm thấy người dùng để xoá',
            });
            return;
        }
        if (deletedUser.currentSessionId) {
            req.sessionStore.destroy(deletedUser.currentSessionId, (err) => {
                if (err)
                    console.error(`Lỗi khi hủy session của user bị xóa ${deletedUser._id}:`, err);
                else
                    console.log(`Session của user bị xóa ${deletedUser._id} đã được hủy.`);
            });
        }
        res.status(200).json({ message: 'Xoá người dùng thành công' });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    }
    catch (err) {
        console.error('Lỗi server khi xoá người dùng:', err);
        res.status(500).json({
            message: 'Lỗi server khi xoá người dùng',
            error: err,
        });
    }
};
exports.deleteUser = deleteUser;
const checkAdmin = (user) => {
    if (!user.isAdmin) {
        return { isAdmin: false, message: 'Bạn không có quyền truy cập.' };
    }
    return { isAdmin: true };
};
exports.default = {
    getAllUsers: exports.getAllUsers,
    getUserById: exports.getUserById,
    createUser: exports.createUser,
    loginUser: exports.loginUser,
    logoutUser: exports.logoutUser,
    updateUser: exports.updateUser,
    deleteUser: exports.deleteUser,
    checkAuth: exports.checkAuth,
    checkAdmin,
    checkSession: exports.checkSession,
};
