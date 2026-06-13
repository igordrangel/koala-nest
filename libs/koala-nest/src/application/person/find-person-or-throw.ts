import { Person } from '@/domain/entities/person/person';
import { IPersonRepository } from '@/domain/repositories/iperson.repository';
import { NotFoundException } from '@nestjs/common';

export async function findPersonOrThrow(
  repository: IPersonRepository,
  id: number,
): Promise<Person> {
  const person = await repository.findById(id);

  if (!person) {
    throw new NotFoundException('Pessoa não encontrada');
  }

  return person;
}
