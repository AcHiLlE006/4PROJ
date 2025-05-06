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

  @Column('jsonb', { nullable: true })
  position: {
    latitude: number;
    longitude: number;
  };

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column('jsonb', { default: false })
  preferences: {
    avoid_highways: boolean;
}
}
