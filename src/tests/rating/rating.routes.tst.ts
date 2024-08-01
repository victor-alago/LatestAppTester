import request from 'supertest';
import { Application } from 'express';

import statusCodes from '../../constants/statusCodes';
import { avgRating, latestRating } from './rating.mockData';
import logger from '../../middleware/winston';
import { registerCoreMiddleWare } from '../../boot/setup';
import ratingModel, { IRating } from '../../models/ratingModel';
import { buildDB, teardownConnections } from '../config/buildDB';
import pool from '../../boot/database/db_connect';

describe('addRating controller', () => {
    let app: Application;
    let singleRating: IRating;
    let ratingModelSaveSpy: jest.SpyInstance;
    let ratingModelFindSpy: jest.SpyInstance;
    let poolQuerySpy: jest.SpyInstance;

    beforeAll(async () => {
        await buildDB({ movies: true, ratings: true });
        app = registerCoreMiddleWare();
        singleRating = latestRating;
    });

    beforeEach(() => {
        logger.info = jest.fn();
        logger.error = jest.fn();

        ratingModelSaveSpy = jest.spyOn(ratingModel.prototype, 'save');
        ratingModelFindSpy = jest.spyOn(ratingModel, 'find');
        poolQuerySpy = jest.spyOn(pool, 'query');
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterAll(async () => {
        await teardownConnections();
    });

    it('should return 400 if rating is missing', async () => {
        const res = await request(app)
            .post(`/ratings/${singleRating.movie_id}`)
            .send({});

        expect(ratingModelSaveSpy).not.toHaveBeenCalled();
        expect(ratingModelFindSpy).not.toHaveBeenCalled();
        expect(poolQuerySpy).not.toHaveBeenCalled();

        expect(res.status).toBe(statusCodes.badRequest);
        expect(res.body).toEqual({ message: 'Missing parameters' });
    });

    it('should return 400 if movieId is not a number', async () => {
        const res = await request(app).post('/ratings/abc').send({ rating: 5 });

        expect(ratingModelSaveSpy).not.toHaveBeenCalled();
        expect(ratingModelFindSpy).not.toHaveBeenCalled();
        expect(poolQuerySpy).not.toHaveBeenCalled();

        expect(res.status).toBe(statusCodes.badRequest);
        expect(res.body).toEqual({ message: 'Missing parameters' });
    });

    it('should return 400 if rating is 0', async () => {
        const res = await request(app)
            .post(`/ratings/${singleRating.movie_id}`)
            .send({ rating: 0 });

        expect(ratingModelSaveSpy).not.toHaveBeenCalled();
        expect(ratingModelFindSpy).not.toHaveBeenCalled();
        expect(poolQuerySpy).not.toHaveBeenCalled();

        expect(res.status).toBe(statusCodes.badRequest);
        expect(res.body).toEqual({ message: 'Missing parameters' });
    });

    it('should return 500 if rating is not between 1 and 5 (fails mongoose validation)', async () => {
        const res = await request(app)
            .post(`/ratings/${singleRating.movie_id}`)
            .send({ rating: 6 });

        expect(ratingModelSaveSpy).toHaveBeenCalled();
        expect(ratingModelFindSpy).not.toHaveBeenCalled();
        expect(poolQuerySpy).not.toHaveBeenCalled();

        expect(res.status).toBe(statusCodes.queryError);
        expect(res.body).toEqual({
            error: 'Exception occurred while adding rating',
        });
    });

    it('should add rating and return 200 if successful', async () => {
        const res = await request(app)
            .post(`/ratings/${singleRating.movie_id}`)
            .send({ rating: singleRating.rating });

        const avgerageRating = avgRating(singleRating.movie_id, true);

        expect(ratingModelSaveSpy).toHaveBeenCalled();
        expect(ratingModelFindSpy).toHaveBeenCalledWith(
            { movie_id: singleRating.movie_id },
            { rating: 1 }
        );

        expect(poolQuerySpy).toHaveBeenCalledWith(
            'UPDATE movies SET rating = $1 WHERE movie_id = $2;',
            [avgerageRating, singleRating.movie_id]
        );

        expect(res.status).toBe(statusCodes.success);
        expect(res.body).toEqual({ message: 'Rating added' });
    });

    it('should return 500 if an exception occurs', async () => {
        jest.spyOn(ratingModel, 'find').mockRejectedValueOnce(
            new Error('Error occurred')
        );

        const res = await request(app)
            .post(`/ratings/${singleRating.movie_id}`)
            .send({ rating: singleRating.rating });

        expect(ratingModelSaveSpy).toHaveBeenCalled();
        expect(ratingModelFindSpy).toHaveBeenCalled();
        expect(poolQuerySpy).not.toHaveBeenCalled();

        expect(res.status).toBe(statusCodes.queryError);
        expect(res.body).toEqual({
            error: 'Exception occurred while adding rating',
        });

        expect(logger.error).toHaveBeenCalled();
    });
});
