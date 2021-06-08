import { EntityRepository, Repository } from 'typeorm';
import UserAccount from '../entities/UserAccount';
import UserAccountToken from '../entities/UserAccountToken';

@EntityRepository(UserAccount)
export class UserAccountTokenRepository extends Repository<UserAccountToken> {
  public async findByToken(
    token: string,
  ): Promise<UserAccountToken | undefined> {
    const userToken = await this.findOne({
      where: {
        token,
      },
    });
    return userToken;
  }

  public async generate(userAccountId: string): Promise<UserAccountToken> {
    const userAccountToken = await this.create({
      userAccountId,
    });

    await this.save(userAccountToken);
    return userAccountToken;
  }
}
