import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { TypeOrmModule }     from '@nestjs/typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository }        from 'typeorm';
import * as request          from 'supertest';

import { RoutesModule }      from '../src/routes/routes.module';
import { BreService }        from '../src/bre/bre.service';
import { IncidentsService }  from '../src/incidents/incidents.service';
import { User, UserRole }    from '../src/users/user.entity/user.entity';
import { CreateRouteDto }    from '../src/routes/dto/create-route.dto';

describe('RoutesModule Integration', () => {
  let app: INestApplication;
  let userRepo: Repository<User>;
  let createdUser: User;

  const fakeSuggestions = [
    { id: 's1', distance: 10, duration: 5, geometry: { coordinates: [[0,0],[1,1]] }, legs: [], incidentIds: [], score: 5, hasHighway: false },
    { id: 's2', distance: 20, duration: 10, geometry: { coordinates: [[0,0],[2,2]] }, legs: [], incidentIds: [], score: 12, hasHighway: true },
  ];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [
        // Base SQLite en mémoire
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User],
          synchronize: true,
        }),
        TypeOrmModule.forFeature([User]),
        RoutesModule,
      ],
    })
    // stub du BRE
    .overrideProvider(BreService).useValue({
      sortAndAnnotate: jest.fn().mockResolvedValue(fakeSuggestions),
    })
    // stub de l’IncidentsService
    .overrideProvider(IncidentsService).useValue({
      findAllActiveIncidents: jest.fn().mockResolvedValue([]),
    })
    .compile();

    app = module.createNestApplication();

    // récupérer le repo et créer l'utilisateur AVANT app.init()
    userRepo = module.get<Repository<User>>(getRepositoryToken(User));
    createdUser = userRepo.create({
      username: 'integ',
      email:    'integ@test.com',
      password: 'hash',
      role:     UserRole.USER,
      preferences: { avoid_highways: false },
      position: null,
    });
    await userRepo.save(createdUser);

    // middleware pour injecter req.user
    app.use((req, _res, next) => {
      req.user = { userId: createdUser.id };
      next();
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it(`POST /routes → 201 + suggestions`, async () => {
    const dto: CreateRouteDto = {
      originLat:      0,
      originLon:      0,
      destinationLat: 1,
      destinationLon: 1,
    };

    const res = await request(app.getHttpServer())
      .post('/routes')
      .send(dto);

    expect(res.status).toBe(201);
    expect(res.body).toEqual(fakeSuggestions);
  });
});
