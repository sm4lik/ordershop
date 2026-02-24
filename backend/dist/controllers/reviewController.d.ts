import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
export declare const getProductReviews: (req: AuthRequest, res: Response) => Promise<void>;
export declare const create: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateHelpful: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAll: (req: AuthRequest, res: Response) => Promise<void>;
export declare const approve: (req: AuthRequest, res: Response) => Promise<void>;
export declare const remove: (req: AuthRequest, res: Response) => Promise<void>;
//# sourceMappingURL=reviewController.d.ts.map