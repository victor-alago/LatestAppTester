import { Request, Response } from 'express';
import { register, login } from '../../src/controllers/users.controller';
import jwt from 'jsonwebtoken';
import statusCodes from '../../src/constants/statusCodes';

jest.mock('../../src/boot/database/db_connect', () => ({
    query: jest.fn(),
    connect: jest.fn(),
}));
jest.mock('jsonwebtoken');
jest.mock('../../src/middleware/winston', () => ({
    info: jest.fn(),
    error: jest.fn(),
}));

import logger from '../../src/middleware/winston';
import pool from '../../src/boot/database/db_connect';
import { Session, SessionData } from 'express-session';
import { PoolClient } from 'pg';


describe('User Controller', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let client: Partial<PoolClient>;

    beforeEach(() => {
        req = {
            body: {},
            session: {} as Session & SessionData,
        };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        client = {
            query: jest.fn(),
            release: jest.fn(),
        };
        (pool.connect as jest.Mock).mockImplementation(() => client);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should return 400 if email, username, password, or country is missing', async () => {
            await register(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(statusCodes.badRequest);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
            expect(client.query).not.toHaveBeenCalled();
            expect(client.release).not.toHaveBeenCalled();
        });

        it('should return 409 if user already exists', async () => {
            //intentional error
            // (client.query as jest.Mock).mockRejectedValueOnce(new Error('Query error'));

            req.body = {
                email: 'test@test.com',
                username: 'test',
                password: '1234',
                country: 'TestCountry',
            };

            (client.query as jest.Mock).mockResolvedValueOnce({ rowCount: 1 });

            await register(req as Request, res as Response);

            expect(pool.connect).toHaveBeenCalledTimes(1);
            expect(client.query).toHaveBeenCalledWith(
                'SELECT * FROM users WHERE email = $1;',
                ['test@test.com']
            );
            expect(res.status).toHaveBeenCalledWith(statusCodes.userAlreadyExists);
            expect(res.json).toHaveBeenCalledWith({ message: 'User already has an account' });
            expect(client.query).toHaveBeenCalledTimes(1);
            expect(client.release).toHaveBeenCalledTimes(1);
        });

        // it('should return 200 and create user if new', async () => {
        //     req.body = {
        //         email: 'test@test.com',
        //         username: 'test',
        //         password: '1234',
        //         country: 'TestCountry',
        //         street: 'TestStreet',
        //         city: 'TestCity',
        //         creation_date: '2021-01-01',
        //     };
        //     (client.query as jest.Mock)
        //         .mockResolvedValueOnce({ rowCount: 0 }) // No existing user
        //         .mockResolvedValueOnce({ rowCount: 1 }) // User creation (insert into users)
        //         .mockResolvedValueOnce({ rowCount: 1 }) // Address creation (insert into addresses)
        //         .mockResolvedValueOnce({ rowCount: 1 }); // Commit transaction

        //     await register(req as Request, res as Response);

        //     expect(client.query).toHaveBeenNthCalledWith(1, expect.any(String), expect.any(Array));
        //     expect(client.query).toHaveBeenNthCalledWith(2, 'BEGIN');
        //     expect(client.query).toHaveBeenNthCalledWith(3, `INSERT INTO users(email, username, password, creation_date) VALUES ($1, $2, crypt($3, gen_salt('bf')), $4);`,
        //         [req.body.email, req.body.username, req.body.password, req.body.creation_date]
        //     );
        //     expect(client.query).toHaveBeenNthCalledWith(
        //         4,
        //         `INSERT INTO addresses(email, country, street, city) VALUES ($1, $2, $3, $4);`,
        //         [req.body.email, req.body.country, req.body.street, req.body.city]
        //     );
        //     expect(client.query).toHaveBeenNthCalledWith(5, 'COMMIT');

        //     expect(res.status).toHaveBeenCalledWith(statusCodes.success);
        //     expect(res.json).toHaveBeenCalledWith({ message: 'User created' });

        //     expect(logger.info).toHaveBeenCalledTimes(2);
        //     expect(logger.info).toHaveBeenNthCalledWith(1, 'USER ADDED', 1);
        //     expect(logger.info).toHaveBeenNthCalledWith(2, 'ADDRESS ADDED', 1);
        //     expect(client.query).toHaveBeenCalledTimes(5); // Check user, BEGIN, Add user, Add address, COMMIT

        //     expect(client.release).toHaveBeenCalledTimes(1);
        // });

        it('should return 500 and rollback on user creation error', async () => {
            req.body = {
                email: 'test@test.com',
                username: 'test',
                password: '1234',
                country: 'TestCountry',
                creation_date: '2021-01-01',
            };
            (client.query as jest.Mock)
                .mockResolvedValueOnce({ rowCount: 0 }) // No existing user
                .mockRejectedValueOnce(new Error('User creation error'))
                .mockResolvedValueOnce({ rowCount: 1 }); // Rollback

            await register(req as Request, res as Response);

            expect(client.query).toHaveBeenNthCalledWith(3, 'ROLLBACK');
            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(res.status).toHaveBeenCalledWith(statusCodes.queryError);
            expect(res.json).toHaveBeenCalledWith({ message: 'Exception occurred while registering' });
        });

        it('should return 500 and rollback on address creation error', async () => {
            req.body = {
                email: 'test@test.com',
                username: 'test',
                password: '1234',
                country: 'TestCountry',
                creation_date: '2021-01-01',
            };
            (client.query as jest.Mock)
                .mockResolvedValueOnce({ rowCount: 0 }) // No existing user
                .mockResolvedValueOnce({ rowCount: 1 }) // User creation
                .mockRejectedValueOnce(new Error('Address creation error'))
                .mockResolvedValueOnce({ rowCount: 1 }); // Rollback

            await register(req as Request, res as Response);

            expect(client.query).toHaveBeenNthCalledWith(4, 'ROLLBACK');
            expect(res.status).toHaveBeenCalledWith(statusCodes.queryError);
            expect(res.json).toHaveBeenCalledWith({ message: 'Exception occurred while registering' });
            expect(logger.error).toHaveBeenCalledTimes(1);
            expect(client.release).toHaveBeenCalledTimes(1);
        });
    });

    describe('login', () => {
        it('should return 400 if email or password is missing', async () => {
            await login(req as Request, res as Response);
            expect(res.status).toHaveBeenCalledWith(statusCodes.badRequest);
            expect(res.json).toHaveBeenCalledWith({ message: 'Missing parameters' });
            expect(pool.query).not.toHaveBeenCalled();
        });

        it('should return 500 on query error', async () => {
            req.body = { email: 'test@test.com', password: '1234' };

            (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
                callback(new Error('Query error'), null);
            });

            await login(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(statusCodes.queryError);
            expect(res.json).toHaveBeenCalledWith({ error: 'Exception occurred while logging in' });
        });

        it('should return 404 if email or password is incorrect', async () => {
            req.body = { email: 'test@test.com', password: '1234' };

            (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
                callback(null, { rows: [] });
            });

            await login(req as Request, res as Response);
            expect(jwt.sign).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(statusCodes.notFound);
            expect(res.json).toHaveBeenCalledWith({ message: 'Incorrect email/password' });
        });

        it('should return 200 and a token if email and password are correct', async () => {
            req.body = { email: 'test@test.com', password: '1234' };
            (pool.query as jest.Mock).mockImplementation((_query, _params, callback) => {
                callback(null, { rows: [{ email: 'test@test.com', username: 'test' }] });
            });

            (jwt.sign as jest.Mock).mockReturnValue('fakeToken');

            await login(req as Request, res as Response);

            expect(jwt.sign).toHaveBeenCalledWith(
                { user: { email: 'test@test.com' } },
                process.env.JWT_SECRET_KEY as string,
                { expiresIn: '1h' }
            );
            expect(res.status).toHaveBeenCalledWith(statusCodes.success);
            expect(res.json).toHaveBeenCalledWith({ token: 'fakeToken', username: 'test' });
        });
    });
});

