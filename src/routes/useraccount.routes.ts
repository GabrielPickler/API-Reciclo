import { celebrate, Joi, Segments } from 'celebrate';
import { Router } from 'express';
import Middleware from '@shared/http/middlewares';
import UserAccountController from 'src/controllers/UserAccountController';
import multer from 'multer';
import uploadConfig from '@config/upload';
import UserAccountTokenController from 'src/controllers/UserAccountTokenController';

const router = Router();
const controller = new UserAccountController();
const userAccountTokenController = new UserAccountTokenController();
const middleware = new Middleware();
const upload = multer(uploadConfig);

router.post(
  '/',
  celebrate({
    [Segments.BODY]: {
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  controller.create,
);

router.post(
  '/session',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
      password: Joi.string().required(),
    },
  }),
  controller.logIn,
);

router.patch(
  '/avatar',
  middleware.isAuthenticated,
  upload.single('avatar'),
  controller.updateAvatar,
);

router.post(
  '/password/forgot',
  celebrate({
    [Segments.BODY]: {
      email: Joi.string().email().required(),
    },
  }),
  userAccountTokenController.create,
);

router.post(
  '/password/reset',
  celebrate({
    [Segments.BODY]: {
      token: Joi.string().uuid().required(),
      password: Joi.string().required(),
      passwordConfirmation: Joi.string().required().valid(Joi.ref('password')),
    },
  }),
  controller.resetPassword,
);

export default router;
