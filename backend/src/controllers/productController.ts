import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

// Вспомогательная функция для преобразования boolean полей MySQL
const parseBoolean = (value: any): boolean => {
  if (value === null || value === undefined) return false;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value !== 0;
  if (typeof value === 'string') return value !== '0' && value.toLowerCase() !== 'false';
  return Boolean(value);
};

// Вспомогательная функция для форматирования продукта для ответа
const formatProduct = (product: any) => {
  return {
    ...product,
    is_popular: parseBoolean(product.is_popular),
    is_new: parseBoolean(product.is_new),
    is_active: parseBoolean(product.is_active),
    images: typeof product.images === 'string' ? JSON.parse(product.images) : product.images,
    ingredients: typeof product.ingredients === 'string' ? JSON.parse(product.ingredients) : product.ingredients,
    nutritional_info: typeof product.nutritional_info === 'string' ? JSON.parse(product.nutritional_info) : product.nutritional_info,
  };
};

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const { category, popular, new: isNew, search, sort, limit, page = 1, show_inactive } = req.query;

    let query = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    // Для админки показываем все товары, для клиентов только активные
    if (show_inactive !== 'true') {
      query += ' AND p.is_active = TRUE';
    }

    const params: any[] = [];

    if (category) {
      query += ' AND (c.slug = ? OR c.id = ?)';
      params.push(category, category);
    }

    if (popular === 'true') {
      query += ' AND p.is_popular = TRUE';
    }

    if (isNew === 'true') {
      query += ' AND p.is_new = TRUE';
    }

    if (search) {
      query += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }

    // Сортировка
    const sortOptions: { [key: string]: string } = {
      'price-asc': 'p.price ASC',
      'price-desc': 'p.price DESC',
      'rating': 'p.rating DESC',
      'popular': 'p.is_popular DESC, p.review_count DESC',
      'new': 'p.created_at DESC'
    };

    query += ` ORDER BY ${sortOptions[sort as string] || 'p.name'}`;

    // Пагинация
    const limitNum = parseInt(limit as string) || 20;
    const offset = (parseInt(page as string) - 1) * limitNum;
    query += ' LIMIT ? OFFSET ?';
    params.push(limitNum, offset);

    const [products]: any[] = await pool.query(query, params);

    // Получение общего количества
    let countQuery = `SELECT COUNT(*) as total FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE 1=1`;
    
    const countParams: any[] = [];
    
    if (show_inactive !== 'true') {
      countQuery += ' AND p.is_active = TRUE';
    }

    if (category) {
      countQuery += ' AND (c.slug = ? OR c.id = ?)';
      countParams.push(category, category);
    }
    if (popular === 'true') {
      countQuery += ' AND p.is_popular = TRUE';
    }
    if (isNew === 'true') {
      countQuery += ' AND p.is_new = TRUE';
    }
    if (search) {
      countQuery += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`);
    }

    const [countResult]: any[] = await pool.query(countQuery, countParams);
    const total = countResult[0].total;

    res.json({
      products: products.map((p: any) => formatProduct(p)),
      pagination: {
        page: parseInt(page as string),
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ error: 'Ошибка получения товаров' });
  }
};

export const getById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const [products]: any[] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(formatProduct(products[0]));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
};

export const getBySlug = async (req: AuthRequest, res: Response) => {
  try {
    const { slug } = req.params;

    const [products]: any[] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    res.json(formatProduct(products[0]));
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ error: 'Ошибка получения товара' });
  }
};

export const getPopular = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const [products]: any[] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE AND p.is_popular = TRUE
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json(products.map((p: any) => formatProduct(p)));
  } catch (error) {
    console.error('Get popular products error:', error);
    res.status(500).json({ error: 'Ошибка получения популярных товаров' });
  }
};

export const getNew = async (req: AuthRequest, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const [products]: any[] = await pool.query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE AND p.is_new = TRUE
       ORDER BY p.created_at DESC
       LIMIT ?`,
      [limit]
    );

    res.json(products.map((p: any) => formatProduct(p)));
  } catch (error) {
    console.error('Get new products error:', error);
    res.status(500).json({ error: 'Ошибка получения новых товаров' });
  }
};

