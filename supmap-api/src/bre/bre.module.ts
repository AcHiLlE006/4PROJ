import { Module } from '@nestjs/common';
import { BreService } from './bre.service';

@Module({
  providers: [BreService]
})
export class BreModule {}
