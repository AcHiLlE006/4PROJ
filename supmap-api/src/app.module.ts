import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RoutesModule } from './routes/routes.module';
import { TrafficModule } from './traffic/traffic.module';
import { IncidentsModule } from './incidents/incidents.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from '@nestjs/config';
import * as nodeCrypto from 'crypto';

// Polyfill minimal de Web Crypto pour que NestJS/TypeORM puisse appeler crypto.randomUUID()
if (typeof (globalThis as any).crypto === 'undefined') {
  (globalThis as any).crypto = {
    randomUUID: () => nodeCrypto.randomUUID(),
    subtle: nodeCrypto.webcrypto.subtle,
    getRandomValues: nodeCrypto.webcrypto.getRandomValues.bind(nodeCrypto.webcrypto),
  };
}

@Module({
  imports: [AuthModule,
     UsersModule,
     RoutesModule,
     TrafficModule,
     IncidentsModule,
     ConfigModule.forRoot({ isGlobal: true, envFilePath: '../.env' }),
     TypeOrmModule.forRootAsync({
       imports: [ConfigModule],
       useFactory: (configService: ConfigService) => ({
         type: 'postgres',
         entities: [__dirname + '/**/*.entity{.ts,.js}'],
         host: configService.get<string>('DB_HOST'),
         port: parseInt(configService.get<string>('DB_PORT', '5432'), 10),
         username: configService.get<string>('DB_USER'),
         password: configService.get<string>('DB_PASSWORD'),
         database: configService.get<string>('DB_NAME'),
       }),
       inject: [ConfigService],
     })],
      controllers: [],
      providers: [],
    })
    export class AppModule {}
