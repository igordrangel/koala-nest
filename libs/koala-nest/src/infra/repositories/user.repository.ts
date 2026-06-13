import { User } from '@/domain/entities/user/user';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { DATA_SOURCE_PROVIDER_TOKEN } from '@/infra/database/data-source-factory';
import { RepositoryBase } from '@/infra/repositories/repository.base';
import { Inject, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository
  extends RepositoryBase<User>
  implements IUserRepository
{
  constructor(@Inject(DATA_SOURCE_PROVIDER_TOKEN) dataSource: DataSource) {
    super(dataSource, User);
  }

  getById(id: string): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  getByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  getByLogin(login: string): Promise<User | null> {
    return this.repository.findOne({ where: { login } });
  }

  save(user: User): Promise<User> {
    if (user.email) {
      user.email = user.email.toLowerCase();
    }

    return this.repository.save(user);
  }
}
