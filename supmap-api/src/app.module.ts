import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoutesModule } from './routes/routes.module';
import { TrafficModule } from './traffic/traffic.module';
import { IncidentsModule } from './incidents/incidents.module';

@Module({
  imports: [AuthModule, UsersModule, RoutesModule, TrafficModule, IncidentsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
