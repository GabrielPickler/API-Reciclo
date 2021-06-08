import 'reflect-metadata';
import express, { NextFunction, Request, Response } from 'express';
import 'express-async-errors';
import { errors } from 'celebrate';
import cors from 'cors';
import routes from './routes';
import AppError from '@shared/errors/AppError';
import '@shared/typeorm';
import 'dotenv/config';
import uploadConfig from '@config/upload';
import { pagination } from 'typeorm-pagination';
import Middlewares from '@shared/http/middlewares';

const app = express();
const middlewares = new Middlewares();

app.use(cors());
app.use(express.json());
app.use(middlewares.rateLimiter);
app.use('/files', express.static(uploadConfig.directory));
app.use(pagination);
app.use(routes);
app.use(errors());

app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      status: 'error',
      message: error.message,
    });
  }

  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
  });
});

app.listen(3333), () => console.log('Server started on port 3333!');
