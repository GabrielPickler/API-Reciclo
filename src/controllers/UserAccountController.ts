import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserAccountService from '../services/UserAccountService';

export default class UserAccountController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { name, email, password } = req.body;

    const service = new UserAccountService();

    const user = await service.create({ name, email, password });

    return res.json(user);
  }

  public async logIn(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const service = new UserAccountService();

    const user = await service.logIn({ email, password });

    return res.json(user);
  }

  public async updateAvatar(req: Request, res: Response): Promise<Response> {
    const service = new UserAccountService();

    const user = await service.updateUserAvatar(req.user.id, req.file.filename);

    return res.json(user);
  }

  public async resetPassword(req: Request, res: Response): Promise<Response> {
    const { password, token } = req.body;

    const service = new UserAccountService();

    await service.resetPassword(token, password);

    return res.status(StatusCodes.NO_CONTENT).json();
  }
}
