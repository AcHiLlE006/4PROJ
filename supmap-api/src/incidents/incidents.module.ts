import { Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveIncident } from './incidents.entity/incident_active.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';
import { IncidentType } from './incidents.entity/incident_types.entity';
import { User } from '../users/user.entity/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveIncident,
      ArchivedIncident,
      IncidentType,
      User,
    ]),
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}
