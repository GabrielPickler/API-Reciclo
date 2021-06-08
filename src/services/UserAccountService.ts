import AppError from '@shared/errors/AppError';
import UserAccount from 'src/entities/UserAccount';
import { UserAccountRepository } from 'src/repositories/UserAccountRepository';
import { getCustomRepository } from 'typeorm';
import { compare, hash } from 'bcryptjs';
import { StatusCodes } from 'http-status-codes';
import { sign } from 'jsonwebtoken';
import authConfig from '@config/auth';
import path from 'path';
import fs from 'fs';
import uploadConfig from '@config/upload';
import { UserAccountTokenRepository } from 'src/repositories/UserAccountTokenRepository';
import { isAfter, addHours } from 'date-fns';

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

  public async updateUserAvatar(
    userId: string,
    avatarFileName: string,
  ): Promise<UserAccount> {
    const repository = getCustomRepository(UserAccountRepository);

    const user = await repository.findOne(userId);

    if (!user) throw new AppError('User not found!');

    if (user.avatar) {
      const userAvatarFilePath = path.join(uploadConfig.directory, user.avatar);
      const userAvatarExists = await fs.promises.stat(userAvatarFilePath);

      if (userAvatarExists) await fs.promises.unlink(userAvatarFilePath);
    }

    user.avatar = avatarFileName;

    await repository.save(user);

    return user;
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    const userAccountRepository = getCustomRepository(UserAccountRepository);
    const userAccountTokenRepository = getCustomRepository(
      UserAccountTokenRepository,
    );

    const userToken = await userAccountTokenRepository.findByToken(token);

    if (!userToken) throw new AppError('Token does not exists!');

    const user = await userAccountRepository.findById(userToken.userAccountId);

    if (!user) throw new AppError('UserAccount does not exists!');

    const tokenCreatedAt = userToken.createdAt;
    const compareDate = addHours(tokenCreatedAt, 2);

    if (isAfter(Date.now(), compareDate)) throw new AppError('Token expired!');

    user.password = await hash(password, 8);

    await userAccountRepository.save(user);
  }
}
