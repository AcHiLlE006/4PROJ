import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity/user.entity';
import { LocalStrategy } from './strategies/local.strategy/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy/facebook.strategy';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([User]),
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (cs: ConfigService) => ({
        secret: cs.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '1h' },
      }),
    }),
  ],
  providers: [
    UsersService,
    AuthService,
    LocalStrategy,
    JwtStrategy
  ],
  controllers: [AuthController],
})
export class AuthModule {}
