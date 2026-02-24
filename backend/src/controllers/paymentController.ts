import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';
import axios from 'axios';

// Константы API ЮMoney
const YOOMONEY_AUTH_URL = 'https://yoomoney.ru/oauth/authorize';
const YOOMONEY_TOKEN_URL = 'https://yoomoney.ru/oauth/token';
const YOOMONEY_API_URL = 'https://yoomoney.ru/api';

/**
 * Получение URL для авторизации
 */
export const getAuthUrl = (req: AuthRequest, res: Response) => {
  try {
    const clientId = process.env.YOOMONEY_CLIENT_ID || '';
    const redirectUri = encodeURIComponent(process.env.YOOMONEY_REDIRECT_URI || '');
    
    // Запрашиваем права:
    // - payment-shop - проведение платежей
    // - operation-history - история операций
    // - account-info - информация о кошельке
    const scope = encodeURIComponent('payment-shop operation-history account-info');
    
    const authUrl = `${YOOMONEY_AUTH_URL}?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}&response_type=code`;
    
    res.json({
      authUrl,
      message: 'Перенаправьте пользователя на этот URL для авторизации'
    });
  } catch (error) {
    console.error('Get auth URL error:', error);
    res.status(500).json({ error: 'Ошибка получения URL авторизации' });
  }
};

/**
 * Обработка callback от ЮMoney (получение токена)
 */
