import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = 1, limit = 20, search } = req.query;

    let query = `
      SELECT id, email, first_name as first_name, last_name as last_name, phone, role, is_active, created_at
      FROM users
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role) {
      query += ' AND role = ?';
      params.push(role);
    }

    if (search) {
      query += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const limitNum = parseInt(limit as string);
    const offset = (parseInt(page as string) - 1) * limitNum;
    params.push(limitNum, offset);

    const [users]: any[] = await pool.query(query, params);

    const countParams: any[] = [];
    let countQuery = `SELECT COUNT(*) as total FROM users WHERE 1=1`;
    
    if (role) {
      countQuery += ' AND role = ?';
      countParams.push(role);
    }
    
    if (search) {
      countQuery += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const [countResult]: any[] = await pool.query(countQuery, countParams);

    res.json({
      users,
      pagination: {
        page: parseInt(page as string),
        limit: limitNum,
        total: countResult[0]?.total || 0,
        pages: Math.ceil(countResult[0]?.total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Ошибка получения пользователей' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [users]: any[] = await pool.query(
      'SELECT id, email, first_name, last_name, phone, role, avatar, is_active, created_at FROM users WHERE id = ?',
      [id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Ошибка получения пользователя' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone, role } = req.body;
    const bcrypt = require('bcryptjs');

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result]: any = await pool.query(
      'INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hashedPassword, firstName, lastName, phone, role]
    );

    res.status(201).json({
      message: 'Пользователь создан',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, role, isActive } = req.body;

    await pool.query(
      'UPDATE users SET first_name = ?, last_name = ?, phone = ?, role = ?, is_active = ? WHERE id = ?',
      [firstName, lastName, phone, role, isActive !== undefined ? isActive : true, id]
    );

    res.json({ message: 'Пользователь обновлен' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Ошибка обновления пользователя' });
  }
};

export const updatePassword = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { password } = req.body;
    const bcrypt = require('bcryptjs');

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, id]
    );

    res.json({ message: 'Пароль обновлен' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ error: 'Ошибка обновления пароля' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Не удаляем, а деактивируем
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [id]);

    res.json({ message: 'Пользователь деактивирован' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Ошибка удаления пользователя' });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const [stats]: any[] = await pool.query(`
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
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Ошибка получения статистики' });
  }
};
