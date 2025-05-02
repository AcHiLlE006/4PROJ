import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn
  } from 'typeorm';
  import { User } from '../../users/user.entity/user.entity';
  import { IncidentType } from './incident_types.entity';
  
  @Entity('active_incidents')
  export class ActiveIncident {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, { nullable: false })
    user: User;
  
    @ManyToOne(() => IncidentType, { nullable: false })
    type: IncidentType;
  
    @Column({ nullable: true })
    description: string;
  
    @Column('decimal', { precision: 9, scale: 6 })
    latitude: number;
  
    @Column('decimal', { precision: 9, scale: 6 })
    longitude: number;
  
    @CreateDateColumn()
    reportedAt: Date;
  
    @Column({ default: 0 })
    confirmedCount: number;
  
    @Column({ default: 0 })
    deniedCount: number;
  }
  