export const handleAuthCallback = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'Код авторизации не предоставлен' });
    }
    
    const clientId = process.env.YOOMONEY_CLIENT_ID || '';
    const clientSecret = process.env.YOOMONEY_CLIENT_SECRET || '';
    const redirectUri = process.env.YOOMONEY_REDIRECT_URI || '';
    
    // Обмен кода на токен
    const response = await axios.post(YOOMONEY_TOKEN_URL, null, {
      params: {
        code: code as string,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    const { access_token, token_type, expires_in } = response.data;
    
    // Сохраняем токен в базе данных или настройках
    await pool.query(
      `INSERT INTO settings (setting_key, setting_value) 
       VALUES ('yoomoney_access_token', ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [access_token, access_token]
    );
    
    res.json({
      message: 'Токен успешно получен',
      token_type,
      expires_in
    });
  } catch (error: any) {
    console.error('Auth callback error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка получения токена',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Создание платежа (запрос на перевод)
 */
export const createPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId, amount, description } = req.body;
    const userId = (req as any).user?.id;
    
    // Проверка заказа
    const [orders]: any[] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const order = orders[0];
    
    // Получаем токен из БД
    const [settings]: any[] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'yoomoney_access_token'"
    );
    
    if (settings.length === 0) {
      return res.status(400).json({ 
        error: 'Токен авторизации не найден. Необходимо авторизоваться в ЮMoney.'
      });
    }
    
    const accessToken = settings[0].setting_value;
    
    // Создание запроса на перевод
    const response = await axios.post(
      `${YOOMONEY_API_URL}/request-payment`,
      {
        pattern_id: 'p2p', // перевод на другой кошелек или карту
        to: process.env.YOOMONEY_ACCOUNT || '', // номер кошелька получателя
        amount_due: parseFloat(amount || order.final_amount).toFixed(2),
        comment: description || `Оплата заказа ${order.order_number}`,
        message: `Заказ ${order.order_number}`,
        label: orderId.toString() // метка с ID заказа
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const paymentData = response.data;
    
    // Сохраняем информацию о платеже
    await pool.query(
      `INSERT INTO payment_logs 
       (order_id, payment_id, event_type, event_data, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        paymentData.request_id || '',
        'payment.request',
        JSON.stringify(paymentData),
        parseFloat(amount || order.final_amount),
        'pending'
      ]
    );
    
    // Обновляем заказ
    await pool.query(
      `UPDATE orders 
       SET payment_type = 'online',
           payment_status = 'pending',
           payment_id = ?
       WHERE id = ?`,
      [paymentData.request_id || '', orderId]
    );
    
    res.json({
      success: true,
      request_id: paymentData.request_id,
      status: paymentData.status,
      balance: paymentData.balance,
      paymentUrl: paymentData.acs_url || null,
      ext_auth_success: paymentData.ext_auth_success,
      message: 'Платёж создан. Если требуется подтверждение, перейдите по ссылке.'
    });
  } catch (error: any) {
    console.error('Create payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка создания платежа',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Подтверждение платежа (если требуется авторизация)
 */
export const confirmPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { requestId, ext_auth_params } = req.body;
    
    // Получаем токен
    const [settings]: any[] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'yoomoney_access_token'"
    );
    
    if (settings.length === 0) {
      return res.status(400).json({ error: 'Токен не найден' });
    }
    
    const accessToken = settings[0].setting_value;
    
    // Подтверждение платежа
    const response = await axios.post(
      `${YOOMONEY_API_URL}/authorize`,
      {
        request_id: requestId,
        ext_auth_params: ext_auth_params || {}
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const confirmData = response.data;
    
    res.json({
      success: confirmData.status === 'done',
      status: confirmData.status,
      message: confirmData.status === 'done' ? 'Платёж подтверждён' : 'Требуется дополнительное подтверждение'
    });
  } catch (error: any) {
    console.error('Confirm payment error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка подтверждения платежа',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Получение информации о кошельке
 */
export const getWalletInfo = async (req: AuthRequest, res: Response) => {
  try {
    // Получаем токен
    const [settings]: any[] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'yoomoney_access_token'"
    );
    
    if (settings.length === 0) {
      return res.status(400).json({ error: 'Токен не найден' });
    }
    
    const accessToken = settings[0].setting_value;
    
    const response = await axios.post(
      `${YOOMONEY_API_URL}/account-info`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const info = response.data;
    
    res.json({
      account: info.account,
      balance: info.balance,
      currency: info.currency,
      account_status: info.account_status,
      wallet_name: info.wallet_name
    });
  } catch (error: any) {
    console.error('Get wallet info error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка получения информации о кошельке',
      details: error.response?.data || error.message
    });
  }
};

/**
 * История операций
 */
export const getOperationHistory = async (req: AuthRequest, res: Response) => {
  try {
    const { limit = 10 } = req.query;
    
    // Получаем токен
    const [settings]: any[] = await pool.query(
      "SELECT setting_value FROM settings WHERE setting_key = 'yoomoney_access_token'"
    );
    
    if (settings.length === 0) {
      return res.status(400).json({ error: 'Токен не найден' });
    }
    
    const accessToken = settings[0].setting_value;
    
    const response = await axios.post(
      `${YOOMONEY_API_URL}/operation-history`,
      {
        limit: parseInt(limit as string)
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    res.json(response.data);
  } catch (error: any) {
    console.error('Get operation history error:', error.response?.data || error.message);
    res.status(500).json({ 
      error: 'Ошибка получения истории операций',
      details: error.response?.data || error.message
    });
  }
};

/**
 * Webhook для обработки уведомлений от ЮMoney
 */
export const webhook = async (req: AuthRequest, res: Response) => {
  try {
    const notification = req.body;

    // Проверка типа уведомления
    if (notification.notification_type !== 'p2p-incoming') {
      return res.status(200).json({ status: 'ok' });
    }
    
    const orderId = notification.label;
    
    if (!orderId) {
      return res.status(400).json({ error: 'Order ID not found' });
    }
    
    // Проверка существования заказа
    const [orders]: any[] = await pool.query(
      'SELECT * FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    const order = orders[0];
    
    // Логирование уведомления
    await pool.query(
      `INSERT INTO payment_logs 
       (order_id, payment_id, event_type, event_data, amount, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        notification.transaction_id || '',
        'payment.notification',
        JSON.stringify(notification),
        parseFloat(notification.amount || '0'),
        'succeeded'
      ]
    );
    
    // Обновление заказа
    await pool.query(
      `UPDATE orders 
       SET payment_status = 'succeeded',
           payment_paid_at = NOW(),
           payment_id = ?
       WHERE id = ?`,
      [notification.transaction_id || '', orderId]
    );
    
    // Автоматическое подтверждение заказа
    if (order.status === 'pending') {
      await pool.query(
        `UPDATE orders SET status = 'confirmed' WHERE id = ?`,
        [orderId]
      );
      
      await pool.query(
        `INSERT INTO order_status_history (order_id, status, changed_by, comment)
         VALUES (?, 'confirmed', NULL, 'Автоматически после оплаты через ЮMoney')`,
        [orderId]
      );
    }
    
    // Создание транзакции в бухгалтерии
    try {
      const [categories]: any[] = await pool.query(
        `SELECT id FROM transaction_categories 
         WHERE type = 'income' AND (name = 'Продажа товаров' OR name = 'Продажа через доставку')
         LIMIT 1`
      );
      
      if (categories.length > 0) {
        await pool.query(
          `INSERT INTO transactions
           (type, category_id, amount, description, order_id, payment_method, transaction_date, created_by)
           VALUES ('income', ?, ?, ?, ?, 'online', NOW(), NULL)`,
          [categories[0].id, parseFloat(order.final_amount), `Онлайн оплата через ЮMoney заказа ${order.order_number}`, orderId]
        );
      }
    } catch (accountingError) {
      // Игнорируем ошибки бухгалтерии
    }

    res.status(200).json({ status: 'ok' });
  } catch (error: any) {
    console.error('[YooMoney Webhook] Error:', error);
    res.status(500).json({ error: 'Ошибка обработки webhook' });
  }
};

/**
 * Проверка статуса платежа
 */
export const checkPaymentStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    
    const [orders]: any[] = await pool.query(
      'SELECT payment_status, payment_type, payment_id FROM orders WHERE id = ?',
      [orderId]
    );
    
    if (orders.length === 0) {
      return res.status(404).json({ error: 'Заказ не найден' });
    }
    
    const order = orders[0];
    
    res.json({
      orderId: order.id,
      paymentType: order.payment_type,
      paymentStatus: order.payment_status,
      paymentId: order.payment_id
    });
  } catch (error) {
    console.error('Check payment status error:', error);
    res.status(500).json({ error: 'Ошибка проверки статуса платежа' });
  }
};
