
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BreService } from '../src/bre/bre.service';
import { OsmService } from '../src/osm/osm.service';
import { IncidentsService } from '../src/incidents/incidents.service';
import { RoutesService } from '../src/routes/routes.service';
import { User, UserRole } from '../src/users/user.entity/user.entity';
import { IncidentType } from '../src/incidents/incidents.entity/incident_types.entity';
import { ActiveIncident } from '../src/incidents/incidents.entity/incident_active.entity';
import { ArchivedIncident } from '../src/incidents/incidents.entity/incident_archived.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateIncidentDto } from '../src/incidents/dto/create-incident.dto';

describe('BreService Integration', () => {
  let module: TestingModule;
  let breService: BreService;
  let incidentsService: IncidentsService;
  let userRepo: Repository<User>;
  let typeRepo: Repository<IncidentType>;
  let activeRepo: Repository<ActiveIncident>;

  // Stub pour OsmService
  const mockOsmService = {
    getRawRoutes: jest.fn(),
  };
  // Stub pour RoutesService (appelé par reportIncident)
  const mockRoutesService = { updateRouteImpacted: jest.fn() };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        // Connexion SQLite in-memory
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, IncidentType, ActiveIncident, ArchivedIncident],
          synchronize: true,
        }),
        // Enregistrement des repositories
        TypeOrmModule.forFeature([User, IncidentType, ActiveIncident, ArchivedIncident]),
      ],
      providers: [
        BreService,
        IncidentsService,
        { provide: OsmService,    useValue: mockOsmService },
        { provide: RoutesService, useValue: mockRoutesService },
      ],
    }).compile();

    breService      = module.get(BreService);
    incidentsService= module.get(IncidentsService);
    userRepo        = module.get(getRepositoryToken(User));
    typeRepo        = module.get(getRepositoryToken(IncidentType));
    activeRepo      = module.get(getRepositoryToken(ActiveIncident));
  }, 20000);

  afterAll(async () => {
    await module.close();
  });

  it('should integrate BreService with real DB, IncidentsService and OsmService', async () => {
    // 1) Créer un utilisateur
    const user = await userRepo.save({
      email: 'i@i.com',
      username: 'integ',
      password: 'pwd',
      preferences: { avoid_highways: true },
      role: UserRole.USER,
    });

    // 2) Créer un type d’incident avec penalty
    const type = await typeRepo.save({ id: 1, name: 'test', penalty: 50 });

    // 3) Stub des routes brutes : deux routes, l’une sans autoroute, l’autre avec
    const rawRoutes = [
      {
        geometry: { coordinates: [[0, 0], [1, 1]] },
        legs: [{ roadType: 'primary' }],
        distance: 1,
        duration: 10,
        incidentsOnRoad: [] as ActiveIncident[],
      },
      {
        geometry: { coordinates: [[0, 0], [2, 2]] },
        legs: [{ roadType: 'motorway' }],
        distance: 2,
        duration: 5,
        incidentsOnRoad: [] as ActiveIncident[],
      },
    ];
    mockOsmService.getRawRoutes.mockResolvedValue(rawRoutes);

    // 4) Signaler un incident situé exactement sur les deux lignes
    await incidentsService.reportIncident(user.id, {
      typeId: type.id,
      description: 'test',
      latitude: 1,
      longitude: 1,
    } as CreateIncidentDto);

    const incidents = await incidentsService.findAllActiveIncidents();
    expect(incidents).toHaveLength(1);

    // 5) Appeler sortAndAnnotate
    const annotated = await breService.sortAndAnnotate(
      [1, 1],       // destination
      [0, 0],       // origin
      { avoid_highways: true },
      incidents,
    );

    // 6) Assertions :
    // - Deux routes renvoyées (rawRoutes.length = 2)
    expect(annotated).toHaveLength(2);

    // Calcul des scores attendus :
    // Route 0 (no motorway) : 10 + 0.1 + 50 = 60.1
    // Route 1 (motorway + avoid) : 5 + 0.2 + 50 + 600 = 655.2
    const scores = annotated.map(r => Math.round(r.score * 10) / 10);
    expect(scores).toEqual([60.1, 655.2]);

    // Vérifier que l’incident a bien été annoté
    expect(annotated[0].incidentsOnRoad).toContain(incidents[0]);
    expect(annotated[1].incidentsOnRoad).toContain(incidents[0]);
  });
});
