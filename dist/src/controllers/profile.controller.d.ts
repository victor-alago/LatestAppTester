import { Response } from 'express';
import { EditPasswordRequest } from '../types/profileRequest.interface';
import { BaseRequest } from '../types/baseRequest.interface';
declare const editPassword: (req: EditPasswordRequest, res: Response) => Promise<void>;
declare const logout: (req: BaseRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
export { editPassword, logout, };
