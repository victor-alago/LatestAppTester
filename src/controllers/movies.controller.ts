import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import logger from '../middleware/winston';
import statusCodes from '../constants/statusCodes';
import { QueryResult } from 'pg';
import type { IMovie } from '../types/movie.interface';
import type { UserRequest } from '../types/userReq.interface';

export const getMovies = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const { category } = req.query as { category?: string };

    if (category) {
        const result = await getMoviesByCategory(category);
        return res.status(statusCodes.success).json({ movies: result });
    } else {
        try {
            const movies: QueryResult = await pool.query(
                'SELECT * FROM movies GROUP BY type, movie_id;'
            );

            const groupedMovies = movies.rows.reduce(
                (acc: Record<string, IMovie[]>, movie: IMovie) => {
                    const { type } = movie;
                    if (!acc[type]) {
                        acc[type] = [];
                    }
                    acc[type].push(movie);
                    return acc;
                },
                {}
            );

            return res
                .status(statusCodes.success)
                .json({ movies: groupedMovies });
        } catch (error) {
            logger.error(error.stack);
            return res
                .status(statusCodes.queryError)
                .json({ error: 'Exception occured while fetching movies' });
        }
    }
};

export const getMoviesByCategory = async (
    category: string
): Promise<IMovie[]> => {
    try {
        const movies: QueryResult = await pool.query(
            'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
            [category]
        );
        return movies.rows;
    } catch (error) {
        logger.error(error.stack);
        return [];
    }
};

export const getTopRatedMovies = async (
    _req: Request,
    res: Response
): Promise<Response> => {
    try {
        const movies: QueryResult = await pool.query(
            'SELECT * FROM movies ORDER BY rating DESC LIMIT 10;'
        );
        return res.status(statusCodes.success).json({ movies: movies.rows });
    } catch (error) {
        logger.error(error.stack);
        return res.status(statusCodes.queryError).json({
            error: 'Exception occured while fetching top rated movies',
        });
    }
};

export const getSeenMovies = async (
    req: UserRequest,
    res: Response
): Promise<Response> => {
    try {
        const movies: QueryResult = await pool.query(
            'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
            [req.user.email]
        );
        return res.status(statusCodes.success).json({ movies: movies.rows });
    } catch (error) {
        logger.error(error.stack);
        return res
            .status(statusCodes.queryError)
            .json({ error: 'Exception occured while fetching seen movies' });
    }
};
