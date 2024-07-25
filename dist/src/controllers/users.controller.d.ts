import { Request, Response } from 'express';
interface RegisterRequest extends Request {
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
interface LoginRequest extends Request {
    body: {
        email: string;
        password: string;
    };
}
declare const register: (req: RegisterRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const login: (req: LoginRequest, res: Response) => Promise<void>;
export { register, login, };
