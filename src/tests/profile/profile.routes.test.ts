import request from 'supertest';
import { Application } from 'express';
// import { pool, setupDatabase, teardownDatabase, createTestUser } from '../setup/testSetup';
import { registerCoreMiddleWare } from '../../boot/setup'; 
import logger from '../../middleware/winston';
import statusCodes from '../../constants/statusCodes';
import { buildDB, teardownConnections } from '../config/buildDB';
import { mockUser1 } from '../users/users.mockData';
import pool from '../../boot/database/db_connect';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });



describe('Profile Routes Integration Tests', () => {
  let app: Application;
  let testToken: string;
  let poolQuerySpy: jest.SpyInstance;

  beforeAll(async () => {
    await buildDB({ users: true });
    app = registerCoreMiddleWare(); 

    // register a new user
    await request(app)
          .post('/users/register')
          .send(mockUser1);

    // expect(registerResponse.status).toBe(statusCodes.success);
    // expect(registerResponse.body).toEqual({message: 'User created'});

    // login the user
    const loginResponse = await request(app)
          .post('/users/login')
          .send({ email: mockUser1.email, password: mockUser1.password });

    testToken = loginResponse.body.token;

  });


  beforeEach(async () => {
    logger.info = jest.fn();
    logger.error = jest.fn();
    poolQuerySpy = jest.spyOn(pool, 'query');

    // jest.spyOn(pool, 'query').mockClear();
    

  });


  afterAll(async () => {
    await teardownConnections();
  });


  afterEach(async () => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });



  describe('PUT /profile', () => {
    it('should return 400 if parameters are missing', async () => {
      const response = await request(app).put('/profile')
      .set('Authorization', `Bearer ${testToken}`); // Test later --remember to add a valid token using verifyToken
      expect(response.status).toBe(statusCodes.badRequest);
      expect(response.body).toEqual({ message: "Missing parameters" });
    });

    it('should return 400 if old password and new password are the same', async () => {
      const userCredentials = { oldPassword: 'password123', newPassword: 'password123' };
      const response = await request(app)
        .put('/profile')
        .send(userCredentials)
        .set('Authorization', `Bearer ${testToken}`); // Test later --remember to add a valid token using

      expect(response.status).toBe(statusCodes.badRequest);
      expect(response.body).toEqual({ message: "New password cannot be equal to old password" });
    });

    it('should return 400 if old password is incorrect', async () => {
      const userCredentials = { oldPassword: 'wrongpassword', newPassword: 'newpassword123' };
      const response = await request(app)
        .put('/profile')
        .send(userCredentials)
        .set('Authorization', `Bearer ${testToken}`); // Test later --remember to add a valid token using verifyToken

      expect(response.status).toBe(statusCodes.badRequest);
      expect(response.body).toEqual({ message: "Incorrect password" });
    });
        

    it('should update the password correctly', async () => {
      const userCredentials = { oldPassword: mockUser1.password, newPassword: 'newpassword123' };
      const response = await request(app)
        .put('/profile')
        .send(userCredentials)
        .set('Authorization', `Bearer ${testToken}`);  //  Test later --remember to add a valid token using verifyToken

      expect(response.status).toBe(200);
      expect(response.body.message).toEqual("Password updated");
    });

    it('should handle database errors during password check', async () => {
        // const userCredentials = { oldPassword: 'password123', newPassword: 'newpassword123' };
        (logger.error as jest.Mock).mockImplementationOnce(() => { }); // Mock the logger.error function to prevent it from throwing an error
        
        poolQuerySpy.mockImplementation((_query, _params, callback) => {
          callback(new Error('Query error'), null);
      });

        const response = await request(app)
          .put('/profile')
          .send({ oldPassword: 'password123', newPassword: 'newpassword123' })
          .set('Authorization', `Bearer ${testToken}`);

        expect(response.status).toBe(statusCodes.queryError);
        expect(response.body).toEqual({ error: "Exception occurred while updating password"});
    });
  });



  describe('POST /profile', () => {
    it('should logout the user and clear the session', async () => {
      const response = await request(app)
        .post('/profile')
        .set('Authorization', `Bearer ${testToken}`); // Ensure a session is established first in the test setup

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Disconnected" });

    });

    // it('should return an unauthorized error if no token provided', async () => {
    //     const response = await request(app).post('/profile');
        
    //     expect(response.status).toBe(401);
    //     expect(response.body.error).toEqual("Unauthorized");
    // });
  });
});

