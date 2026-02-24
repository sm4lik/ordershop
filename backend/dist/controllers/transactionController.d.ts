import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
/**
 * Получение списка транзакций с фильтрацией
 */
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Получение статистики по транзакциям
 */
export declare const getStats: (req: AuthRequest, res: Response) => Promise<void>;
/**
 * Создание транзакции
 */
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Обновление транзакции
 */
export declare const update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Удаление транзакции
 */
export declare const remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Получение категорий транзакций
 */
export declare const getCategories: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=transactionController.d.ts.map