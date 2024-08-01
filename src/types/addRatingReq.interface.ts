import { Request } from 'express';

export interface AddRatingRequest extends Request {
    params: {
        movieId?: string;
    };
    body: {
        rating?: number;
    };
    user: {
        email?: string;
    };
}
