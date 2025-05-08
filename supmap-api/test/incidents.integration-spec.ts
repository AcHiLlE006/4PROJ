import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncidentsModule } from '../src/incidents/incidents.module';
import { IncidentsService } from '../src/incidents/incidents.service';
import { ActiveIncident } from '../src/incidents/incidents.entity/incident_active.entity';
import { ArchivedIncident } from '../src/incidents/incidents.entity/incident_archived.entity';
import { IncidentType } from '../src/incidents/incidents.entity/incident_types.entity';
import { User, UserRole } from '../src/users/user.entity/user.entity';
import { RoutesService } from '../src/routes/routes.service';
import { BreService } from '../src/bre/bre.service';
import { OsmService } from '../src/osm/osm.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateIncidentDto } from '../src/incidents/dto/create-incident.dto';
import { UpdateIncidentStatusDto } from '../src/incidents/dto/update-incident.dto';

describe('IncidentsModule Integration (business cases)', () => {
  let module: TestingModule;
  let service: IncidentsService;
  let userRepo: Repository<User>;
  let typeRepo: Repository<IncidentType>;
  let activeRepo: Repository<ActiveIncident>;
  let archivedRepo: Repository<ArchivedIncident>;

  const mockRoutesService = { updateRouteImpacted: jest.fn() };
  const mockBreService    = {};  // on stubpe tout, aucune méthode n’est utilisée ici
  const mockOsmService    = {};  // idem

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          dropSchema: true,
          entities: [User, IncidentType, ActiveIncident, ArchivedIncident],
          synchronize: true,
        }),
        IncidentsModule,
      ],
    })
    .overrideProvider(RoutesService).useValue(mockRoutesService)
    .overrideProvider(BreService)   .useValue(mockBreService)
    .overrideProvider(OsmService)   .useValue(mockOsmService)
    .compile();

    service      = module.get(IncidentsService);
    userRepo     = module.get(getRepositoryToken(User));
    typeRepo     = module.get(getRepositoryToken(IncidentType));
    activeRepo   = module.get(getRepositoryToken(ActiveIncident));
    archivedRepo = module.get(getRepositoryToken(ArchivedIncident));
  }, 20000);

  afterAll(async () => {
    await module.close();
  });

  let user: User;
  let type: IncidentType;
  let incident: ActiveIncident;

  it('setup: create user & type', async () => {
    user = await userRepo.save(userRepo.create({
      email: 'biz@test.com',
      username: 'bizuser',
      password: 'pwd',
      position: null,
      role: UserRole.USER,
    }));
    type = await typeRepo.save({ id: 1, name: 'accident', penalty: 5 });
    expect(user.id).toBeDefined();
    expect(type.id).toBe(1);
  });

  it('reportIncident creates an active incident', async () => {
    const dto: CreateIncidentDto = {
      typeId: type.id,
      description: 'Crash test',
      latitude: 10,
      longitude: 20,
    };
    incident = await service.reportIncident(user.id, dto);
    expect(incident.id).toBeDefined();
    expect(incident.description).toBe('Crash test');
    expect(mockRoutesService.updateRouteImpacted).toHaveBeenCalledWith(incident);

    const actives = await service.findAllActiveIncidents();
    expect(actives).toHaveLength(1);
  });

  it('updateIncidentStatus: isStillPresent=true increments confirmedCount', async () => {
    const dto: UpdateIncidentStatusDto = { isStillPresent: true };
    const updated = await service.updateIncidentStatus(incident.id, dto);
    expect(updated.confirmedCount).toBe(1);

    const stillActive = await service.findIncidentById(incident.id);
    expect(stillActive).toBeDefined();
  });

  it('updateIncidentStatus: isStillPresent=false increments deniedCount but does not archive (deniedCount <=2)', async () => {
    const dto: UpdateIncidentStatusDto = { isStillPresent: false };

    // Premier refus
    let res1 = await service.updateIncidentStatus(incident.id, dto);
    expect(res1.deniedCount).toBe(1);
    expect(await service.findIncidentById(incident.id)).toBeDefined();
    expect(await service.findAllArchivedIncidents()).toHaveLength(0);

    // Deuxième refus
    // Pour forcer la suite, on met à jour manuellement le compteur
    await activeRepo.update(incident.id, { deniedCount: 1 });
    let res2 = await service.updateIncidentStatus(incident.id, dto);
    expect(res2.deniedCount).toBe(2);
    expect(await service.findIncidentById(incident.id)).toBeDefined();
    expect(await service.findAllArchivedIncidents()).toHaveLength(0);
  });

  it('updateIncidentStatus: isStillPresent=false archives after 3 refus', async () => {
    // On place le compteur à 2
    await activeRepo.update(incident.id, { deniedCount: 2 });

    const dto: UpdateIncidentStatusDto = { isStillPresent: false };
    const archived = await service.updateIncidentStatus(incident.id, dto) as ArchivedIncident;
    expect(archived.id).toBe(incident.id);

    // L’actif doit être vide, l’archive doit contenir 1 en plus
    expect(await service.findAllActiveIncidents()).toHaveLength(0);
    expect(await service.findAllArchivedIncidents()).toHaveLength(1);
  });

  it('ArchiveIncident works directly on active incidents', async () => {
    // Création d’un nouvel incident pour tester ArchiveIncident
    const newInc = await service.reportIncident(user.id, {
      typeId: type.id,
      description: 'To archive',
      latitude: 0,
      longitude: 0,
    });
    const archivedDirect = await service.ArchiveIncident(newInc.id);
    expect(archivedDirect.id).toBe(newInc.id);
    expect(await service.findAllActiveIncidents()).not.toContainEqual(
      expect.objectContaining({ id: newInc.id }),
    );
  });
});
