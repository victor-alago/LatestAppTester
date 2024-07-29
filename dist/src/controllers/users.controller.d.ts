import { Request, Response } from 'express';
export interface RegisterRequest extends Request {
    body: {
        email: string;
        username: string;
        password: string;
        country: string;
        city?: string;
        street?: string;
        creation_date?: string;
    };
}
export interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}
declare const register: (req: RegisterRequest, res: Response) => Promise<void>;
declare const login: (req: LoginRequest, res: Response) => Promise<void>;
export { register, login, };
