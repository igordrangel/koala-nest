import { EntityBase } from '@/core/base/entity.base';
import { Entity } from '@/core/database/entity';
import { AutoMap } from '@/core/tools/mapping';
import {
  Column,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { PersonAddress } from './person-address';
import { PersonContact } from './person-contact';

@Entity('person')
export class Person extends EntityBase<Person> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  name: string;

  @Column({ default: true })
  @AutoMap()
  active: boolean;

  @OneToOne(() => PersonAddress, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @AutoMap()
  address: PersonAddress;

  @OneToMany(() => PersonContact, (contact) => contact.person, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  @AutoMap({ type: () => PersonContact })
  contacts: PersonContact[];
}
