import { Test, TestingModule } from '@nestjs/testing';
import { IncidentsController } from './incidents.controller';
import { IncidentsService } from './incidents.service';
import { ActiveIncident } from './incidents.entity/incident_active.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident.dto';

describe('IncidentsController', () => {
  let controller: IncidentsController;
  let service: Partial<Record<keyof IncidentsService, jest.Mock>>;

  beforeEach(async () => {
    service = {
      findAllActiveIncidents: jest.fn(),
      findIncidentById: jest.fn(),
      reportIncident: jest.fn(),
      findAllArchivedIncidents: jest.fn(),
      updateIncidentStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [IncidentsController],
      providers: [
        { provide: IncidentsService, useValue: service },
      ],
    }).compile();

    controller = module.get<IncidentsController>(IncidentsController);
  });

  describe('list()', () => {
    it('devrait renvoyer tous les incidents actifs', async () => {
      const mockData: ActiveIncident[] = [{ id: '1' } as ActiveIncident];
      service.findAllActiveIncidents!.mockResolvedValue(mockData);
      await expect(controller.list()).resolves.toEqual(mockData);
      expect(service.findAllActiveIncidents).toHaveBeenCalled();
    });
  });

  describe('getById()', () => {
    it('devrait renvoyer un incident par son id', async () => {
      const mock: ActiveIncident = { id: '42' } as ActiveIncident;
      service.findIncidentById!.mockResolvedValue(mock);
      await expect(controller.getById('42')).resolves.toEqual(mock);
      expect(service.findIncidentById).toHaveBeenCalledWith('42');
    });
  });

  describe('report()', () => {
    it('devrait créer un nouvel incident pour l’utilisateur', async () => {
      const dto: CreateIncidentDto = {
        typeId: 1,
        description: 'Test',
        latitude: 48.5,
        longitude: 2.3,
      };
      const req = { user: { userId: 'user1' } };
      const mock: ActiveIncident = { id: 'i1' } as ActiveIncident;
      service.reportIncident!.mockResolvedValue(mock);

      await expect(controller.report(req as any, dto)).resolves.toEqual(mock);
      expect(service.reportIncident).toHaveBeenCalledWith('user1', dto);
    });
  });

  describe('listArchived()', () => {
    it('devrait renvoyer tous les incidents archivés', async () => {
      const mockData: ArchivedIncident[] = [{ id: 'a1' } as ArchivedIncident];
      service.findAllArchivedIncidents!.mockResolvedValue(mockData);
      await expect(controller.listArchived()).resolves.toEqual(mockData);
      expect(service.findAllArchivedIncidents).toHaveBeenCalled();
    });
  });

  describe('updateStatus()', () => {
    it('devrait mettre à jour le statut d’un incident', async () => {
      const dto: UpdateIncidentStatusDto = { isStillPresent: false };
      const mock: ArchivedIncident = { id: 'i2' } as ArchivedIncident;
      service.updateIncidentStatus!.mockResolvedValue(mock);

      await expect(controller.updateStatus('i2', dto)).resolves.toEqual(mock);
      expect(service.updateIncidentStatus).toHaveBeenCalledWith('i2', dto);
    });
  });
});
