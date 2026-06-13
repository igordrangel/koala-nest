import { ListResponse } from '@/core/types';
import { PersonQueryDto } from '../dtos/person-query.dto';
import { Person } from '../entities/person/person';

export abstract class IPersonRepository {
  abstract findMany(query: PersonQueryDto): Promise<ListResponse<Person>>;
  abstract findById(id: number): Promise<Person | null>;
  abstract save(person: Person): Promise<Person>;
  abstract delete(person: Person): Promise<void>;
}
