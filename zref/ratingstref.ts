// import request from 'supertest';
// import { Application } from 'express';
// import statusCodes from '../../constants/statusCodes';
// import logger from '../../middleware/winston';
// import { registerCoreMiddleWare } from '../../boot/setup';
// import { buildDB, teardownConnections } from '../config/buildDB';
// import pool from '../../boot/database/db_connect';
// import ratingModel from '../../models/ratingModel';


// describe('Ratings Routes', () => {
//     let app: Application;

//     beforeAll(async () => {
//         await buildDB({ ratings: true });
//         app = registerCoreMiddleWare();
//     });

//     beforeEach(() => {
//         logger.info = jest.fn();
//         logger.error = jest.fn();
//     });

//     afterEach(() => {
//         jest.restoreAllMocks();
//         jest.clearAllMocks();
//     });

//     afterAll(async () => {
//         console.log('tearing down');
//         await teardownConnections();
//     });

//     describe('POST /ratings', () => {
//         it('should return 400 if rating is missing', async () => {
//             const res = await request(app)
//                 .post('/ratings')
//                 .send({ movieId: 123 });
            
//             expect(res.status).toBe(statusCodes.badRequest);
//             expect(res.body).toEqual({ message: 'Missing parameters' });
//         });

//         it('should return 400 if movieId is not a number', async () => {
//             const res = await request(app).post('/ratings/abc').send({ rating: 5 });

//             expect(res.status).toBe(statusCodes.badRequest);
//             expect(res.body).toEqual({ message: 'Invalid movie ID' });
//         });

//         it('should return 400 if rating is out of acceptable range', async () => {
//             const res = await request(app)
//                 .post('/ratings')
//                 .send({ movieId: 123, rating: 6 });
            
//             expect(res.status).toBe(statusCodes.badRequest);
//             expect(res.body).toEqual({ message: 'Rating must be between 1 and 5' });
//         });

//         it('should add rating and return 200 if successful', async () => {
//             const ratingDetails = { movieId: 123, rating: 5 };
//             const res = await request(app)
//                 .post('/ratings')
//                 .send(ratingDetails);

//             expect(res.status).toBe(statusCodes.success);
//             expect(res.body).toEqual({ message: 'Rating added successfully' });
//         });

//         it('should return 500 if an exception occurs', async () => {
//             jest.spyOn(ratingModel.prototype, 'save').mockRejectedValueOnce(new Error('Error occurred'));

//             const res = await request(app)
//                 .post('/ratings')
//                 .send({ movieId: 123, rating: 5 });

//             expect(res.status).toBe(statusCodes.queryError);
//             expect(res.body).toEqual({ error: 'Exception occurred while adding rating' });
//             expect(logger.error).toHaveBeenCalled();
//         });
//     });

//     describe('GET /ratings', () => {
//         it('should return the average rating for a movie', async () => {
//             const movieId = 123;
//             const res = await request(app)
//                 .get(`/ratings/${movieId}`);

//             expect(res.status).toBe(statusCodes.success);
//             expect(res.body).toHaveProperty('averageRating');
//             expect(res.body.averageRating).toBe(4.5);
//         });

//         it('should return an error when there is a database error', async () => {
//             const movieId = 123;
//             jest.spyOn(pool, 'query').mockRejectedValueOnce(new Error('Database error'));

//             const res = await request(app)
//                 .get(`/ratings/${movieId}`);

//             expect(res.status).toBe(statusCodes.queryError);
//             expect(res.body).toEqual({ error: 'Exception occurred while fetching ratings' });
//         });
//     });
// });