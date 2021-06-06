import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import UserAccountController from 'src/controllers/UserAccountController';

const router = Router();
const userAccountController = new UserAccountController();

router.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  userAccountController.create,
);

router.post(
  '/session',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  userAccountController.logIn,
);

export default router;
