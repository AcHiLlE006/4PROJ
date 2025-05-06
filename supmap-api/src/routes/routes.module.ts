import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './route.entity/route.entity';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';
import { User } from '../users/user.entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../incidents/incidents.module';
import { OsmModule } from '../osm/osm.module';
import { BreModule } from '../bre/bre.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route, ActiveIncident, User]),
    OsmModule,
    BreModule,
    IncidentsModule,
  ],
  providers: [RoutesService],
  controllers: [RoutesController],
  exports: [RoutesService]
})
export class RoutesModule {}
