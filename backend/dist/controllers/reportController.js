"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportCategoryReport = exports.exportPeriodReport = exports.exportTransactionsToCSV = exports.exportTransactionsToExcel = void 0;
const database_1 = __importDefault(require("../config/database"));
const XLSX = __importStar(require("xlsx"));
const json2csv_1 = require("json2csv");
/**
 * Экспорт транзакций в Excel
 */
const exportTransactionsToExcel = async (req, res) => {
    try {
        const { type, category_id, dateFrom, dateTo, groupBy } = req.query;
        let query = `
      SELECT 
        t.transaction_date as 'Дата',
        t.type as 'Тип',
        tc.name as 'Категория',
        t.amount as 'Сумма',
        t.description as 'Описание',
        o.order_number as 'Заказ',
        t.payment_method as 'Оплата',
        CONCAT(u.first_name, ' ', u.last_name) as 'Создал'
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE 1=1
    `;
        const params = [];
        if (type) {
            query += ' AND t.type = ?';
            params.push(type);
        }
        if (category_id) {
            query += ' AND t.category_id = ?';
            params.push(category_id);
        }
        if (dateFrom) {
            query += ' AND t.transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            query += ' AND t.transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        query += ' ORDER BY t.transaction_date DESC';
        const [transactions] = await database_1.default.query(query, params);
        // Форматирование данных
        const data = transactions.map((t) => ({
            'Дата': new Date(t['Дата']).toLocaleDateString('ru-RU'),
            'Тип': t['Тип'] === 'income' ? 'Доход' : 'Расход',
            'Категория': t['Категория'],
            'Сумма': parseFloat(t['Сумма']).toFixed(2),
            'Описание': t['Описание'] || '',
            'Заказ': t['Заказ'] || '-',
            'Оплата': t['Оплата'] || '-',
            'Создал': t['Создал'] || '-'
        }));
        // Создаем Excel файл
        const worksheet = XLSX.utils.json_to_sheet(data);
        // Настройка ширины колонок
        worksheet['!cols'] = [
            { wch: 12 }, // Дата
            { wch: 10 }, // Тип
            { wch: 25 }, // Категория
            { wch: 12 }, // Сумма
            { wch: 40 }, // Описание
            { wch: 15 }, // Заказ
            { wch: 15 }, // Оплата
            { wch: 20 } // Создал
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Транзакции');
        // Добавляем лист с итогами
        const [stats] = await database_1.default.query(`
      SELECT 
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as profit,
        COUNT(*) as total_count
      FROM transactions
      WHERE 1=1${type ? ' AND type = ?' : ''}${dateFrom ? ' AND transaction_date >= ?' : ''}${dateTo ? ' AND transaction_date <= ?' : ''}
    `, type ? [type, dateFrom, dateTo + ' 23:59:59'] : [dateFrom, dateTo + ' 23:59:59'].filter(Boolean));
        const summaryData = [
            { 'Показатель': 'Общий доход', 'Значение': parseFloat(stats[0]?.total_income || 0).toFixed(2) + ' ₽' },
            { 'Показатель': 'Общий расход', 'Значение': parseFloat(stats[0]?.total_expense || 0).toFixed(2) + ' ₽' },
            { 'Показатель': 'Прибыль', 'Значение': parseFloat(stats[0]?.profit || 0).toFixed(2) + ' ₽' },
            { 'Показатель': 'Всего транзакций', 'Значение': stats[0]?.total_count || 0 }
        ];
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        summarySheet['!cols'] = [{ wch: 25 }, { wch: 20 }];
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Итоги');
        // Генерируем файл
        const fileName = `transactions_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    }
    catch (error) {
        console.error('Export to Excel error:', error);
        res.status(500).json({ error: 'Ошибка экспорта в Excel' });
    }
};
exports.exportTransactionsToExcel = exportTransactionsToExcel;
/**
 * Экспорт транзакций в CSV
 */
const exportTransactionsToCSV = async (req, res) => {
    try {
        const { type, category_id, dateFrom, dateTo } = req.query;
        let query = `
      SELECT 
        t.transaction_date,
        t.type,
        tc.name as category_name,
        t.amount,
        t.description,
        o.order_number,
        t.payment_method,
        CONCAT(u.first_name, ' ', u.last_name) as creator_name
      FROM transactions t
      LEFT JOIN transaction_categories tc ON t.category_id = tc.id
      LEFT JOIN users u ON t.created_by = u.id
      LEFT JOIN orders o ON t.order_id = o.id
      WHERE 1=1
    `;
        const params = [];
        if (type) {
            query += ' AND t.type = ?';
            params.push(type);
        }
        if (category_id) {
            query += ' AND t.category_id = ?';
            params.push(category_id);
        }
        if (dateFrom) {
            query += ' AND t.transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            query += ' AND t.transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        query += ' ORDER BY t.transaction_date DESC';
        const [transactions] = await database_1.default.query(query, params);
        const data = transactions.map((t) => ({
            'Дата': new Date(t.transaction_date).toLocaleDateString('ru-RU'),
            'Тип': t.type === 'income' ? 'Доход' : 'Расход',
            'Категория': t.category_name,
            'Сумма': parseFloat(t.amount).toFixed(2),
            'Описание': t.description || '',
            'Заказ': t.order_number || '',
            'Оплата': t.payment_method || '',
            'Создал': t.creator_name || ''
        }));
        const parser = new json2csv_1.Parser({
            delimiter: ';',
            encoding: 'utf-8',
            withBOM: true
        });
        const csv = parser.parse(data);
        const fileName = `transactions_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.csv`;
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.send(csv);
    }
    catch (error) {
        console.error('Export to CSV error:', error);
        res.status(500).json({ error: 'Ошибка экспорта в CSV' });
    }
};
exports.exportTransactionsToCSV = exportTransactionsToCSV;
/**
 * Экспорт отчёта по периодам (дни/недели/месяцы)
 */
const exportPeriodReport = async (req, res) => {
    try {
        const { dateFrom, dateTo, groupBy = 'day' // day, week, month, year
         } = req.query;
        let dateFormat;
        let periodLabel;
        switch (groupBy) {
            case 'month':
                dateFormat = '%Y-%m';
                periodLabel = 'Месяц';
                break;
            case 'week':
                dateFormat = '%Y-%u'; // ISO week
                periodLabel = 'Неделя';
                break;
            case 'year':
                dateFormat = '%Y';
                periodLabel = 'Год';
                break;
            default:
                dateFormat = '%Y-%m-%d';
                periodLabel = 'День';
        }
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (dateFrom) {
            whereClause += ' AND transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClause += ' AND transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        const [report] = await database_1.default.query(`
      SELECT 
        DATE_FORMAT(transaction_date, '${dateFormat}') as period,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
        SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as profit,
        COUNT(*) as transaction_count
      FROM transactions
      ${whereClause}
      GROUP BY period
      ORDER BY period DESC
    `, params);
        const data = report.map((r) => ({
            [periodLabel]: r.period,
            'Доход': parseFloat(r.income).toFixed(2),
            'Расход': parseFloat(r.expense).toFixed(2),
            'Прибыль': parseFloat(r.profit).toFixed(2),
            'Транзакций': r.transaction_count
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = [
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 15 },
            { wch: 12 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчёт по периодам');
        const fileName = `period_report_${groupBy}_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    }
    catch (error) {
        console.error('Export period report error:', error);
        res.status(500).json({ error: 'Ошибка экспорта отчёта' });
    }
};
exports.exportPeriodReport = exportPeriodReport;
/**
 * Экспорт отчёта по категориям
 */
const exportCategoryReport = async (req, res) => {
    try {
        const { dateFrom, dateTo, type } = req.query;
        let whereClause = 'WHERE 1=1';
        const params = [];
        if (dateFrom) {
            whereClause += ' AND t.transaction_date >= ?';
            params.push(dateFrom);
        }
        if (dateTo) {
            whereClause += ' AND t.transaction_date <= ?';
            params.push(dateTo + ' 23:59:59');
        }
        if (type) {
            whereClause += ' AND t.type = ?';
            params.push(type);
        }
        const [report] = await database_1.default.query(`
      SELECT 
        tc.name as category,
        tc.type,
        SUM(t.amount) as total_amount,
        COUNT(t.id) as transaction_count,
        AVG(t.amount) as avg_amount
      FROM transactions t
      JOIN transaction_categories tc ON t.category_id = tc.id
      ${whereClause}
      GROUP BY tc.id, tc.name, tc.type
      ORDER BY total_amount DESC
    `, params);
        const data = report.map((r) => ({
            'Категория': r.category,
            'Тип': r.type === 'income' ? 'Доход' : 'Расход',
            'Общая сумма': parseFloat(r.total_amount).toFixed(2),
            'Количество': r.transaction_count,
            'Средняя сумма': parseFloat(r.avg_amount).toFixed(2)
        }));
        const worksheet = XLSX.utils.json_to_sheet(data);
        worksheet['!cols'] = [
            { wch: 30 },
            { wch: 10 },
            { wch: 15 },
            { wch: 12 },
            { wch: 15 }
        ];
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Отчёт по категориям');
        const fileName = `category_report_${dateFrom || 'all'}_${dateTo || 'all'}_${Date.now()}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    }
    catch (error) {
        console.error('Export category report error:', error);
        res.status(500).json({ error: 'Ошибка экспорта отчёта по категориям' });
    }
};
exports.exportCategoryReport = exportCategoryReport;
//# sourceMappingURL=reportController.js.map