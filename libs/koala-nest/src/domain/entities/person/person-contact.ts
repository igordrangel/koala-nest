import { AutoMap } from '@/core/tools/mapping';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
} from 'typeorm';
import type { Person } from './person';
import { EntityBase } from '@/core/base/entity.base';

@Entity('person_contact')
export class PersonContact extends EntityBase<PersonContact> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  contact: string;

  @ManyToOne('Person', 'contacts', {
    onDelete: 'CASCADE',
    orphanedRowAction: 'delete',
  })
  @AutoMap()
  person: Relation<Person>;
}
