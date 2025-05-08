import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IncidentsService } from './incidents.service';
import { ActiveIncident } from './incidents.entity/incident_active.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';
import { IncidentType } from './incidents.entity/incident_types.entity';
import { User } from '../users/user.entity/user.entity';
import { Repository } from 'typeorm';
import { RoutesService } from '../routes/routes.service';
import { NotFoundException } from '@nestjs/common';

import { ObjectLiteral } from 'typeorm';

type MockRepo<T extends ObjectLiteral = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('IncidentsService', () => {
  let service: IncidentsService;
  let activeRepo: MockRepo<ActiveIncident>;
  let typeRepo: MockRepo<IncidentType>;
  let archivedRepo: MockRepo<ArchivedIncident>;
  let userRepo: MockRepo<User>;
  let routesService: Partial<Record<keyof RoutesService, jest.Mock>>;

  beforeEach(async () => {
    activeRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };
    typeRepo = {
      find: jest.fn(),
      findOne: jest.fn(),
    };
    archivedRepo = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
    };
    userRepo = {
      findOne: jest.fn(),
    };
    routesService = {
      updateRouteImpacted: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IncidentsService,
        { provide: getRepositoryToken(ActiveIncident), useValue: activeRepo },
        { provide: getRepositoryToken(IncidentType),    useValue: typeRepo },
        { provide: getRepositoryToken(ArchivedIncident), useValue: archivedRepo },
        { provide: getRepositoryToken(User),            useValue: userRepo },
        { provide: RoutesService,                       useValue: routesService },
      ],
    }).compile();

    service = module.get<IncidentsService>(IncidentsService);
  });

  describe('findAllActiveIncidents', () => {
    it('returns all active incidents', async () => {
      const data = [{ id: '1' } as ActiveIncident];
      activeRepo.find!.mockResolvedValue(data);
      await expect(service.findAllActiveIncidents()).resolves.toEqual(data);
    });
  });

  describe('ArchiveIncident', () => {
    it('archives and deletes when found', async () => {
      const incident = { id: '1' } as ActiveIncident;
      activeRepo.findOne!.mockResolvedValue(incident);
      const archivedIncident = { ...incident, typeId: 1, resolvedAt: new Date() } as ArchivedIncident;
      archivedRepo.create!.mockReturnValue(archivedIncident);
      archivedRepo.save!.mockResolvedValue(archivedIncident);

      const result = await service.ArchiveIncident('1');
      expect(archivedRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '1',
          resolvedAt: expect.any(Date),
        })
      );
      
      expect(activeRepo.delete).toHaveBeenCalledWith('1');
      expect(result).toEqual(
        expect.objectContaining({ id: '1' })
      );
      
    });

    it('throws if not found', async () => {
      activeRepo.findOne!.mockResolvedValue(null);
      await expect(service.ArchiveIncident('1')).rejects.toThrow(Error);
    });
  });

  describe('findIncidentTypeById', () => {
    it('returns a type if exists', async () => {
      const t = { id: 2 } as IncidentType;
      typeRepo.findOne!.mockResolvedValue(t);
      await expect(service.findIncidentTypeById(2)).resolves.toEqual(t);
    });

    it('returns undefined if not exists', async () => {
      typeRepo.findOne!.mockResolvedValue(null);
      await expect(service.findIncidentTypeById(99)).resolves.toBeUndefined();
    });
  });

  describe('reportIncident', () => {
    const dto = { typeId: 1, description: 'd', latitude: 0, longitude: 0 };

    it('throws if user missing', async () => {
      userRepo.findOne!.mockResolvedValue(null);
      await expect(service.reportIncident('u1', dto)).rejects.toThrow(NotFoundException);
    });

    it('throws if type missing', async () => {
      userRepo.findOne!.mockResolvedValue({ id: 'u1' } as User);
      typeRepo.findOne!.mockResolvedValue(null);
      await expect(service.reportIncident('u1', dto)).rejects.toThrow(NotFoundException);
    });

    it('creates, updates route and saves', async () => {
      const user = { id: 'u1' } as User;
      userRepo.findOne!.mockResolvedValue(user);

      const created = { user, typeId: 1, description: 'd', latitude: 0, longitude: 0 } as ActiveIncident;
      activeRepo.create!.mockReturnValue(created);
      activeRepo.save!.mockResolvedValue(created);

      const result = await service.reportIncident('u1', dto);

      
      expect(result).toEqual(created);
    });
  });
});
