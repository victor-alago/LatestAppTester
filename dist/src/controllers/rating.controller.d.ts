import { Response } from 'express';
import { AddRatingRequest } from '../types/addRatingReq.interface';
export declare const addRating: (req: AddRatingRequest, res: Response) => Promise<Response>;
