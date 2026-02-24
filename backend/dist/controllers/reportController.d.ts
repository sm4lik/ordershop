import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Экспорт транзакций в Excel
 */
export declare const exportTransactionsToExcel: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Экспорт транзакций в CSV
 */
export declare const exportTransactionsToCSV: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Экспорт отчёта по периодам (дни/недели/месяцы)
 */
export declare const exportPeriodReport: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Экспорт отчёта по категориям
 */
export declare const exportCategoryReport: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reportController.d.ts.map