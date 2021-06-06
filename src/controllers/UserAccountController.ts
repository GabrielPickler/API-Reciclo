import { Request, Response } from 'express';
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
}
