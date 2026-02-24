"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.create = exports.getBySlug = exports.getById = exports.getAll = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAll = async (req, res) => {
    try {
        const [categories] = await database_1.default.query(`SELECT c.*, 
              (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count
       FROM categories c 
       WHERE c.is_active = TRUE 
       ORDER BY c.sort_order, c.name`);
        res.json(categories);
    }
    catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ error: 'Ошибка получения категорий' });
    }
};
exports.getAll = getAll;
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await database_1.default.query('SELECT * FROM categories WHERE id = ? AND is_active = TRUE', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }
        res.json(categories[0]);
    }
    catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Ошибка получения категории' });
    }
};
exports.getById = getById;
const getBySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const [categories] = await database_1.default.query('SELECT * FROM categories WHERE slug = ? AND is_active = TRUE', [slug]);
        if (categories.length === 0) {
            return res.status(404).json({ error: 'Категория не найдена' });
        }
        res.json(categories[0]);
    }
    catch (error) {
        console.error('Get category error:', error);
        res.status(500).json({ error: 'Ошибка получения категории' });
    }
};
exports.getBySlug = getBySlug;
// Admin методы
const create = async (req, res) => {
    try {
        const { name, slug, description, icon, image, parentId, sortOrder } = req.body;
        const [result] = await database_1.default.query('INSERT INTO categories (name, slug, description, icon, image, parent_id, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)', [name, slug, description, icon, image, parentId, sortOrder || 0]);
        res.status(201).json({
            message: 'Категория создана',
            id: result.insertId
        });
    }
    catch (error) {
        console.error('Create category error:', error);
        res.status(500).json({ error: 'Ошибка создания категории' });
    }
};
exports.create = create;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, slug, description, icon, image, parentId, sortOrder, isActive } = req.body;
        await database_1.default.query('UPDATE categories SET name = ?, slug = ?, description = ?, icon = ?, image = ?, parent_id = ?, sort_order = ?, is_active = ? WHERE id = ?', [name, slug, description, icon, image, parentId, sortOrder, isActive !== undefined ? isActive : true, id]);
        res.json({ message: 'Категория обновлена' });
    }
    catch (error) {
        console.error('Update category error:', error);
        res.status(500).json({ error: 'Ошибка обновления категории' });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        await database_1.default.query('UPDATE categories SET is_active = FALSE WHERE id = ?', [id]);
        res.json({ message: 'Категория удалена' });
    }
    catch (error) {
        console.error('Delete category error:', error);
        res.status(500).json({ error: 'Ошибка удаления категории' });
    }
};
exports.remove = remove;
//# sourceMappingURL=categoryController.js.map