import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getProductReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { productId } = req.params;
    const { rating, page = 1, limit = 10 } = req.query;

    let query = `
      SELECT r.*, u.first_name, u.last_name, u.avatar,
             (SELECT COUNT(*) FROM reviews WHERE product_id = r.product_id) as total_reviews
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.is_approved = TRUE
    `;
    const params: any[] = [productId];

    if (rating) {
      query += ' AND r.rating = ?';
      params.push(rating);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    const limitNum = parseInt(limit as string);
    const offset = (parseInt(page as string) - 1) * limitNum;
    params.push(limitNum, offset);

    const [reviews]: any[] = await pool.query(query, params);

    // Преобразуем даты в строки ISO
    const formattedReviews = reviews.map((r: any) => ({
      ...r,
      created_at: r.created_at instanceof Date ? r.created_at.toISOString() : r.created_at
    }));

    const [countResult]: any[] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews WHERE product_id = ? AND is_approved = TRUE',
      [productId]
    );

    // Средний рейтинг
    const [ratingResult]: any[] = await pool.query(
      'SELECT AVG(rating) as avg_rating, COUNT(*) as count FROM reviews WHERE product_id = ? AND is_approved = TRUE',
      [productId]
    );

    res.json({
      reviews: formattedReviews,
      averageRating: ratingResult[0]?.avg_rating || 0,
      totalReviews: ratingResult[0]?.count || 0,
      pagination: {
        page: parseInt(page as string),
        limit: limitNum,
        total: countResult[0]?.total || 0,
        pages: Math.ceil((countResult[0]?.total || 0) / limitNum)
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов' });
  }
};

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { productId, rating, title, comment, orderId } = req.body;
    const userId = (req as any).user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Требуется авторизация' });
    }

    // Проверка существования товара
    const [products]: any[] = await pool.query(
      'SELECT id FROM products WHERE id = ? AND is_active = TRUE',
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Проверка покупки товара (если указан orderId)
    let isVerified = false;
    if (orderId) {
      const [orderItems]: any[] = await pool.query(
        'SELECT id FROM order_items WHERE order_id = ? AND product_id = ?',
        [orderId, productId]
      );
      isVerified = orderItems.length > 0;
    }

    const [result]: any = await pool.query(
      'INSERT INTO reviews (product_id, user_id, rating, title, comment, order_id, is_verified, is_approved) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
      [productId, userId, rating, title, comment, orderId, isVerified]
    );

    // Обновление рейтинга товара
    await pool.query(
      `UPDATE products p
       SET rating = (SELECT AVG(rating) FROM reviews WHERE product_id = p.id AND is_approved = TRUE),
           review_count = (SELECT COUNT(*) FROM reviews WHERE product_id = p.id AND is_approved = TRUE)
       WHERE p.id = ?`,
      [productId]
    );

    res.status(201).json({
      message: 'Отзыв создан',
      id: result.insertId
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ error: 'Ошибка создания отзыва' });
  }
};

export const updateHelpful = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query(
      'UPDATE reviews SET helpful_count = helpful_count + 1 WHERE id = ?',
      [id]
    );

    res.json({ message: 'Голос учтен' });
  } catch (error) {
    console.error('Update helpful error:', error);
    res.status(500).json({ error: 'Ошибка обновления отзыва' });
  }
};

// Admin методы
export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { approved, page = 1, limit = 20 } = req.query;

    let query = `
      SELECT r.*, u.first_name, u.last_name, u.email, p.name as product_name
      FROM reviews r
      LEFT JOIN users u ON r.user_id = u.id
      LEFT JOIN products p ON r.product_id = p.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (approved !== undefined) {
      query += ' AND r.is_approved = ?';
      params.push(approved === 'true' ? 1 : 0);
    }

    query += ' ORDER BY r.created_at DESC LIMIT ? OFFSET ?';
    const limitNum = parseInt(limit as string);
    const offset = (parseInt(page as string) - 1) * limitNum;
    params.push(limitNum, offset);

    const [reviews]: any[] = await pool.query(query, params);

    const [countResult]: any[] = await pool.query(
      'SELECT COUNT(*) as total FROM reviews' + (approved !== undefined ? ' WHERE is_approved = ?' : ''),
      approved !== undefined ? [approved === 'true' ? 1 : 0] : []
    );

    res.json({
      reviews,
      pagination: {
        page: parseInt(page as string),
        limit: limitNum,
        total: countResult[0]?.total || 0,
        pages: Math.ceil(countResult[0]?.total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get all reviews error:', error);
    res.status(500).json({ error: 'Ошибка получения отзывов' });
  }
};

export const approve = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approved } = req.body;

    await pool.query(
      'UPDATE reviews SET is_approved = ? WHERE id = ?',
      [approved ? 1 : 0, id]
    );

    res.json({ message: 'Статус отзыва обновлен' });
  } catch (error) {
    console.error('Approve review error:', error);
    res.status(500).json({ error: 'Ошибка обновления отзыва' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    await pool.query('DELETE FROM reviews WHERE id = ?', [id]);

    res.json({ message: 'Отзыв удален' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: 'Ошибка удаления отзыва' });
  }
};
