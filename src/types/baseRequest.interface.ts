import { Request } from 'express';

export interface BaseRequest  extends Request {
    user?: {
        email: string;
    };
}