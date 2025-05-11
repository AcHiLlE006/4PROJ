import { forwardRef, Module } from '@nestjs/common';
import { BreService } from './bre.service';
import { OsmModule } from '../osm/osm.module';
import { IncidentsModule } from '../incidents/incidents.module';
import { In } from 'typeorm';

@Module({
  imports: [
    OsmModule,
    IncidentsModule,
  ],
  providers: [BreService],
  exports: [BreService],
})
export class BreModule {}
