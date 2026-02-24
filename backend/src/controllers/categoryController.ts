import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const [categories]: any[] = await pool.query(
      `SELECT c.*, 
              (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count
       FROM categories c 
       WHERE c.is_active = TRUE 
       ORDER BY c.sort_order, c.name`
    );

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Ошибка получения категорий' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [categories]: any[] = await pool.query(
      'SELECT * FROM categories WHERE id = ? AND is_active = TRUE',
      [id]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
};

export const getBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const [categories]: any[] = await pool.query(
      'SELECT * FROM categories WHERE slug = ? AND is_active = TRUE',
      [slug]
    );

    if (categories.length === 0) {
      return res.status(404).json({ error: 'Категория не найдена' });
    }

    res.json(categories[0]);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({ error: 'Ошибка получения категории' });
  }
};

// Admin методы
export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { name, slug, description, icon, image, parentId, sortOrder } = req.body;

    const [result]: any = await pool.query(
      'INSERT INTO categories (name, slug, description, icon, image, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, slug, description, icon, image, parentId, sortOrder || 0]
    );

    res.status(201).json({
      message: 'Категория создана',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({ error: 'Ошибка создания категории' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon, image, parentId, sortOrder, isActive } = req.body;

    await pool.query(
      'UPDATE categories SET name = ?, slug = ?, description = ?, icon = ?, image = ?, parent_id = ?, sort_order = ?, is_active = ? WHERE id = ?',
      [name, slug, description, icon, image, parentId, sortOrder, isActive !== undefined ? isActive : true, id]
    );

    res.json({ message: 'Категория обновлена' });
  } catch (error) {
    console.error('Update category error:', error);
    res.status(500).json({ error: 'Ошибка обновления категории' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);

    res.json({ message: 'Категория удалена' });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: 'Ошибка удаления категории' });
  }
};
