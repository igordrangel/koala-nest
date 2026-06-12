import { AutoMap } from '@/core/tools/mapping';
import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonAddress } from './person-address';
import { PersonContact } from './person-contact';
import { EntityBase } from '@/core/base/entity.base';

@Entity('person')
export class Person extends EntityBase<Person> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  name: string;

  @OneToOne(() => PersonAddress, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @AutoMap()
  address: PersonAddress;

  @OneToMany(() => PersonContact, (contact) => contact.person, {
    cascade: true,
    eager: true,
    onDelete: 'CASCADE',
  })
  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}
