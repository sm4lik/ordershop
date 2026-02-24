import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getByNumber: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserOrders: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getUserStats: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getRecent: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateStatus: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const update: (req: AuthRequest, res: Response) => Promise<void>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=orderController.d.ts.map