// Вспомогательная функция для генерации уникального slug
const generateUniqueSlug = async (name: string): Promise<string> => {
  // Транслитерация русских символов
  const translitMap: { [key: string]: string } = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
    'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
    'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'h', 'ц': 'ts',
    'ч': 'ch', 'ш': 'sh', 'щ': 'sch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
    'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'G', 'Д': 'D', 'Е': 'E', 'Ё': 'Yo', 'Ж': 'Zh',
    'З': 'Z', 'И': 'I', 'Й': 'Y', 'К': 'K', 'Л': 'L', 'М': 'M', 'Н': 'N', 'О': 'O',
    'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U', 'Ф': 'F', 'Х': 'H', 'Ц': 'Ts',
    'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Sch', 'Ъ': '', 'Ы': 'Y', 'Ь': '', 'Э': 'E', 'Ю': 'Yu', 'Я': 'Ya'
  };

  let slug = name.split('').map(char => translitMap[char] || char).join('');
  slug = slug.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .trim();

  // Проверка на уникальность
  let uniqueSlug = slug;
  let counter = 1;
  
  while (true) {
    const [existing]: any[] = await pool.query(
      'SELECT id FROM products WHERE slug = ?',
      [uniqueSlug]
    );
    
    if (existing.length === 0) {
      break;
    }
    
    uniqueSlug = `${slug}-${counter}`;
    counter++;
  }

  return uniqueSlug;
};

// Admin методы
export const create = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name, slug, description, price, old_price, category_id, image, images,
      weight, composition, nutritional_value,
      is_popular, is_new, is_active, sort_order
    } = req.body;

    // Валидация обязательных полей
    if (!name || price === undefined || price === null || !category_id) {
      return res.status(400).json({ error: 'Заполните обязательные поля: название, цена, категория' });
    }

    // Генерация slug если не предоставлен
    let finalSlug = slug;
    if (!finalSlug) {
      finalSlug = await generateUniqueSlug(name);
    } else {
      // Проверка на уникальность предоставленного slug
      const [existing]: any[] = await pool.query(
        'SELECT id FROM products WHERE slug = ?',
        [finalSlug]
      );
      if (existing.length > 0) {
        return res.status(400).json({ error: 'Такой URL уже существует' });
      }
    }

    // Подготовка JSON полей
    const imagesJson = images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
    const compositionJson = req.body.composition ? (typeof req.body.composition === 'string' ? req.body.composition : JSON.stringify(req.body.composition)) : null;
    const nutritionalValueJson = req.body.nutritional_value ? (typeof req.body.nutritional_value === 'string' ? req.body.nutritional_value : JSON.stringify(req.body.nutritional_value)) : null;

    const [result]: any = await pool.query(
      `INSERT INTO products (
         name, slug, description, price, old_price, category_id, image, images,
         weight, composition, nutritional_value,
         is_popular, is_new, is_active, sort_order
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name, finalSlug, description || null, price, old_price || null, category_id,
        image || null, imagesJson, req.body.weight || null, compositionJson, nutritionalValueJson,
        is_popular ? 1 : 0, is_new ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1,
        req.body.sort_order || 0
      ]
    );

    res.status(201).json({
      message: 'Товар создан',
      id: result.insertId,
      slug: finalSlug
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({ error: 'Ошибка создания товара' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const {
      name, slug, description, price, old_price, category_id, image, images,
      weight, composition, nutritional_value,
      is_popular, is_new, is_active, sort_order
    } = req.body;

    // Проверка существования товара
    const [existing]: any[] = await pool.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Валидация обязательных полей
    if (!name || price === undefined || price === null || !category_id) {
      return res.status(400).json({ error: 'Заполните обязательные поля: название, цена, категория' });
    }

    // Проверка на уникальность slug если он изменился
    if (slug) {
      const [slugExists]: any[] = await pool.query(
        'SELECT id FROM products WHERE slug = ? AND id != ?',
        [slug, id]
      );
      if (slugExists.length > 0) {
        return res.status(400).json({ error: 'Такой URL уже существует' });
      }
    }

    // Подготовка JSON полей
    const imagesJson = images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
    const compositionJson = composition !== undefined ? (typeof composition === 'string' ? composition : JSON.stringify(composition)) : null;
    const nutritionalValueJson = nutritional_value !== undefined ? (typeof nutritional_value === 'string' ? nutritional_value : JSON.stringify(nutritional_value)) : null;

    await pool.query(
      `UPDATE products SET
         name = ?, slug = ?, description = ?, price = ?, old_price = ?, category_id = ?,
         image = ?, images = ?, weight = ?, composition = ?, nutritional_value = ?,
         is_popular = ?, is_new = ?, is_active = ?, sort_order = ?, updated_at = NOW()
       WHERE id = ?`,
      [
        name, slug || null, description || null, price, old_price || null, category_id,
        image || null, imagesJson, weight || null, compositionJson, nutritionalValueJson,
        is_popular ? 1 : 0, is_new ? 1 : 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
        sort_order || 0, id
      ]
    );

    res.json({ message: 'Товар обновлен' });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ error: 'Ошибка обновления товара' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Проверка существования товара
    const [existing]: any[] = await pool.query(
      'SELECT id FROM products WHERE id = ?',
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Товар не найден' });
    }

    // Мягкое удаление - установка is_active = FALSE
    await pool.query('UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);

    res.json({ message: 'Товар удален' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ error: 'Ошибка удаления товара' });
  }
};
