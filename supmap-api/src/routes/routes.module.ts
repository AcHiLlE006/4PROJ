import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { Route } from './route.entity/route.entity';
import { ActiveIncident } from 'src/incidents/incidents.entity/incident_active.entity';
import { User } from 'src/users/user.entity/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from 'src/incidents/incidents.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Route, ActiveIncident, User]),
    OsmModule,
    BreModule,
    IncidentsModule,
  ],
  providers: [RoutesService],
  controllers: [RoutesController]
})
export class RoutesModule {}
