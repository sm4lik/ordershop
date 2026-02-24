import { Response } from 'express';
import pool from '../config/database';
import { AuthRequest } from '../middleware/auth';

export const getAll = async (req: AuthRequest, res: Response) => {
  try {
    const [settings]: any[] = await pool.query('SELECT * FROM settings');

    const result: any = {};
    settings.forEach((s: any) => {
      let value: any = s.setting_value;
      if (s.setting_type === 'number') {
        value = parseFloat(value);
      } else if (s.setting_type === 'boolean') {
        value = value === 'true' || value === '1';
      } else if (s.setting_type === 'json') {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // ignore
        }
      }
      result[s.setting_key] = value;
    });

    res.json(result);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ error: 'Ошибка получения настроек' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const settings = req.body;

    for (const [key, value] of Object.entries(settings)) {
      let settingValue: string;
      let settingType = 'string';

      if (typeof value === 'boolean') {
        settingValue = value ? 'true' : 'false';
        settingType = 'boolean';
      } else if (typeof value === 'number') {
        settingValue = String(value);
        settingType = 'number';
      } else if (typeof value === 'object') {
        settingValue = JSON.stringify(value);
        settingType = 'json';
      } else {
        settingValue = String(value);
      }

      await pool.query(
        `INSERT INTO settings (setting_key, setting_value, setting_type)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?`,
        [key, settingValue, settingType, settingValue, settingType]
      );
    }

    // Обновляем delivery_types на основе настроек
    const deliveryFee = settings.delivery_fee || 299;
    const freeDeliveryFrom = settings.free_delivery_from || 1500;

    // Обновляем курьерскую доставку (id=2)
    await pool.query(
      'UPDATE delivery_types SET fee = ?, free_from_amount = ? WHERE id = 2',
      [deliveryFee, freeDeliveryFrom]
    );

    res.json({ message: 'Настройки сохранены' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ error: 'Ошибка сохранения настроек' });
  }
};
