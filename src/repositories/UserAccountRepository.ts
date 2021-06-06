import { EntityRepository, Repository } from 'typeorm';
import UserAccount from '../entities/UserAccount';

@EntityRepository(UserAccount)
export class UserAccountRepository extends Repository<UserAccount> {
  public async findByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<UserAccount | undefined> {
    const useraccount = await this.findOne({
      where: {
        email,
        password,
      },
    });
    return useraccount;
  }

  public async findByEmail(email: string): Promise<UserAccount | undefined> {
    const useraccount = await this.findOne({
      where: {
        email,
      },
    });
    return useraccount;
  }
}
