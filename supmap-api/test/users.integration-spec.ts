import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as request from 'supertest';
import { getRepositoryToken } from '@nestjs/typeorm';

import { UsersModule } from '../src/users/users.module';
import { User, UserRole } from '../src/users/user.entity/user.entity';

describe('UsersModule Integration', () => {
  let app: INestApplication;
  let repo: Repository<User>;
  let createdId: string;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // base en‐mémoire pour l’intégration
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        UsersModule,
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();

    repo = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /users/all → [] au démarrage', async () => {
    const res = await request(app.getHttpServer()).get('/users/all');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('création directe en base puis GET /users/all → 1 user', async () => {
    // Crée un utilisateur “à la sauvage” via le repo
    const u = repo.create({
      username: 'inttest',
      email: 'int@test.com',
      password: 'hash',      // on n’affiche pas le hash ici
      role: UserRole.USER,
      preferences: { avoid_highways: false },
      position: null,
    });
    const saved = await repo.save(u);
    createdId = saved.id;

    const res = await request(app.getHttpServer()).get('/users/all');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(1);
    expect(res.body[0]).toMatchObject({
      id: createdId,
      email: 'int@test.com',
      username: 'inttest',
    });
  });

  it('GET /users/:id → l’utilisateur créé', async () => {
    const res = await request(app.getHttpServer()).get(`/users/${createdId}`);
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      id: createdId,
      email: 'int@test.com',
      username: 'inttest',
    });
  });

  it('GET /users/delete/:id → supprime l’utilisateur', async () => {
    const resDel = await request(app.getHttpServer()).get(`/users/delete/${createdId}`);
    expect(resDel.status).toBe(200);

    // Vérifie qu’il n’y a plus d’utilisateurs
    const resAll = await request(app.getHttpServer()).get('/users/all');
    expect(resAll.status).toBe(200);
    expect(resAll.body).toEqual([]);
  });
});
