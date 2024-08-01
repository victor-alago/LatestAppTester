import { Response, NextFunction } from 'express';
import { BaseRequest } from '../types/baseRequest.interface';
export interface DecodedToken {
    user: {
        id: string;
        email: string;
    };
}
declare const verifyToken: (req: BaseRequest, res: Response, next: NextFunction) => Response | void;
export default verifyToken;
