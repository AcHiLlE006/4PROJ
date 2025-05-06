import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { AppModule } from '../app.module';
import { User, UserRole } from '../users/user.entity/user.entity';
import { IncidentType } from '../incidents/incidents.entity/incident_types.entity';
import { OsmService } from '../osm/osm.service';

describe('Full API Flow (e2e)', () => {
  let app: INestApplication;
  let jwtToken: string;
  let incidentId: string;

  // Stub OsmService to return three raw routes
  const osmMock = {
    getRawRoutes: jest.fn().mockResolvedValue([
      {
        geometry: { type: 'LineString', coordinates: [[0, 0], [1, 1]] },
        distance: 100,
        duration: 100,
        legs: [{ roadType: 'residential' }],
        waypoints: [],
        incidentsOnRoad: [],
      },
      {
        geometry: { type: 'LineString', coordinates: [[0, 0], [2, 2]] },
        distance: 200,
        duration: 200,
        legs: [{ roadType: 'residential' }],
        waypoints: [],
        incidentsOnRoad: [],
      },
      {
        geometry: { type: 'LineString', coordinates: [[0, 0], [3, 3]] },
        distance: 300,
        duration: 300,
        legs: [{ roadType: 'residential' }],
        waypoints: [],
        incidentsOnRoad: [],
      },
    ]),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: [__dirname + '/../src/**/*.entity{.ts,.js}'],
          synchronize: true,
        }),
        AppModule,
      ],
    })
      .overrideProvider(OsmService)
      .useValue(osmMock)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    // 1) Register a new user
    await request(app.getHttpServer())
      .post('/auth/register')
      .send({ username: 'alice', email: 'alice@example.com', password: 'secret123' })
      .expect(201);

    // 2) Log in to get JWT
    const loginRes = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'alice@example.com', password: 'secret123' })
      .expect(200);
    jwtToken = loginRes.body.access_token;

    // 3) Create an incident type
    const typeRepo = moduleFixture.get(getRepositoryToken(IncidentType));
    const type = await typeRepo.save({ name: 'roadblock' });

    // 4) Report an incident at (1,1)
    const incRes = await request(app.getHttpServer())
      .post('/incidents')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ typeId: type.id, description: 'Test block', latitude: 1, longitude: 1 })
      .expect(201);
    incidentId = incRes.body.id;
  });

  afterAll(async () => {
    await app.close();
  });

  it('should return 3 routes and ensure the incident is not on the best scoring route', async () => {
    const routeRes = await request(app.getHttpServer())
      .post('/routes')
      .set('Authorization', `Bearer ${jwtToken}`)
      .send({ originLat: 0, originLon: 0, destinationLat: 1, destinationLon: 1 })
      .expect(201);

    const routes = routeRes.body;
    expect(Array.isArray(routes)).toBe(true);
    expect(routes).toHaveLength(3);

    // Find index of route containing the incident
    const incidentRouteIndex = routes.findIndex((r: any) =>
      Array.isArray(r.incidentsOnRoad) && r.incidentsOnRoad.some((i: any) => i.id === incidentId),
    );
    expect(incidentRouteIndex).toBeGreaterThanOrEqual(0);

    // The incident route should not be the first (best scoring)
    expect(incidentRouteIndex).toBeGreaterThan(0);
  });
});
