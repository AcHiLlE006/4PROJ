// src/osm/osm.module.ts
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { OsmService } from './osm.service';
import { OsmController } from './osm.controller';

@Module({
  imports: [
    HttpModule.register({ timeout: 5000, maxRedirects: 5 }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        store: redisStore,
        host: config.get('REDIS_HOST'),
        port: config.get<number>('REDIS_PORT'),
        password: config.get('REDIS_PASSWORD'),
        db: config.get<number>('REDIS_DB'),
        ttl: config.get<number>('REDIS_DEFAULT_TTL'), // valeur par défaut
      }),
    }),
  ],
  providers: [OsmService],
  exports: [OsmService],
  controllers: [OsmController],
})
export class OsmModule {}
