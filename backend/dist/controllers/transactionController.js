"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCategories = exports.remove = exports.update = exports.create = exports.getStats = exports.getAll = void 0;
const database_1 = __importDefault(require("../config/database"));
/**
 * Получение списка транзакций с фильтрацией
 */
const getAll = async (req, res) => {
    try {
        const { type, category_id, dateFrom, dateTo, page = 1, limit = 50, sortBy = 'transaction_date', sortOrder = 'DESC' } = req.query;
        let query = `
      SELECT 
        t.*,
        tc.name as category_name,
        tc.icon as category_icon,
        tc.color as category_color,
        u.first_name,
        u.last_name,
        o.order_number
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE 1=1
    `;
        const params = [];
        if (type) {
            query += ' AND t.type = ?';
            params.push(type);
        }
        if (category_id) {
            query += ' AND t.category_id = ?';
            params.push(category_id);
        }
        if (dateFrom) {
            query += ' AND t.transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            query += ' AND t.transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        const validSorts = ['transaction_date', 'amount', 'created_at', 'type'];
        const sortField = validSorts.includes(sortBy) ? sortBy : 'transaction_date';
        const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortField} ${orderDir} LIMIT ? OFFSET ?`;
        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;
        params.push(limitNum, offset);
        const [transactions] = await database_1.default.query(query, params);
        // Общее количество
        let countQuery = `SELECT COUNT(*) as total FROM transactions t WHERE 1=1`;
        const countParams = [];
        if (type) {
            countQuery += ' AND t.type = ?';
            countParams.push(type);
        }
        if (category_id) {
            countQuery += ' AND t.category_id = ?';
            countParams.push(category_id);
        }
        if (dateFrom) {
            countQuery += ' AND t.transaction_date >= ?';
            countParams.push(dateFrom);
        }
        if (dateTo) {
            countQuery += ' AND t.transaction_date <= ?';
            countParams.push(dateTo + ' 23:59:59');
        }
        const [countResult] = await database_1.default.query(countQuery, countParams);
        res.json({
            transactions: transactions.map((t) => ({
                id: t.id,
                type: t.type,
                categoryId: t.category_id,
                category: {
                    id: t.category_id,
                    name: t.category_name,
                    icon: t.category_icon,
                    color: t.category_color
                },
                amount: parseFloat(t.amount),
                description: t.description,
                orderId: t.order_id,
                orderNumber: t.order_number,
                paymentMethod: t.payment_method,
                transactionDate: t.transaction_date,
                createdBy: t.created_by,
                creatorName: t.first_name ? `${t.first_name} ${t.last_name}` : null,
                createdAt: t.created_at,
                updatedAt: t.updated_at
            })),
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total: countResult[0]?.total || 0,
                pages: Math.ceil(countResult[0]?.total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ error: 'Ошибка получения транзакций' });
    }
};
exports.getAll = getAll;
/**
 * Получение статистики по транзакциям
 */
const getStats = async (req, res) => {
    try {
        const { dateFrom, dateTo } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (dateFrom) {
            whereClause += ' AND transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClause += ' AND transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        const [stats] = await database_1.default.query(`
      SELECT
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
        COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END), 0) as profit,
        COUNT(*) as total_transactions,
        COUNT(CASE WHEN type = 'income' THEN 1 END) as income_count,
        COUNT(CASE WHEN type = 'expense' THEN 1 END) as expense_count
      FROM transactions
      ${whereClause}
    `, params);
        // Статистика по категориям
        const [categoryStats] = await database_1.default.query(`
      SELECT 
        tc.id,
        tc.name,
        tc.type,
        tc.icon,
        tc.color,
        COALESCE(SUM(t.amount), 0) as total_amount,
        COUNT(t.id) as transaction_count
      FROM transaction_categories tc
      LEFT JOIN transactions t ON tc.id = t.category_id ${whereClause.replace('WHERE', 'AND')}
      WHERE tc.is_active = TRUE
      GROUP BY tc.id, tc.name, tc.type, tc.icon, tc.color
      ORDER BY total_amount DESC
    `, params);
        res.json({
            summary: {
                totalIncome: parseFloat(stats[0]?.total_income) || 0,
                totalExpense: parseFloat(stats[0]?.total_expense) || 0,
                profit: parseFloat(stats[0]?.profit) || 0,
                totalTransactions: stats[0]?.total_transactions || 0,
                incomeCount: stats[0]?.income_count || 0,
                expenseCount: stats[0]?.expense_count || 0
            },
            byCategory: categoryStats.map((c) => ({
                id: c.id,
                name: c.name,
                type: c.type,
                icon: c.icon,
                color: c.color,
                totalAmount: parseFloat(c.total_amount),
                transactionCount: c.transaction_count
            }))
        });
    }
    catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
};
exports.getStats = getStats;
/**
 * Создание транзакции
 */
const create = async (req, res) => {
    try {
        const { type, category_id, amount, description, order_id, payment_method, transaction_date } = req.body;
        const userId = req.user?.id || null;
        // Проверка обязательных полей
        if (!type || !category_id || !amount) {
            return res.status(400).json({ error: 'Тип, категория и сумма обязательны' });
        }
        // Проверка категории
        const [categories] = await database_1.default.query('SELECT id, type FROM transaction_categories WHERE id = ?', [category_id]);
        if (categories.length === 0) {
            return res.status(400).json({ error: 'Категория не найдена' });
        }
        // Проверка соответствия типа категории
        if (categories[0].type !== type) {
            return res.status(400).json({ error: 'Тип транзакции не соответствует категории' });
        }
        const transactionDate = transaction_date || new Date().toISOString();
        const [result] = await database_1.default.query(`INSERT INTO transactions 
       (type, category_id, amount, description, order_id, payment_method, transaction_date, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, [type, category_id, parseFloat(amount), description || '', order_id || null, payment_method || null, transactionDate, userId]);
        const transactionId = result.insertId;
        // Получаем созданную транзакцию
        const [transaction] = await database_1.default.query(`SELECT * FROM transactions WHERE id = ?`, [transactionId]);
        res.status(201).json({
            message: 'Транзакция создана',
            transaction: transaction[0]
        });
    }
    catch (error) {
        console.error('Create transaction error:', error);
        res.status(500).json({ error: 'Ошибка создания транзакции' });
    }
};
exports.create = create;
/**
 * Обновление транзакции
 */
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, category_id, amount, description, payment_method, transaction_date } = req.body;
        const userId = req.user?.id || null;
        // Проверка существования
        const [existing] = await database_1.default.query('SELECT * FROM transactions WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }
        // Если меняется категория, проверяем её
        if (category_id && category_id !== existing[0].category_id) {
            const [categories] = await database_1.default.query('SELECT id, type FROM transaction_categories WHERE id = ?', [category_id]);
            if (categories.length === 0) {
                return res.status(400).json({ error: 'Категория не найдена' });
            }
            if (categories[0].type !== (type || existing[0].type)) {
                return res.status(400).json({ error: 'Тип транзакции не соответствует категории' });
            }
        }
        const updateFields = [];
        const updateParams = [];
        if (type !== undefined) {
            updateFields.push('type = ?');
            updateParams.push(type);
        }
        if (category_id !== undefined) {
            updateFields.push('category_id = ?');
            updateParams.push(category_id);
        }
        if (amount !== undefined) {
            updateFields.push('amount = ?');
            updateParams.push(parseFloat(amount));
        }
        if (description !== undefined) {
            updateFields.push('description = ?');
            updateParams.push(description);
        }
        if (payment_method !== undefined) {
            updateFields.push('payment_method = ?');
            updateParams.push(payment_method);
        }
        if (transaction_date !== undefined) {
            updateFields.push('transaction_date = ?');
            updateParams.push(transaction_date);
        }
        if (updateFields.length === 0) {
            return res.status(400).json({ error: 'Нет данных для обновления' });
        }
        updateFields.push('updated_at = NOW()');
        await database_1.default.query(`UPDATE transactions SET ${updateFields.join(', ')} WHERE id = ?`, [...updateParams, id]);
        res.json({ message: 'Транзакция обновлена' });
    }
    catch (error) {
        console.error('Update transaction error:', error);
        res.status(500).json({ error: 'Ошибка обновления транзакции' });
    }
};
exports.update = update;
/**
 * Удаление транзакции
 */
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        // Проверка существования
        const [existing] = await database_1.default.query('SELECT * FROM transactions WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Транзакция не найдена' });
        }
        // Нельзя удалить транзакцию, связанную с заказом
        if (existing[0].order_id) {
            return res.status(400).json({ error: 'Нельзя удалить транзакцию, связанную с заказом' });
        }
        await database_1.default.query('DELETE FROM transactions WHERE id = ?', [id]);
        res.json({ message: 'Транзакция удалена' });
    }
    catch (error) {
        console.error('Delete transaction error:', error);
        res.status(500).json({ error: 'Ошибка удаления транзакции' });
    }
};
exports.remove = remove;
/**
 * Получение категорий транзакций
 */
const getCategories = async (req, res) => {
    try {
        const { type } = req.query;
        let query = 'SELECT * FROM transaction_categories WHERE is_active = TRUE';
        const params = [];
        if (type) {
            query += ' AND type = ?';
            params.push(type);
        }
        query += ' ORDER BY type, name';
        const [categories] = await database_1.default.query(query, params);
        res.json(categories.map((c) => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            isActive: c.is_active
        })));
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Ошибка получения категорий' });
    }
};
exports.getCategories = getCategories;
//# sourceMappingURL=transactionController.js.map