import { Request, Response, NextFunction } from 'express';
declare const validator: (req: Request, res: Response, next: NextFunction) => void;
export default validator;
