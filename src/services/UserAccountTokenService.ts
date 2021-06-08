import AppError from '@shared/errors/AppError';
import { UserAccountRepository } from 'src/repositories/UserAccountRepository';
import { getCustomRepository } from 'typeorm';
import { UserAccountTokenRepository } from 'src/repositories/UserAccountTokenRepository';
import EtherealMail from '@config/mail/EtherealMail';
import path from 'path';

export default class UserAccountTokenService {
  public async sendForgotPasswordEmail(email: string): Promise<void> {
    const userAccountRepository = getCustomRepository(UserAccountRepository);
    const userAccountTokenRepository = getCustomRepository(
      UserAccountTokenRepository,
    );

    const user = await userAccountRepository.findByEmail(email);

    if (!user) throw new AppError('User does not exists!');

    const { token } = await userAccountTokenRepository.generate(user.id);

    const forgotPasswordTemplate = path.resolve(
      __dirname,
      '..',
      'views',
      'forgot_password.hbs',
    );

    await EtherealMail.sendMail({
      to: {
        name: user.name,
        email: user.email,
      },
      subject: '[Reciclo APP] Recuperação de Senha',
      templateData: {
        file: forgotPasswordTemplate,
        variables: {
          name: user.name,
          link: `http://localhost:3000/password/reset?token=${token}`,
        },
      },
    });
  }
}
