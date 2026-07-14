import { EntityBase } from '@/core/base/entity.base';
import { Entity } from '@/core/database/entity';
import { AutoMap } from '@/core/tools/mapping';
import { User } from '@/domain/entities/user/user';
import { ApiKeyType } from './enums/api-key-type.enum';
import {
  Column,
  CreateDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('api_key')
export class ApiKey extends EntityBase<ApiKey> {
  @PrimaryGeneratedColumn('uuid')
  @AutoMap()
  id: string;

  @Column({ type: 'varchar' })
  @AutoMap()
  type: ApiKeyType;

  /** Lista CSV de IPs e/ou domínios (domain), hosts ou URIs conforme `type`. */
  @Column()
  @AutoMap()
  origin: string;

  /** JWT RS256 com typ=api-key — exposto apenas na criação. */
  @Column()
  key: string;

  @Column({ name: 'user_id' })
  @AutoMap()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  @AutoMap()
  createdAt: Date;
}
