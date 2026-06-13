import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { Module } from '@nestjs/common';
import { DatabaseModule } from '@/infra/database/database.module';
import { PersonRepository } from '@/infra/repositories/person.repository';

@Module({
  imports: [DatabaseModule],
  providers: [{ provide: IPersonRepository, useClass: PersonRepository }],
  exports: [DatabaseModule, IPersonRepository],
})
export class RepositoryModule {}
