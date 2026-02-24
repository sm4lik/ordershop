"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.update = exports.getAll = void 0;
const database_1 = __importDefault(require("../config/database"));
const getAll = async (req, res) => {
    try {
        const [settings] = await database_1.default.query('SELECT * FROM shop_settings');
        const result = {};
        settings.forEach((s) => {
            let value = s.setting_value;
            if (s.setting_type === 'number') {
                value = parseFloat(value);
            }
            else if (s.setting_type === 'boolean') {
                value = value === 'true' || value === '1';
            }
            else if (s.setting_type === 'json') {
                try {
                    value = JSON.parse(value);
                }
                catch (e) {
                    // ignore
                }
            }
            result[s.setting_key] = value;
        });
        res.json(result);
    }
    catch (error) {
        console.error('Get settings error:', error);
        res.status(500).json({ error: 'Ошибка получения настроек' });
    }
};
exports.getAll = getAll;
const update = async (req, res) => {
    try {
        const settings = req.body;
        for (const [key, value] of Object.entries(settings)) {
            let settingValue;
            let settingType = 'string';
            if (typeof value === 'boolean') {
                settingValue = value ? 'true' : 'false';
                settingType = 'boolean';
            }
            else if (typeof value === 'number') {
                settingValue = String(value);
                settingType = 'number';
            }
            else if (typeof value === 'object') {
                settingValue = JSON.stringify(value);
                settingType = 'json';
            }
            else {
                settingValue = String(value);
            }
            await database_1.default.query(`INSERT INTO shop_settings (setting_key, setting_value, setting_type) 
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?`, [key, settingValue, settingType, settingValue, settingType]);
        }
        // Обновляем delivery_types на основе настроек
        const deliveryFee = settings.delivery_fee || 299;
        const freeDeliveryFrom = settings.free_delivery_from || 1500;
        // Обновляем курьерскую доставку (id=2)
        await database_1.default.query('UPDATE delivery_types SET fee = ?, free_from_amount = ? WHERE slug = "courier"', [deliveryFee, freeDeliveryFrom]);
        res.json({ message: 'Настройки сохранены' });
    }
    catch (error) {
        console.error('Update settings error:', error);
        res.status(500).json({ error: 'Ошибка сохранения настроек' });
    }
};
exports.update = update;
//# sourceMappingURL=settingsController.js.map