import AppError from '@shared/errors/AppError';
import UserAccount from 'src/entities/UserAccount';
import { UserAccountRepository } from 'src/repositories/UserAccountRepository';
import { getCustomRepository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';

interface UserAccountRequest {
  name?: string;
  email: string;
  password: string;
}

interface ResponseSession {
  userAccount: UserAccount;
  token: string;
}

export default class UserAccountService {
  public async create({
    name,
    email,
    password,
  }: UserAccountRequest): Promise<UserAccount> {
    const repository = getCustomRepository(UserAccountRepository);

    const existsEmail = await repository.findByEmail(email);

    if (existsEmail) throw new AppError('Email already exists!');

    const hashedPassword = await hash(password, 8);

    const userAccount = repository.create({
      name,
      email,
      password: hashedPassword,
    });

    await repository.save(userAccount);

    return userAccount;
  }

  public async logIn({
    email,
    password,
  }: UserAccountRequest): Promise<ResponseSession> {
    const repository = getCustomRepository(UserAccountRepository);

    const userAccount = await repository.findByEmail(email);

    if (!userAccount)
      throw new AppError(
        'Incorrect email/password combination!',
        StatusCodes.UNAUTHORIZED,
      );

    const correctPassword = await compare(password, userAccount.password);

    if (!correctPassword)
      throw new AppError(
        'Email or password is wrong!',
        StatusCodes.UNAUTHORIZED,
      );

    const token = sign({}, `${authConfig.jwt.secret}`, {
      subject: userAccount.id,
      expiresIn: authConfig.jwt.expiresIn,
    });

    return { userAccount, token };
  }
}
