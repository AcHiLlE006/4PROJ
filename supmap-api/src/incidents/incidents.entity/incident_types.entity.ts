import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('incident_types')
export class IncidentType {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;
}
