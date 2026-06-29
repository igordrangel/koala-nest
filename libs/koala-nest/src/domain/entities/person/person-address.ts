import { EntityBase } from '@/core/base/entity.base';
import { Entity } from '@/core/database/entity';
import { AutoMap } from '@/core/tools/mapping';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('person_address')
export class PersonAddress extends EntityBase<PersonAddress> {
  @PrimaryGeneratedColumn()
  @AutoMap()
  id: number;

  @Column()
  @AutoMap()
  address: string;
}
