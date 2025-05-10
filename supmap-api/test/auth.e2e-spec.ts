// supmap-api/src/test/auth.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { User } from '../src/users/user.entity/user.entity';

describe('AuthModule (e2e) - SQLite minimal', () => {
  let app: INestApplication;
  let jwtToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        // On monte une BDD SQLite en mémoire, vide à chaque démarrage
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
        AuthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  }, 20000); // timeout 20s pour le hook

  it('/auth/register (POST) → 201 + token', () =>
    request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: 'e2e@t.com', username: 'e2e', password: 'secret123' })
      .expect(201)
      .expect(res => {
        expect(res.body.body).toHaveProperty('access_token');
      }),
  );

  it('/auth/login (POST) → 201 + token', () =>
    request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'e2e@t.com', password: 'secret123' })
      .expect(201)
      .expect(res => {
        expect(res.body).toHaveProperty('access_token');
        jwtToken = res.body.access_token;
      }),
  );

  it('/auth/profile (GET) → 200 + user.email', () =>
    request(app.getHttpServer())
      .get('/auth/profile')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect(res => {
        expect(res.body).toHaveProperty('email', 'e2e@t.com');
      }),
  );

  afterAll(async () => await app.close());
});
// Note : pour le moment, on ne teste pas les routes OAuth2 (Google, Facebook) car elles nécessitent un vrai compte et une vraie redirection  