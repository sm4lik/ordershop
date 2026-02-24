import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getById: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getBySlug: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getPopular: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getNew: (req: AuthRequest, res: Response) => Promise<void>;
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const update: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=productController.d.ts.map