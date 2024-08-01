import { Request, Response } from 'express';
import type { IMovie } from '../types/movie.interface';
import type { UserRequest } from '../types/userReq.interface';
export declare const getMovies: (req: Request, res: Response) => Promise<Response>;
export declare const getMoviesByCategory: (category: string) => Promise<IMovie[]>;
export declare const getTopRatedMovies: (_req: Request, res: Response) => Promise<Response>;
export declare const getSeenMovies: (req: UserRequest, res: Response) => Promise<Response>;
