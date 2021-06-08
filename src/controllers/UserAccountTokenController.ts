import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import UserAccountTokenService from 'src/services/UserAccountTokenService';

export default class UserAccountTokenController {
  public async create(req: Request, res: Response): Promise<Response> {
    const { email } = req.body;

    const service = new UserAccountTokenService();

    await service.sendForgotPasswordEmail(email);

    return res.status(StatusCodes.NO_CONTENT).json();
  }
}
