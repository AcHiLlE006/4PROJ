import {
    Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
    JoinTable,
    ManyToMany
  } from 'typeorm';
  import { User } from '../../users/user.entity/user.entity';
  import { ActiveIncident } from 'src/incidents/incidents.entity/incident_active.entity';
  
  @Entity('routes')
  export class Route {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @ManyToOne(() => User, { nullable: false, onDelete: 'CASCADE' })
    user: User;
  
    @Column('decimal', { precision: 9, scale: 6 })
    originLat: number;
  
    @Column('decimal', { precision: 9, scale: 6 })
    originLon: number;
  
    @Column('decimal', { precision: 9, scale: 6 })
    destinationLat: number;
  
    @Column('decimal', { precision: 9, scale: 6 })
    destinationLon: number;
  
    @Column('float')
    distance: number;
  
    @Column('float')
    duration: number;
  
    @Column('jsonb')
    geometry: any;
  
    @Column('jsonb', { nullable: true })
    legs: any;
  
    @Column('jsonb', { nullable: true })
    waypoints: any;

    @Column('boolean', { default: false })
    hasHighway: boolean;

    @Column('float', { default: 0 })
    score: number;
  
    @ManyToMany(() => ActiveIncident)
    @JoinTable({
      name: 'routes_incidents',
      joinColumn: { name: 'route_id', referencedColumnName: 'id' },
      inverseJoinColumn: { name: 'incident_id', referencedColumnName: 'id' },
    })
    incidentsOnRoad: ActiveIncident[];
  
    @CreateDateColumn()
    createdAt: Date;
  }