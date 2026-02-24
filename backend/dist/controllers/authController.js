"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfile = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const config_1 = require("../config");
const register = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;
        // Проверка существующего пользователя
        const [existing] = await database_1.default.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        // Хэширование пароля
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        // Создание пользователя
        const [result] = await database_1.default.query('INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)', [email, hashedPassword, firstName, lastName, phone, 'customer']);
        const userId = result.insertId;
        // Генерация токена
        const token = jsonwebtoken_1.default.sign({ id: userId, email, role: 'customer' }, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRES_IN });
        res.status(201).json({
            message: 'Пользователь успешно зарегистрирован',
            token,
            user: {
                id: userId,
                email,
                firstName,
                lastName,
                phone,
                role: 'customer'
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Ошибка регистрации' });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Поиск пользователя
        const [users] = await database_1.default.query('SELECT * FROM users WHERE email = ? AND is_active = TRUE', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        const user = users[0];
        // Проверка пароля
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Неверный email или пароль' });
        }
        // Генерация токена
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, config_1.JWT_SECRET, { expiresIn: config_1.JWT_EXPIRES_IN });
        res.json({
            message: 'Успешный вход',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                phone: user.phone,
                role: user.role,
                avatar: user.avatar
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Ошибка входа' });
    }
};
exports.login = login;
const getProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const [users] = await database_1.default.query('SELECT id, email, first_name, last_name, phone, role, avatar, created_at FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const user = users[0];
        res.json({
            id: user.id,
            email: user.email,
            firstName: user.first_name,
            lastName: user.last_name,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            createdAt: user.created_at
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(500).json({ error: 'Ошибка получения профиля' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { firstName, lastName, phone } = req.body;
        await database_1.default.query('UPDATE users SET first_name = ?, last_name = ?, phone = ? WHERE id = ?', [firstName, lastName, phone, userId]);
        res.json({
            message: 'Профиль обновлен',
            user: {
                id: userId,
                firstName,
                lastName,
                phone
            }
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ error: 'Ошибка обновления профиля' });
    }
};
exports.updateProfile = updateProfile;
//# sourceMappingURL=authController.js.map