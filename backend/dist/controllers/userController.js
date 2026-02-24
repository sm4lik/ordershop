"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStats = exports.remove = exports.updatePassword = exports.update = exports.create = exports.getById = exports.getAll = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAll = async (req, res) => {
    try {
        const { role, page = 1, limit = 20, search } = req.query;
        let query = `
      SELECT id, email, first_name, last_name, phone, role, avatar, is_active, created_at
      FROM users
      WHERE 1=1
    `;
        const params = [];
        if (role) {
            query += ' AND role = ?';
            params.push(role);
        }
        if (search) {
            query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;
        params.push(limitNum, offset);
        const [users] = await database_1.default.query(query, params);
        const [countResult] = await database_1.default.query(`SELECT COUNT(*) as total FROM users WHERE 1=1${role ? ' AND role = ?' : ''}${search ? ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)' : ''}`, role ? (search ? [role, `%${search}%`, `%${search}%`, `%${search}%`] : [role]) : (search ? [`%${search}%`, `%${search}%`, `%${search}%`] : []));
        res.json({
            users,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total: countResult[0]?.total || 0,
                pages: Math.ceil(countResult[0]?.total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Ошибка получения пользователей' });
    }
};
exports.getAll = getAll;
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [users] = await database_1.default.query('SELECT id, email, first_name, last_name, phone, role, avatar, is_active, created_at FROM users WHERE id = ?', [id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.json(users[0]);
    }
    catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Ошибка получения пользователя' });
    }
};
exports.getById = getById;
const create = async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone, role } = req.body;
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await database_1.default.query('INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)', [email, hashedPassword, firstName, lastName, phone, role]);
        res.status(201).json({
            message: 'Пользователь создан',
            id: result.insertId
        });
    }
    catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Ошибка создания пользователя' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, phone, role, isActive } = req.body;
        await database_1.default.query('UPDATE users SET first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?', [firstName, lastName, phone, role, isActive !== undefined ? isActive : true, id]);
        res.json({ message: 'Пользователь обновлен' });
    }
    catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({ error: 'Ошибка обновления пользователя' });
    }
};
exports.update = update;
const updatePassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const bcrypt = require('bcryptjs');
        const hashedPassword = await bcrypt.hash(password, 10);
        await database_1.default.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
        res.json({ message: 'Пароль обновлен' });
    }
    catch (error) {
        console.error('Update password error:', error);
        res.status(500).json({ error: 'Ошибка обновления пароля' });
    }
};
exports.updatePassword = updatePassword;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        // Не удаляем, а деактивируем
        await database_1.default.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Пользователь деактивирован' });
    }
    catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({ error: 'Ошибка удаления пользователя' });
    }
};
exports.remove = remove;
const getStats = async (req, res) => {
    try {
        const [stats] = await database_1.default.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM users WHERE role = 'customer') as customers,
        (SELECT COUNT(*) FROM orders WHERE DATE(created_at) = CURDATE()) as today_orders,
        (SELECT COALESCE(SUM(final_amount), 0) FROM orders WHERE DATE(created_at) = CURDATE() AND status = 'delivered') as today_revenue,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_orders,
        (SELECT COUNT(*) FROM products WHERE is_active = TRUE) as active_products
    `);
        res.json({
            totalUsers: stats[0]?.total_users || 0,
            customers: stats[0]?.customers || 0,
            todayOrders: stats[0]?.today_orders || 0,
            todayRevenue: parseFloat(stats[0]?.today_revenue) || 0,
            pendingOrders: stats[0]?.pending_orders || 0,
            activeProducts: stats[0]?.active_products || 0
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
};
exports.getStats = getStats;
//# sourceMappingURL=userController.js.map