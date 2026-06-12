import { Person } from '@/domain/entities/person/person';
import { PersonAddress } from '@/domain/entities/person/person-address';
import { PersonContact } from '@/domain/entities/person/person-contact';
import { DataSource } from 'typeorm';
import { EnvService } from '../common/env.service';

export const DATA_SOURCE_PROVIDER_TOKEN = 'DATA_SOURCE';

export async function dataSourceFactory(env: EnvService) {
  const dataSource = new DataSource({
    type: 'postgres',
    url: env.get('DATABASE_URL'),
    entities: [Person, PersonAddress, PersonContact],
    invalidWhereValuesBehavior: {
      undefined: 'ignore',
    },
  });

  await dataSource.initialize();

  return dataSource;
}
