import { forwardRef, Module } from '@nestjs/common';
import { IncidentsService } from './incidents.service';
import { IncidentsController } from './incidents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActiveIncident } from './incidents.entity/incident_active.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';
import { IncidentType } from './incidents.entity/incident_types.entity';
import { User } from '../users/user.entity/user.entity';
import { Route } from '../routes/route.entity/route.entity';
import { RouterModule } from '@nestjs/core';
import { RoutesModule } from '../routes/routes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ActiveIncident,
      ArchivedIncident,
      IncidentType,
      User,
    ]),
    forwardRef(() => RoutesModule), 
  ],
  providers: [IncidentsService],
  controllers: [IncidentsController],
  exports: [IncidentsService],
})
export class IncidentsModule {}
