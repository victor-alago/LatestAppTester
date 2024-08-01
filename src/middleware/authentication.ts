import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import statusCodes from '../constants/statusCodes';
import logger from './winston';
import { BaseRequest } from '../types/baseRequest.interface';

export interface DecodedToken {
  user: {
    id: string;
    email: string;
  };
}

const verifyToken = (
  req: BaseRequest,
  res: Response,
  next: NextFunction,
): Response | void => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(statusCodes.unauthorized).json({ error: 'Unauthorized' });
  }

  try {
    const decoded = jwt.verify(
      token.split(' ')[1],
      process.env.JWT_SECRET_KEY as string,
    ) as DecodedToken;
    req.user = decoded.user;

    logger.info('TOKEN USER: ', req.user);
    next();
  } catch (error) {
    logger.error(error);
    return res.status(statusCodes.unauthorized).json({ error: 'Invalid token' });
  }
};

export default verifyToken;