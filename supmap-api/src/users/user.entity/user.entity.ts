import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

export enum UserRole {
  USER = 'user',
  CONTRIBUTOR = 'contributor',
  MODERATOR = 'moderator',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string; // stocké chiffré

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;
}
