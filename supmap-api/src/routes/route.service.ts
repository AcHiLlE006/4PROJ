import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken }          from '@nestjs/typeorm';
import { Repository }                  from 'typeorm';
import { NotFoundException }           from '@nestjs/common';

import { RoutesService }               from './routes.service';
import { Route }                       from './route.entity/route.entity';
import { User, UserRole }              from '../users/user.entity/user.entity';
import { ActiveIncident }              from '../incidents/incidents.entity/incident_active.entity';
import { CreateRouteDto }              from './dto/create-route.dto';

describe('RoutesService (unit)', () => {
  let service: RoutesService;
  let routeRepo: Partial<Repository<Route>>;
  let userRepo: Partial<Repository<User>>;
  let breService: { sortAndAnnotate: jest.Mock };
  let incidentsService: { findAllActiveIncidents: jest.Mock };
  let userService: { getPosition: jest.Mock; updatePosition: jest.Mock };
  let notificationService: { notifyRouteImpacted: jest.Mock };

  beforeEach(async () => {
    routeRepo = {
      find:              jest.fn(),
      findOne:           jest.fn(),
      remove:            jest.fn(),
    };
    userRepo = {
      findOne:           jest.fn(),
    };
    breService = { sortAndAnnotate: jest.fn() };
    incidentsService = { findAllActiveIncidents: jest.fn() };
    userService = {
      getPosition:      jest.fn(),
      updatePosition:   jest.fn(),
    };
    notificationService = { notifyRouteImpacted: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: getRepositoryToken(Route), useValue: routeRepo },
        { provide: getRepositoryToken(User),  useValue: userRepo  },
        { provide: 'BreService',              useValue: breService },
        { provide: 'IncidentsService',        useValue: incidentsService },
        { provide: 'UsersService',            useValue: userService },
        { provide: 'NotificationService',     useValue: notificationService },
      ],
    }).compile();

    service = module.get<RoutesService>(RoutesService);
  });

  describe('findAll', () => {
    it('should return all routes', async () => {
      const routes = [ { id: 'r1' } as Route ];
      (routeRepo.find as jest.Mock).mockResolvedValue(routes);

      await expect(service.findAll()).resolves.toEqual(routes);
      expect(routeRepo.find).toHaveBeenCalled();
    });
  });

  describe('createRoute', () => {
    const dto: CreateRouteDto = {
      originLat:  1, originLon: 2,
      destinationLat: 3, destinationLon: 4,
    };
    it('throws if user not found', async () => {
      (userRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.createRoute('u1', dto))
        .rejects.toThrow(NotFoundException);
    });
    it('calls BRE and returns sorted routes', async () => {
      const user = {
        id: 'u1',
        preferences: { avoid_highways: false },
      } as User;
      const incidents = [ { id: 'i1' } as ActiveIncident ];
      const suggestions = [ { foo: 'bar' } ] as any[];

      (userRepo.findOne    as jest.Mock).mockResolvedValue(user);
      (incidentsService.findAllActiveIncidents as jest.Mock).mockResolvedValue(incidents);
      (breService.sortAndAnnotate as jest.Mock).mockResolvedValue(suggestions);

      const result = await service.createRoute('u1', dto);
      expect(incidentsService.findAllActiveIncidents).toHaveBeenCalled();
      expect(breService.sortAndAnnotate)
        .toHaveBeenCalledWith(
          [dto.originLat, dto.originLon],
          [dto.destinationLat, dto.destinationLon],
          user.preferences,
          incidents,
        );
      expect(result).toBe(suggestions);
    });
  });

  describe('findOne', () => {
    it('returns route when found', async () => {
      const r = { id: 'r1' } as Route;
      (routeRepo.findOne as jest.Mock).mockResolvedValue(r);
      await expect(service.findOne('r1')).resolves.toBe(r);
      expect(routeRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'r1' },
        relations: ['user','incidentsOnRoad'],
      });
    });
    it('throws when not found', async () => {
      (routeRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.findOne('nope'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteRoute', () => {
    it('removes when exists', async () => {
      const r = { id: 'r2' } as Route;
      (routeRepo.findOne as jest.Mock).mockResolvedValue(r);
      await expect(service.deleteRoute('r2')).resolves.toBeUndefined();
      expect(routeRepo.remove).toHaveBeenCalledWith(r);
    });
    it('throws if missing', async () => {
      (routeRepo.findOne as jest.Mock).mockResolvedValue(undefined);
      await expect(service.deleteRoute('x')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRouteImpacted', () => {
    it('does nothing when no routes', async () => {
      (routeRepo.find as jest.Mock).mockResolvedValue([]);
      await expect(service.updateRouteImpacted({
        id: 'i1', longitude: 0, latitude: 0,
      } as ActiveIncident)).resolves.toBeUndefined();
      expect(routeRepo.find).toHaveBeenCalled();
    });
    it('throws if user position missing', async () => {
      // simulate a single impacted route
      const route = {
        id: 'r3',
        geometry: { coordinates: [[0,0],[1,1]] },
        user: { id: 'u2' },
        incidentsOnRoad: [],
        destinationLat: 1,
        destinationLon: 1,
        createdAt: new Date(),
      } as any as Route;

      (routeRepo.find as jest.Mock).mockResolvedValue([route]);
      // force booleanPointOnLine always true
      jest.mocked(require('@turf/boolean-point-on-line')).mockReturnValue(true);
      // position missing
      userService.getPosition.mockResolvedValue(null);

      await expect(service.updateRouteImpacted({
        id: 'i1', longitude: 0, latitude: 0,
      } as ActiveIncident)).rejects.toThrow(NotFoundException);
    });
  });
});
