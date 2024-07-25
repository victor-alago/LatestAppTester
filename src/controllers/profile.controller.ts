import { Request, Response } from 'express';
import pool from '../boot/database/db_connect';
import { logger } from '../middleware/winston';
import statusCodes from '../constants/statusCodes';

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
}

interface EditPasswordRequest extends AuthenticatedRequest {
  body: {
    oldPassword: string;
    newPassword: string;
  };
}

const editPassword = async (req: EditPasswordRequest, res: Response) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    res.status(statusCodes.badRequest).json({ message: "Missing parameters" });
  } else {
    if (oldPassword === newPassword) {
      res
        .status(statusCodes.badRequest)
        .json({ message: "New password cannot be equal to old password" });
    } else {
      pool.query(
        "SELECT * FROM users WHERE email = $1 AND password = crypt($2, password);",
        [req.user.email, oldPassword],
        (err, rows) => {
          if (err) {
            logger.error(err.stack);
            res
              .status(statusCodes.queryError)
              .json({ error: "Exception occurred while updating password" });
          } else {
            if (rows.rows[0]) {
              pool.query(
                "UPDATE users SET password = crypt($1, gen_salt('bf')) WHERE email = $2;",
                [newPassword, req.user.email],
                (err) => {
                  if (err) {
                    logger.error(err.stack);
                    res.status(statusCodes.queryError).json({
                      error: "Exception occurred while updating password",
                    });
                  } else {
                    res
                      .status(statusCodes.success)
                      .json({ message: "Password updated" });
                  }
                }
              );
            } else {
              res
                .status(statusCodes.badRequest)
                .json({ message: "Incorrect password" });
            }
          }
        }
      );
    }
  }
};

const logout = async (req: AuthenticatedRequest, res: Response) => {
  if (req.session.user) {
    delete req.session.user;
  }

  return res.status(200).json({ message: "Disconnected" });
};

export {
  editPassword,
  logout,
};