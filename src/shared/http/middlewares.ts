import AppError from '@shared/errors/AppError';
import authConfig from '@config/auth';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';

interface JWTPayload {
  iat: number;
  exp: number;
  sub: string;
}

export default class Middleware {
  public isAuthenticated(
    req: Request,
    res: Response,
    next: NextFunction,
  ): void {
    const authHeader = req.headers.authorization;

    if (!authHeader)
      throw new AppError('Token is missing', StatusCodes.UNAUTHORIZED);

    const token = authHeader.split(' ')[1];

    try {
      const decodedToken = verify(token, authConfig.jwt.secret);

      const { sub } = decodedToken as JWTPayload;

      req.user = {
        id: sub,
      };

      return next();
    } catch (error) {
      throw new AppError('Invalid token!', StatusCodes.UNAUTHORIZED);
    }
  }
}
