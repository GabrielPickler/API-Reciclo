import AppError from '@shared/errors/AppError';
import authConfig from '@config/auth';
import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { verify } from 'jsonwebtoken';
import redis from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

interface JWTPayload {
  iat: number;
  exp: number;
  sub: string;
}

const redisClient = redis.createClient({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT),
  password: process.env.REDIS_PASS || undefined,
});

const limiter = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: 'ratelimit',
  points: 5,
  duration: 1,
});
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

  public async rateLimiter(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    try {
      await limiter.consume(req.ip);
      return next();
    } catch (error) {
      throw new AppError('Too many requests', StatusCodes.TOO_MANY_REQUESTS);
    }
  }
}
