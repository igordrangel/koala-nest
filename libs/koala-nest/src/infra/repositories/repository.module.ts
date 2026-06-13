import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { IUserRepository } from '@/domain/repositories/iuser.repository';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
import { PersonRepository } from '@/infra/repositories/person.repository';
import { UserRepository } from '@/infra/repositories/user.repository';

@Module({
  imports: [DatabaseModule],
  providers: [
    { provide: IPersonRepository, useClass: PersonRepository },
    { provide: IUserRepository, useClass: UserRepository },
  ],
  exports: [DatabaseModule, IPersonRepository, IUserRepository],
})
export class RepositoryModule {}
