import { Router } from 'express';
import userAccountRouter from 'src/routes/useraccount.routes';

const routes = Router();

routes.use('/useraccount', userAccountRouter);

routes.get('/', (req, res) => {
  return res.json({ message: 'Hello world!' });
});

export default routes;
