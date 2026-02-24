"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.remove = exports.update = exports.updateStatus = exports.getAll = exports.getRecent = exports.getUserStats = exports.getUserOrders = exports.getByNumber = exports.getById = exports.create = void 0;
const database_1 = __importDefault(require("../config/database"));
const generateOrderNumber = async () => {
    const [rows] = await database_1.default.query("SELECT COUNT(*) as count FROM orders WHERE DATE(created_at) = CURDATE()");
    const count = (rows[0]?.count || 0) + 1;
    return `ORD-${String(count).padStart(6, '0')}`;
};
const create = async (req, res) => {
    try {
        const { items, deliveryType, deliveryAddress, guestEmail, guestPhone, guestName, paymentMethod, notes, deliveryDetails, deliveryInstructions } = req.body;
        const userId = req.user?.id || null;
        console.log('Creating order with:', { deliveryType, deliveryAddress, guestName, items, userId });
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'Корзина пуста' });
        }
        const orderNumber = await generateOrderNumber();
        console.log('Generated order number:', orderNumber);
        // Подсчет суммы
        let totalAmount = 0;
        for (const item of items) {
            const [products] = await database_1.default.query('SELECT price FROM products WHERE id = ? AND is_active = TRUE', [item.productId]);
            if (products.length === 0) {
                return res.status(400).json({ error: `Товар с ID ${item.productId} не найден` });
            }
            totalAmount += products[0].price * item.quantity;
        }
        // Получение стоимости доставки
        let deliveryFee = 0;
        if (deliveryType) {
            console.log('Checking delivery type:', deliveryType);
            const [deliveryTypes] = await database_1.default.query('SELECT fee, free_from_amount FROM delivery_types WHERE id = ? AND is_active = TRUE', [deliveryType]);
            console.log('Delivery types found:', deliveryTypes);
            if (deliveryTypes.length > 0) {
                const dt = deliveryTypes[0];
                // Преобразуем строки в числа для корректного сравнения
                const fee = parseFloat(dt.fee) || 0;
                const freeFromAmount = parseFloat(dt.free_from_amount) || 0;
                deliveryFee = totalAmount >= freeFromAmount ? 0 : fee;
                console.log(`Delivery: total=${totalAmount}, freeFrom=${freeFromAmount}, fee=${fee}, calculated=${deliveryFee}`);
            }
        }
        const discountAmount = 0;
        const finalAmount = totalAmount - discountAmount + deliveryFee;
        console.log('Order totals:', { totalAmount, deliveryFee, finalAmount, userId });
        // Создание заказа
        const [orderResult] = await database_1.default.query(`INSERT INTO orders (order_number, user_id, guest_email, guest_phone, guest_name,
         status, total_amount, discount_amount, delivery_fee, final_amount, payment_method, notes)
       VALUES (?, ?, ?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?)`, [orderNumber, userId, guestEmail, guestPhone, guestName, totalAmount, discountAmount, deliveryFee, finalAmount, paymentMethod || 'cash', notes || '']);
        const orderId = orderResult.insertId;
        console.log('Order created with ID:', orderId, 'user_id:', userId);
        // Создание позиций заказа
        for (const item of items) {
            const [products] = await database_1.default.query('SELECT price FROM products WHERE id = ? AND is_active = TRUE', [item.productId]);
            const price = products[0].price;
            const total = price * item.quantity;
            await database_1.default.query('INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)', [orderId, item.productId, item.quantity, price, total]);
        }
        // Создание доставки если указана
        if (deliveryType && deliveryAddress) {
            const addressText = deliveryAddress.fullAddress || deliveryAddress.address || '';
            const instructions = deliveryInstructions || deliveryDetails || deliveryAddress.deliveryInstructions || '';
            console.log('Creating delivery with address:', addressText);
            await database_1.default.query(`INSERT INTO deliveries (order_id, delivery_type_id, address, city, street, building, apartment, floor, entrance, intercom, delivery_instructions)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [orderId, deliveryType, addressText, deliveryAddress.city || '',
                deliveryAddress.street || '', deliveryAddress.building || '',
                deliveryAddress.apartment || '', deliveryAddress.floor || '',
                deliveryAddress.entrance || '', deliveryAddress.intercom || '', instructions]);
        }
        // История статусов
        await database_1.default.query('INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)', [orderId, 'pending', userId]);
        res.status(201).json({
            message: 'Заказ создан',
            order: {
                id: orderId,
                orderNumber,
                status: 'pending',
                finalAmount
            }
        });
    }
    catch (error) {
        console.error('Create order error:', error);
        res.status(500).json({ error: 'Ошибка создания заказа' });
    }
};
exports.create = create;
const getById = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;
        const userRole = req.user?.role;
        const [orders] = await database_1.default.query(`SELECT o.*, u.email as user_email, u.first_name, u.last_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.id = ?`, [id]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        const order = orders[0];
        // Проверка прав доступа
        if (!userId || (order.user_id !== userId && userRole === 'customer')) {
            return res.status(403).json({ error: 'Нет доступа к этому заказу' });
        }
        // Получение позиций
        const [items] = await database_1.default.query(`SELECT oi.*, p.name, p.image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`, [id]);
        // Преобразуем items в camelCase
        const formattedItems = items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            orderId: item.order_id,
            quantity: item.quantity,
            price: item.price,
            total: item.total,
            name: item.name,
            image: item.image
        }));
        // Получение доставки
        const [deliveries] = await database_1.default.query(`SELECT d.*, dt.name as delivery_type_name
       FROM deliveries d
       LEFT JOIN delivery_types dt ON d.delivery_type_id = dt.id
       WHERE d.order_id = ?`, [id]);
        // История статусов
        const [history] = await database_1.default.query(`SELECT osh.*, u.first_name, u.last_name
       FROM order_status_history osh
       LEFT JOIN users u ON osh.changed_by = u.id
       WHERE osh.order_id = ?
       ORDER BY osh.created_at`, [id]);
        res.json({
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            guestName: order.guest_name,
            guestPhone: order.guest_phone,
            guestEmail: order.guest_email,
            status: order.status,
            totalAmount: order.total_amount,
            discountAmount: order.discount_amount,
            deliveryFee: order.delivery_fee,
            finalAmount: order.final_amount,
            paymentMethod: order.payment_method,
            paymentStatus: order.payment_status,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            items: formattedItems,
            delivery: deliveries[0] || null,
            statusHistory: history
        });
    }
    catch (error) {
        console.error('Get order error:', error);
        res.status(500).json({ error: 'Ошибка получения заказа' });
    }
};
exports.getById = getById;
const getByNumber = async (req, res) => {
    try {
        const { number } = req.params;
        const [orders] = await database_1.default.query(`SELECT o.*, u.email as user_email, u.first_name, u.last_name, u.phone
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       WHERE o.order_number = ?`, [number]);
        if (orders.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        const order = orders[0];
        const [items] = await database_1.default.query(`SELECT oi.*, p.name, p.image
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`, [order.id]);
        // Форматируем items (camelCase)
        const formattedItems = items.map((item) => ({
            id: item.id,
            productId: item.product_id,
            orderId: item.order_id,
            quantity: item.quantity,
            price: parseFloat(item.price),
            total: parseFloat(item.total),
            name: item.name,
            image: item.image
        }));
        // Форматируем заказ (camelCase)
        const formattedOrder = {
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            guestName: order.guest_name,
            guestPhone: order.guest_phone,
            guestEmail: order.guest_email,
            status: order.status,
            totalAmount: parseFloat(order.total_amount),
            discountAmount: parseFloat(order.discount_amount),
            deliveryFee: parseFloat(order.delivery_fee),
            finalAmount: parseFloat(order.final_amount),
            paymentMethod: order.payment_method,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at,
            items: formattedItems
        };
        res.json(formattedOrder);
    }
    catch (error) {
        console.error('Get order by number error:', error);
        res.status(500).json({ error: 'Ошибка получения заказа' });
    }
};
exports.getByNumber = getByNumber;
const getUserOrders = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { status, limit = 10, page = 1 } = req.query;
        let query = `
      SELECT o.*,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      WHERE o.user_id = ?
    `;
        const params = [userId];
        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;
        params.push(limitNum, offset);
        const [orders] = await database_1.default.query(query, params);
        // Общее количество
        const [countResult] = await database_1.default.query('SELECT COUNT(*) as total FROM orders WHERE user_id = ?', [userId]);
        // Форматируем заказы для фронтенда (camelCase)
        const formattedOrders = orders.map((order) => ({
            id: order.id,
            orderNumber: order.order_number,
            userId: order.user_id,
            status: order.status,
            totalAmount: parseFloat(order.total_amount),
            discountAmount: parseFloat(order.discount_amount),
            deliveryFee: parseFloat(order.delivery_fee),
            finalAmount: parseFloat(order.final_amount),
            paymentMethod: order.payment_method,
            itemsCount: order.items_count,
            guestName: order.guest_name,
            guestPhone: order.guest_phone,
            guestEmail: order.guest_email,
            notes: order.notes,
            createdAt: order.created_at,
            updatedAt: order.updated_at
        }));
        res.json({
            orders: formattedOrders,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total: countResult[0]?.total || 0,
                pages: Math.ceil(countResult[0]?.total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get user orders error:', error);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
};
exports.getUserOrders = getUserOrders;
const getUserStats = async (req, res) => {
    try {
        const userId = req.user?.id;
        const [stats] = await database_1.default.query(`
      SELECT
        COUNT(*) as total_orders,
        COALESCE(SUM(CASE WHEN status != 'cancelled' THEN final_amount ELSE 0 END), 0) as total_spent,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN final_amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'confirmed' THEN final_amount ELSE 0 END), 0) as confirmed_amount,
        COALESCE(SUM(CASE WHEN status = 'preparing' THEN final_amount ELSE 0 END), 0) as preparing_amount,
        COALESCE(SUM(CASE WHEN status = 'ready' THEN final_amount ELSE 0 END), 0) as ready_amount,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN final_amount ELSE 0 END), 0) as delivered_amount,
        COALESCE(SUM(CASE WHEN status = 'cancelled' THEN final_amount ELSE 0 END), 0) as cancelled_amount,
        (SELECT COUNT(*) FROM reviews WHERE user_id = ?) as total_reviews
      FROM orders
      WHERE user_id = ?
    `, [userId, userId]);
        res.json({
            totalOrders: stats[0]?.total_orders || 0,
            totalSpent: parseFloat(stats[0]?.total_spent) || 0,
            pendingAmount: parseFloat(stats[0]?.pending_amount) || 0,
            confirmedAmount: parseFloat(stats[0]?.confirmed_amount) || 0,
            preparingAmount: parseFloat(stats[0]?.preparing_amount) || 0,
            readyAmount: parseFloat(stats[0]?.ready_amount) || 0,
            deliveredAmount: parseFloat(stats[0]?.delivered_amount) || 0,
            cancelledAmount: parseFloat(stats[0]?.cancelled_amount) || 0,
            totalReviews: stats[0]?.total_reviews || 0
        });
    }
    catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({ error: 'Ошибка получения статистики' });
    }
};
exports.getUserStats = getUserStats;
const getRecent = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 6;
        const [orders] = await database_1.default.query(`SELECT o.*, 
              (SELECT GROUP_CONCAT(p.name SEPARATOR ', ') 
               FROM order_items oi 
               JOIN products p ON oi.product_id = p.id 
               WHERE oi.order_id = o.id LIMIT 5) as items_summary
       FROM orders o
       WHERE o.status IN ('delivered', 'ready')
       ORDER BY o.created_at DESC
       LIMIT ?`, [limit]);
        res.json(orders);
    }
    catch (error) {
        console.error('Get recent orders error:', error);
        res.status(500).json({ error: 'Ошибка получения последних заказов' });
    }
};
exports.getRecent = getRecent;
const getAll = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;
        let query = `
      SELECT o.*,
             COALESCE(u.first_name, o.guest_name) as customer_name,
             COALESCE(u.email, o.guest_email) as customer_email,
             COALESCE(u.phone, o.guest_phone) as customer_phone,
             (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as items_count
      FROM orders o
      LEFT JOIN users u ON o.user_id = u.id
      WHERE 1=1
    `;
        const params = [];
        if (status) {
            query += ' AND o.status = ?';
            params.push(status);
        }
        if (search) {
            query += ' AND (o.order_number LIKE ? OR o.guest_name LIKE ? OR o.guest_phone LIKE ? OR COALESCE(u.first_name, o.guest_name) LIKE ?)';
            const searchPattern = `%${search}%`;
            params.push(searchPattern, searchPattern, searchPattern, searchPattern);
        }
        const validSorts = ['created_at', 'final_amount', 'status'];
        const sortField = validSorts.includes(sortBy) ? sortBy : 'created_at';
        const orderDir = sortOrder === 'ASC' ? 'ASC' : 'DESC';
        query += ` ORDER BY ${sortField} ${orderDir} LIMIT ? OFFSET ?`;
        const limitNum = parseInt(limit);
        const offset = (parseInt(page) - 1) * limitNum;
        params.push(limitNum, offset);
        const [orders] = await database_1.default.query(query, params);
        const [countResult] = await database_1.default.query(`SELECT COUNT(*) as total FROM orders o LEFT JOIN users u ON o.user_id = u.id WHERE 1=1${status ? ' AND o.status = ?' : ''}`, status ? [status] : []);
        // Для каждого заказа загружаем items и delivery
        const ordersWithItems = await Promise.all(orders.map(async (o) => {
            // Загружаем items
            const [items] = await database_1.default.query(`SELECT oi.id, oi.product_id as productId, oi.quantity, oi.price, oi.total, p.name
         FROM order_items oi
         LEFT JOIN products p ON oi.product_id = p.id
         WHERE oi.order_id = ?`, [o.id]);
            // Загружаем delivery информацию
            const [deliveries] = await database_1.default.query(`SELECT d.*, dt.name as deliveryTypeName
         FROM deliveries d
         LEFT JOIN delivery_types dt ON d.delivery_type_id = dt.id
         WHERE d.order_id = ?`, [o.id]);
            const delivery = deliveries[0] || null;
            const hasDelivery = delivery !== null;
            return {
                id: o.id,
                orderNumber: o.order_number,
                userId: o.user_id,
                customerName: o.customer_name,
                customerEmail: o.customer_email,
                customerPhone: o.customer_phone,
                guestName: o.guest_name,
                guestEmail: o.guest_email,
                guestPhone: o.guest_phone,
                status: o.status,
                totalAmount: o.total_amount,
                discountAmount: o.discount_amount,
                deliveryFee: o.delivery_fee,
                finalAmount: o.final_amount,
                paymentMethod: o.payment_method,
                itemsCount: o.items_count,
                items: items.map((item) => ({
                    id: item.id,
                    productId: item.productId,
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.total
                })),
                // Информация о доставке
                hasDelivery: hasDelivery,
                deliveryType: delivery ? delivery.deliveryTypeName : 'Самовывоз',
                deliveryAddress: delivery ? delivery.address : null,
                deliveryCity: delivery ? delivery.city : null,
                deliveryStreet: delivery ? delivery.street : null,
                deliveryBuilding: delivery ? delivery.building : null,
                deliveryApartment: delivery ? delivery.apartment : null,
                deliveryFloor: delivery ? delivery.floor : null,
                deliveryEntrance: delivery ? delivery.entrance : null,
                deliveryInstructions: delivery ? delivery.delivery_instructions : null,
                createdAt: o.created_at,
                updatedAt: o.updated_at
            };
        }));
        res.json({
            orders: ordersWithItems,
            pagination: {
                page: parseInt(page),
                limit: limitNum,
                total: countResult[0]?.total || 0,
                pages: Math.ceil(countResult[0]?.total / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Get all orders error:', error);
        res.status(500).json({ error: 'Ошибка получения заказов' });
    }
};
exports.getAll = getAll;
const updateStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment } = req.body;
        const userId = req.user?.id;
        const validStatuses = ['pending', 'confirmed', 'preparing', 'ready', 'delivering', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Неверный статус' });
        }
        // Получаем текущий заказ для проверки предыдущего статуса
        const [currentOrders] = await database_1.default.query('SELECT status, final_amount, payment_method FROM orders WHERE id = ?', [id]);
        if (currentOrders.length === 0) {
            return res.status(404).json({ error: 'Заказ не найден' });
        }
        const currentOrder = currentOrders[0];
        const previousStatus = currentOrder.status;
        const statusFields = {
            confirmed: 'confirmed_at',
            prepared: 'prepared_at',
            delivered: 'delivered_at'
        };
        let updateQuery = 'UPDATE orders SET status = ?';
        const params = [status];
        if (statusFields[status]) {
            updateQuery += `, ${statusFields[status]} = NOW()`;
        }
        updateQuery += ' WHERE id = ?';
        params.push(id);
        await database_1.default.query(updateQuery, params);
        // История статусов
        await database_1.default.query('INSERT INTO order_status_history (order_id, status, comment, changed_by) VALUES (?, ?, ?, ?)', [id, status, comment, userId]);
        // Если статус сменился на 'delivered' - создаём транзакцию дохода
        if (status === 'delivered' && previousStatus !== 'delivered') {
            try {
                // Находим категорию "Продажа товаров" или "Продажа через доставку"
                const [categories] = await database_1.default.query(`SELECT id FROM transaction_categories 
           WHERE type = 'income' AND (name = 'Продажа товаров' OR name = 'Продажа через доставку')
           LIMIT 1`);
                if (categories.length > 0) {
                    const categoryId = categories[0].id;
                    // Создаём транзакцию
                    await database_1.default.query(`INSERT INTO transactions 
             (type, category_id, amount, description, order_id, payment_method, transaction_date, created_by)
             VALUES ('income', ?, ?, ?, ?, ?, NOW(), ?)`, [categoryId, parseFloat(currentOrder.final_amount), `Оплата заказа`, id, currentOrder.payment_method, userId]);
                    console.log(`[Accounting] Transaction created for order ${id}: ${currentOrder.final_amount}`);
                }
            }
            catch (accountingError) {
                console.error('[Accounting] Error creating transaction for delivered order:', accountingError);
                // Не прерываем обновление статуса из-за ошибки в бухгалтерии
            }
        }
        res.json({ message: 'Статус обновлен' });
    }
    catch (error) {
        console.error('Update order status error:', error);
        res.status(500).json({ error: 'Ошибка обновления статуса' });
    }
};
exports.updateStatus = updateStatus;
const update = async (req, res) => {
    try {
        const { id } = req.params;
        const { guestName, guestPhone, guestEmail, status, paymentMethod, notes, items, deliveryType, deliveryAddress } = req.body;
        const userId = req.user?.id;
        // Сначала получаем текущий заказ для расчета доставки
        const [currentOrders] = await database_1.default.query('SELECT total_amount FROM orders WHERE id = ?', [id]);
        let totalAmount = currentOrders[0]?.total_amount || 0;
        // Если есть товары, пересчитываем сумму
        if (items && Array.isArray(items)) {
            totalAmount = items.reduce((sum, item) => sum + item.total, 0);
        }
        // Рассчитываем доставку
        let deliveryFee = 0;
        if (deliveryType) {
            const [deliveryTypes] = await database_1.default.query('SELECT fee, free_from_amount FROM delivery_types WHERE id = ? AND is_active = TRUE', [deliveryType]);
            if (deliveryTypes.length > 0) {
                const dt = deliveryTypes[0];
                // Преобразуем строки в числа для корректного сравнения
                const fee = parseFloat(dt.fee) || 0;
                const freeFromAmount = parseFloat(dt.free_from_amount) || 0;
                deliveryFee = totalAmount >= freeFromAmount ? 0 : fee;
            }
        }
        const discountAmount = 0;
        const finalAmount = totalAmount - discountAmount + deliveryFee;
        // Обновление заказа
        await database_1.default.query(`UPDATE orders SET 
         guest_name = ?, guest_phone = ?, guest_email = ?, status = ?, 
         payment_method = ?, notes = ?,
         total_amount = ?, delivery_fee = ?, final_amount = ?
       WHERE id = ?`, [guestName, guestPhone, guestEmail, status, paymentMethod, notes, totalAmount, deliveryFee, finalAmount, id]);
        // Если есть товары, обновляем позиции
        if (items && Array.isArray(items)) {
            // Удаляем старые позиции
            await database_1.default.query('DELETE FROM order_items WHERE order_id = ?', [id]);
            // Добавляем новые
            for (const item of items) {
                await database_1.default.query('INSERT INTO order_items (order_id, product_id, quantity, price, total) VALUES (?, ?, ?, ?, ?)', [id, item.productId, item.quantity, item.price, item.total]);
            }
        }
        // Если есть адрес доставки, обновляем или создаем запись
        if (deliveryType && deliveryAddress) {
            const [existingDelivery] = await database_1.default.query('SELECT id FROM deliveries WHERE order_id = ?', [id]);
            if (existingDelivery.length > 0) {
                await database_1.default.query(`UPDATE deliveries SET 
             delivery_type_id = ?, address = ?, city = ?, street = ?, building = ?, 
             apartment = ?, floor = ?, entrance = ?, intercom = ?, delivery_instructions = ?
           WHERE order_id = ?`, [deliveryType, deliveryAddress.fullAddress, deliveryAddress.city, deliveryAddress.street,
                    deliveryAddress.building, deliveryAddress.apartment, deliveryAddress.floor,
                    deliveryAddress.entrance, deliveryAddress.intercom, deliveryAddress.deliveryInstructions, id]);
            }
            else {
                await database_1.default.query(`INSERT INTO deliveries (order_id, delivery_type_id, address, city, street, building, 
             apartment, floor, entrance, intercom, delivery_instructions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [id, deliveryType, deliveryAddress.fullAddress, deliveryAddress.city, deliveryAddress.street,
                    deliveryAddress.building, deliveryAddress.apartment, deliveryAddress.floor,
                    deliveryAddress.entrance, deliveryAddress.intercom, deliveryAddress.deliveryInstructions]);
            }
        }
        // История статусов если статус изменился
        if (status) {
            await database_1.default.query('INSERT INTO order_status_history (order_id, status, changed_by) VALUES (?, ?, ?)', [id, status, userId]);
        }
        res.json({ message: 'Заказ обновлен' });
    }
    catch (error) {
        console.error('Update order error:', error);
        res.status(500).json({ error: 'Ошибка обновления заказа' });
    }
};
exports.update = update;
const remove = async (req, res) => {
    try {
        const { id } = req.params;
        // Сначала удаляем позиции заказа (из-за FOREIGN KEY)
        await database_1.default.query('DELETE FROM order_items WHERE order_id = ?', [id]);
        // Затем удаляем заказ
        await database_1.default.query('DELETE FROM orders WHERE id = ?', [id]);
        res.json({ message: 'Заказ удален' });
    }
    catch (error) {
        console.error('Delete order error:', error);
        res.status(500).json({ error: 'Ошибка удаления заказа' });
    }
};
exports.remove = remove;
//# sourceMappingURL=orderController.js.map