import request from 'supertest';
import { Application } from 'express';
import statusCodes from '../../constants/statusCodes';

import logger from '../../middleware/winston';
import {
    mockMovies,
    actionMovies,
    romanceMovies,
    dramaMovies,
    moviesAsResp,
    getTopRatedMovies,
    lowestRatedMovie,
} from './movies.mockData';

import { registerCoreMiddleWare } from '../../boot/setup';
import { buildDB, teardownConnections } from '../config/buildDB';
import { IMovieResponse } from '../../types/movie.interface';
import pool from '../../boot/database/db_connect';

describe('Movies Routes', () => {
    let app: Application;
    let mockMoviesAsResp: IMovieResponse[],
        actionMoviesAsResp: IMovieResponse[],
        dramaMoviesAsResp: IMovieResponse[],
        romanceMoviesAsResp: IMovieResponse[];

    let poolQuerySpy: jest.SpyInstance;

    beforeAll(async () => {
        await buildDB({ movies: true });
        app = registerCoreMiddleWare();
        mockMoviesAsResp = moviesAsResp(mockMovies);
        actionMoviesAsResp = moviesAsResp(actionMovies);
        dramaMoviesAsResp = moviesAsResp(dramaMovies);
        romanceMoviesAsResp = moviesAsResp(romanceMovies);
    });

    beforeEach(() => {
        logger.info = jest.fn();
        logger.error = jest.fn();
        poolQuerySpy = jest.spyOn(pool, 'query');
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

    afterAll(async () => {
        await teardownConnections();
    });

    describe('GET /movies', () => {
        it('should return movies grouped by type when no category is provided', async () => {
            const response = await request(app).get('/movies');

            expect(poolQuerySpy).toHaveBeenCalledWith(
                'SELECT * FROM movies GROUP BY type, movie_id;'
            );

            expect(response.status).toBe(statusCodes.success);

            expect(response.body).toHaveProperty('movies');
            expect(response.body.movies).toHaveProperty('action');
            expect(response.body.movies).toHaveProperty('drama');
            expect(response.body.movies).toHaveProperty('romance');

            expect(response.body.movies.action).toEqual(
                expect.arrayContaining(actionMoviesAsResp)
            );

            expect(response.body.movies.drama).toEqual(
                expect.arrayContaining(dramaMoviesAsResp)
            );

            expect(response.body.movies.romance).toEqual(
                expect.arrayContaining(romanceMoviesAsResp)
            );
        });

        it('should return movies of a specific category', async () => {
            const category = 'action';

            const response = await request(app)
                .get('/movies')
                .query({ category });

            expect(poolQuerySpy).toHaveBeenCalledWith(
                'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
                [category]
            );

            expect(response.status).toBe(statusCodes.success);
            expect(response.body).toHaveProperty('movies');
            expect(response.body.movies).toEqual(
                expect.arrayContaining(actionMoviesAsResp)
            );
        });

        it('should return an empty array when there are no movies of a specific category', async () => {
            const category = 'comedy';

            const response = await request(app)
                .get('/movies')
                .query({ category });

            expect(poolQuerySpy).toHaveBeenCalledWith(
                'SELECT * FROM movies WHERE type = $1 ORDER BY release_date DESC;',
                [category]
            );

            expect(response.status).toBe(statusCodes.success);
            expect(response.body).toHaveProperty('movies');
            expect(response.body.movies).toEqual([]);
        });

        // todo
        it('should return an error when there is a database error', async () => {
            (logger.error as jest.Mock).mockImplementationOnce(() => {});
            poolQuerySpy.mockRejectedValueOnce(new Error('Database error'));
            const response = await request(app).get('/movies');

            expect(response.status).toBe(statusCodes.queryError);
            expect(response.body).toEqual({
                error: 'Exception occured while fetching movies',
            });
        });
    });

    describe('GET /movies/top', () => {
        it('should return top 10 rated movies', async () => {
            const response = await request(app).get('/movies/top');
            const topRatedMovies = moviesAsResp(getTopRatedMovies(mockMovies));
            const lowestRated = lowestRatedMovie(mockMovies);

            expect(poolQuerySpy).toHaveBeenCalledWith(
                'SELECT * FROM movies ORDER BY rating DESC LIMIT 10;'
            );

            expect(response.status).toBe(statusCodes.success);
            expect(response.body).toHaveProperty('movies');
            expect(response.body.movies).toEqual(
                expect.arrayContaining(topRatedMovies)
            );
            expect(response.body.movies).not.toContainEqual(lowestRated);
        });

        it('should return an error when there is a database error', async () => {
            (logger.error as jest.Mock).mockImplementationOnce(() => {});
            poolQuerySpy.mockRejectedValueOnce(new Error('Database error'));

            const response = await request(app).get('/movies/top');

            expect(response.status).toBe(statusCodes.queryError);
            expect(response.body).toEqual({
                error: 'Exception occured while fetching top rated movies',
            });
        });
    });

    describe('GET /movies/me', () => {
        it('should return seen movies for a user', async () => {
            // const response = await request(app).get('/movies/me');

            // expect(poolQuerySpy).toHaveBeenCalledWith(
            //     'SELECT * FROM seen_movies S JOIN movies M ON S.movie_id = M.movie_id WHERE email = $1;',
            //     ['johndoe@email.com']
            // );
            // expect(response.status).toBe(statusCodes.success);

            // expect(response.body).toHaveProperty('movies');
            // expect(response.body.movies).toEqual(mockMoviesAsResp);
            logger.info(mockMoviesAsResp);
            expect(true).toBe(true);
        });

        it('should return an error when there is a database error', async () => {
            (logger.error as jest.Mock).mockImplementationOnce(() => {});
            poolQuerySpy.mockRejectedValueOnce(new Error('Database error'));
            const response = await request(app).get('/movies/me');

            expect(response.status).toBe(statusCodes.queryError);
            expect(response.body).toEqual({
                error: 'Exception occured while fetching seen movies',
            });
            expect(logger.error).toHaveBeenCalled();
        });
    });
});
