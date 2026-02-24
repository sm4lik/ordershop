"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getNew = exports.getPopular = exports.getBySlug = exports.getById = exports.getAll = void 0;
const database_1 = __importDefault(require("../config/database"));
// Вспомогательная функция для преобразования boolean полей MySQL
const parseBoolean = (value) => {
    if (value === null || value === undefined)
        return false;
    if (typeof value === 'boolean')
        return value;
    if (typeof value === 'number')
        return value !== 0;
    if (typeof value === 'string')
        return value !== '0' && value.toLowerCase() !== 'false';
    return Boolean(value);
};
// Вспомогательная функция для форматирования продукта для ответа
const formatProduct = (product) => {
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
const getAll = async (req, res) => {
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
        const params = [];
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
        const sortOptions = {
            'price-asc': 'p.price ASC',
            'price-desc': 'p.price DESC',
            'rating': 'p.rating DESC',
            'popular': 'p.is_popular DESC, p.review_count DESC',
            'new': 'p.created_at DESC'
        };
        query += ` ORDER BY ${sortOptions[sort] || 'p.name'}`;
        // Пагинация
        const limitNum = parseInt(limit) || 20;
        const offset = (parseInt(page) - 1) * limitNum;
        query += ' LIMIT ? OFFSET ?';
        params.push(limitNum, offset);
        const [products] = await database_1.default.query(query, params);
        // Получение общего количества
        let countQuery = `SELECT COUNT(*) as total FROM products p 
                      LEFT JOIN categories c ON p.category_id = c.id 
                      WHERE 1=1`;
        const countParams = [];
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
        const [countResult] = await database_1.default.query(countQuery, countParams);
        const total = countResult[0].total;
        res.json({
            products: products.map((p) => formatProduct(p)),
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get products error:', error);
        res.status(500).json({ error: 'Ошибка получения товаров' });
    }
};
exports.getAll = getAll;
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [products] = await database_1.default.query(`SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`, [id]);
        if (products.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(formatProduct(products[0]));
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Ошибка получения товара' });
    }
};
exports.getById = getById;
const getBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [products] = await database_1.default.query(`SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ? AND p.is_active = TRUE`, [slug]);
        if (products.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        res.json(formatProduct(products[0]));
    }
    catch (error) {
        console.error('Get product error:', error);
        res.status(500).json({ error: 'Ошибка получения товара' });
    }
};
exports.getBySlug = getBySlug;
const getPopular = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const [products] = await database_1.default.query(`SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE AND p.is_popular = TRUE
       ORDER BY p.review_count DESC, p.rating DESC
       LIMIT ?`, [limit]);
        res.json(products.map((p) => formatProduct(p)));
    }
    catch (error) {
        console.error('Get popular products error:', error);
        res.status(500).json({ error: 'Ошибка получения популярных товаров' });
    }
};
exports.getPopular = getPopular;
const getNew = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const [products] = await database_1.default.query(`SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_active = TRUE AND p.is_new = TRUE
       ORDER BY p.created_at DESC
       LIMIT ?`, [limit]);
        res.json(products.map((p) => formatProduct(p)));
    }
    catch (error) {
        console.error('Get new products error:', error);
        res.status(500).json({ error: 'Ошибка получения новых товаров' });
    }
};
exports.getNew = getNew;
// Вспомогательная функция для генерации уникального slug
const generateUniqueSlug = async (name) => {
    // Транслитерация русских символов
    const translitMap = {
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
        const [existing] = await database_1.default.query('SELECT id FROM products WHERE slug = ?', [uniqueSlug]);
        if (existing.length === 0) {
            break;
        }
        uniqueSlug = `${slug}-${counter}`;
        counter++;
    }
    return uniqueSlug;
};
// Admin методы
const create = async (req, res) => {
    try {
        const { name, slug, description, price, old_price, category_id, image, images, sku, weight, volume, alcohol_percentage, ingredients, nutritional_info, is_popular, is_new, is_active, stock_quantity } = req.body;
        console.log('Creating product with body:', req.body);
        // Валидация обязательных полей
        if (!name || price === undefined || price === null || !category_id) {
            return res.status(400).json({ error: 'Заполните обязательные поля: название, цена, категория' });
        }
        // Генерация slug если не предоставлен
        let finalSlug = slug;
        if (!finalSlug) {
            finalSlug = await generateUniqueSlug(name);
        }
        else {
            // Проверка на уникальность предоставленного slug
            const [existing] = await database_1.default.query('SELECT id FROM products WHERE slug = ?', [finalSlug]);
            if (existing.length > 0) {
                return res.status(400).json({ error: 'Такой URL уже существует' });
            }
        }
        // Подготовка JSON полей
        const imagesJson = images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
        const ingredientsJson = ingredients ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : null;
        const nutritionalInfoJson = nutritional_info ? (typeof nutritional_info === 'string' ? nutritional_info : JSON.stringify(nutritional_info)) : null;
        const [result] = await database_1.default.query(`INSERT INTO products (
         name, slug, description, price, old_price, category_id, image, images,
         sku, weight, volume, alcohol_percentage, ingredients, nutritional_info,
         is_popular, is_new, is_active, stock_quantity
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
            name, finalSlug, description || null, price, old_price || null, category_id,
            image || null, imagesJson, sku || null, weight || null, volume || null,
            alcohol_percentage || null, ingredientsJson, nutritionalInfoJson,
            is_popular ? 1 : 0, is_new ? 1 : 0, is_active !== undefined ? (is_active ? 1 : 0) : 1,
            stock_quantity || 0
        ]);
        res.status(201).json({
            message: 'Товар создан',
            id: result.insertId,
            slug: finalSlug
        });
    }
    catch (error) {
        console.error('Create product error:', error);
        res.status(500).json({ error: 'Ошибка создания товара' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, price, old_price, category_id, image, images, sku, weight, volume, alcohol_percentage, ingredients, nutritional_info, is_popular, is_new, is_active, stock_quantity, rating, review_count } = req.body;
        console.log('Updating product:', id, 'with body:', req.body);
        // Проверка существования товара
        const [existing] = await database_1.default.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        // Валидация обязательных полей
        if (!name || price === undefined || price === null || !category_id) {
            return res.status(400).json({ error: 'Заполните обязательные поля: название, цена, категория' });
        }
        // Проверка на уникальность slug если он изменился
        if (slug) {
            const [slugExists] = await database_1.default.query('SELECT id FROM products WHERE slug = ? AND id != ?', [slug, id]);
            if (slugExists.length > 0) {
                return res.status(400).json({ error: 'Такой URL уже существует' });
            }
        }
        // Подготовка JSON полей
        const imagesJson = images !== undefined ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
        const ingredientsJson = ingredients !== undefined ? (typeof ingredients === 'string' ? ingredients : JSON.stringify(ingredients)) : null;
        const nutritionalInfoJson = nutritional_info !== undefined ? (typeof nutritional_info === 'string' ? nutritional_info : JSON.stringify(nutritional_info)) : null;
        await database_1.default.query(`UPDATE products SET
         name = ?, slug = ?, description = ?, price = ?, old_price = ?, category_id = ?,
         image = ?, images = ?, sku = ?, weight = ?, volume = ?, alcohol_percentage = ?,
         ingredients = ?, nutritional_info = ?, is_popular = ?, is_new = ?,
         is_active = ?, stock_quantity = ?, rating = ?, review_count = ?, updated_at = NOW()
       WHERE id = ?`, [
            name, slug || null, description || null, price, old_price || null, category_id,
            image || null, imagesJson, sku || null, weight || null, volume || null,
            alcohol_percentage || null, ingredientsJson, nutritionalInfoJson,
            is_popular ? 1 : 0, is_new ? 1 : 0,
            is_active !== undefined ? (is_active ? 1 : 0) : 1,
            stock_quantity || 0, rating || 0, review_count || 0, id
        ]);
        res.json({ message: 'Товар обновлен' });
    }
    catch (error) {
        console.error('Update product error:', error);
        res.status(500).json({ error: 'Ошибка обновления товара' });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        // Проверка существования товара
        const [existing] = await database_1.default.query('SELECT id FROM products WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ error: 'Товар не найден' });
        }
        // Мягкое удаление - установка is_active = FALSE
        await database_1.default.query('UPDATE products SET is_active = FALSE, updated_at = NOW() WHERE id = ?', [id]);
        res.json({ message: 'Товар удален' });
    }
    catch (error) {
        console.error('Delete product error:', error);
        res.status(500).json({ error: 'Ошибка удаления товара' });
    }
};
exports.remove = remove;
//# sourceMappingURL=productController.js.map