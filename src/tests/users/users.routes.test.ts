import request from 'supertest';
import { Application } from 'express';
// import { setupDatabase, teardownDatabase } from '../setup/testSetup';
import { buildDB, teardownConnections } from '../config/buildDB';
import { registerCoreMiddleWare } from '../../boot/setup'; 
import { mockUser1, mockUser2 } from './users.mockData';
import logger from '../../middleware/winston';
import statusCodes from '../../constants/statusCodes';
import pool from '../../boot/database/db_connect';
import jwt from 'jsonwebtoken';

describe('Users Routes Integration Tests', () => {
  let app: Application;
  // let poolQuerySpy: jest.SpyInstance;

  beforeAll(async () => {
    // await setupDatabase(); // Setup database with test data
    await buildDB({ users: true });
    app = registerCoreMiddleWare();  
    // poolQuerySpy = jest.spyOn(pool, 'query');
    
  });



  beforeEach(async () => {
    logger.info = jest.fn();
    logger.error = jest.fn();
  });

    afterEach(async () => {
        jest.restoreAllMocks();
        jest.clearAllMocks();
    });

  afterAll(async () => {
    // await teardownDatabase();
    await teardownConnections();
  });


    describe('POST /users/register', () => {
        it('should successfully register a user', async () => {
            const response = await request(app)
            .post('/users/register')
            .send(mockUser1);

            expect(response.status).toBe(statusCodes.success);
            expect(response.body.message).toEqual('User created');
        });

        it('should return a 400 error if missing parameters', async () => {
            const response = await request(app)
            .post('/users/register')
            .send();

            expect(response.status).toBe(statusCodes.badRequest);
            expect(response.body).toEqual({message: 'Missing parameters'});

        });

        it('should return a 409 error if user already exists', async () => {
            const response = await request(app)
            .post('/users/register')
            .send(mockUser1);

            expect(response.status).toBe(statusCodes.userAlreadyExists);
            expect(response.body).toEqual({message: 'User already has an account'});
        });

        it('should return a 500 error if an error occurs during registration', async () => {

         const poolConnectSpy = jest.spyOn(pool, 'connect');
          poolConnectSpy.mockImplementation(() => ({
            query: jest.fn().mockRejectedValueOnce(new Error('Query error')),
            release: jest.fn(),
          }));



            const response = await request(app)
            .post('/users/register')
            .send(mockUser2);

            expect(response.status).toBe(statusCodes.queryError);
            expect(response.body).toEqual({ message: 'Exception occurred while registering' });

        });
    });


    describe('POST /users/login', () => {
        it('POST /users/login should successfully log in the user', async () => {
            // Assuming the user is already registered
            const response = await request(app)
            .post('/users/login')
            .send({
                email: mockUser1.email,
                password: mockUser1.password
            });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('username');
            expect(response.body.username).toEqual(mockUser1.username);

            const decoded = jwt.decode(response.body.token);

            expect(decoded).toHaveProperty('user');
            // expect(decoded.user).toHaveProperty('email', mockUser1.email);

        });

        it('should return a 400 error if missing parameters', async () => {
            const response = await request(app)
            .post('/users/login')
            .send();

            expect(response.status).toBe(statusCodes.badRequest);
            expect(response.body).toEqual({message: 'Missing parameters'});
        });

        it('should return a 404 error if user is not found', async () => {
            const response = await request(app)
            .post('/users/login')
            .send({
                email: 'notemail', 
                password: 'notpassword'
            });

            expect(response.status).toBe(statusCodes.notFound);
            expect(response.body).toEqual({message: 'Incorrect email/password'});
        });

      });
    });