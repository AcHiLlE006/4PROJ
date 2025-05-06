import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('archived_incidents')
export class ArchivedIncident {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  typeId: number;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 9, scale: 6 })
  latitude: number;

  @Column('decimal', { precision: 9, scale: 6 })
  longitude: number;

  @Column()
  reportedAt: Date;

  @Column()
  resolvedAt: Date;

  @Column()
  confirmedCount: number;

  @Column()
  deniedCount: number;
}
