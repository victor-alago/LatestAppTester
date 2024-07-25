import { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user: {
        email: string;
    };
}
interface EditPasswordRequest extends AuthenticatedRequest {
    body: {
        oldPassword: string;
        newPassword: string;
    };
}
declare const editPassword: (req: EditPasswordRequest, res: Response) => Promise<void>;
declare const logout: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export { editPassword, logout, };
