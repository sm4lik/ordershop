import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getBySlug: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const create: (req: AuthRequest, res: Response) => Promise<void>;
export declare const update: (req: AuthRequest, res: Response) => Promise<void>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=categoryController.d.ts.map