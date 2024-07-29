
import { Request, Response } from 'express';
import { editPassword, logout } from '../../src/controllers/profile.controller';
import pool from '../../src/boot/database/db_connect';
import logger from '../../src/middleware/winston';
import statusCodes from '../../src/constants/statusCodes';
import { Session, SessionData } from 'express-session';

jest.mock('../../src/boot/database/db_connect', () => ({
  query: jest.fn(),
}));
jest.mock('../../src/middleware/winston', () => ({
  error: jest.fn(),
}));

describe('Profile Controller', () => {
  let req: Partial<Request & { user: { email: string }; session: Session & SessionData }>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      user: { email: 'user@example.com' },
      body: {},
      session: { user: {} } as Session & SessionData,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('editPassword', () => {
    it('should return 400 if parameters are missing', async () => {
      await editPassword(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(statusCodes.badRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Missing parameters" });
    });

    it('should return 400 if old password and new password are the same', async () => {
      req.body = { oldPassword: 'password', newPassword: 'password' };
      await editPassword(req as any, res as any);
      expect(res.status).toHaveBeenCalledWith(statusCodes.badRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "New password cannot be equal to old password" });
    });

    it('should update password successfully', async () => {
      req.body = { oldPassword: 'oldpassword', newPassword: 'newpassword' };
      (pool.query as jest.Mock).mockImplementationOnce((_sql, _params, callback) => callback(null, { rows: [{ email: 'user@example.com' }], rowCount: 1 }))
                               .mockImplementationOnce((_sql, _params, callback) => callback(null, { rowCount: 1 }));

      await editPassword(req as any, res as any);

      expect(pool.query).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(statusCodes.success);
      expect(res.json).toHaveBeenCalledWith({ message: "Password updated" });
    });

    it('should handle errors during the password update process', async () => {
        req.body = { oldPassword: 'oldpassword', newPassword: 'newpassword' };
        (pool.query as jest.Mock)
          .mockImplementationOnce((_sql, _params, callback) => callback(null, { rows: [{ email: 'user@example.com' }], rowCount: 1 }))
          .mockImplementationOnce((_sql, _params, callback) => callback(new Error('Update password failed'), null));
    
        await editPassword(req as any, res as any);
    
        expect(pool.query).toHaveBeenCalledTimes(2);
        expect(logger.error).toHaveBeenCalled(); // Verifies that logger.error is called on failing to update password
        expect(res.status).toHaveBeenCalledWith(statusCodes.queryError);
        expect(res.json).toHaveBeenCalledWith({ error: "Exception occurred while updating password" });
      });


    it('should handle SQL errors during password update', async () => {
      req.body = { oldPassword: 'oldpassword', newPassword: 'newpassword' };
      (pool.query as jest.Mock).mockImplementationOnce((_sql, _params, callback) => callback(new Error('DB error'), null));

      await editPassword(req as any, res as any);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(logger.error).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(statusCodes.queryError);
      expect(res.json).toHaveBeenCalledWith({ error: "Exception occurred while updating password" });
    });

    it('should return 400 if old password is incorrect', async () => {
      req.body = { oldPassword: 'oldpassword', newPassword: 'newpassword' };
      (pool.query as jest.Mock).mockImplementationOnce((_sql, _params, callback) => callback(null, { rows: [], rowCount: 0 }));

      await editPassword(req as any, res as any);

      expect(pool.query).toHaveBeenCalledTimes(1);
      expect(res.status).toHaveBeenCalledWith(statusCodes.badRequest);
      expect(res.json).toHaveBeenCalledWith({ message: "Incorrect password" });
    });

    
  });

  describe('logout', () => {
    it('should clear the user session and return disconnected message', async () => {
      req.session.user = { email: 'user@example.com' };
      await logout(req as any, res as any);

      expect(req.session.user).toBeUndefined();
      expect(res.status).toHaveBeenCalledWith(statusCodes.success);
      expect(res.json).toHaveBeenCalledWith({ message: "Disconnected" });
    });
  });
});