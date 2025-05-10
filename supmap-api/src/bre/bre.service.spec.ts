import { BreService } from './bre.service';
import { OsmService } from '../osm/osm.service';
import { IncidentsService } from '../incidents/incidents.service';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';
import booleanPointOnLine from '@turf/boolean-point-on-line';

describe('BreService', () => {
  let service: BreService;
  let osmService: Partial<OsmService>;
  let incidentsService: Partial<IncidentsService>;

  beforeEach(() => {
    osmService = { getRawRoutes: jest.fn() };
    incidentsService = { findIncidentTypeById: jest.fn() };
    service = new BreService(
      osmService as OsmService,
      incidentsService as IncidentsService,
    );
  });

  it('sorts routes by score and returns exactly 3', async () => {
    // Simule 4 routes sans incidents ni autoroutes
    const routes = [
      { geometry:{coordinates:[[0,0],[1,1]]}, legs:[{roadType:'primary'}], distance:100, duration:100, incidentsOnRoad:[] },
      { geometry:{coordinates:[[0,0],[2,2]]}, legs:[{roadType:'primary'}], distance:200, duration:50, incidentsOnRoad:[] },
      { geometry:{coordinates:[[0,0],[3,3]]}, legs:[{roadType:'primary'}], distance:300, duration:10, incidentsOnRoad:[] },
      { geometry:{coordinates:[[0,0],[4,4]]}, legs:[{roadType:'primary'}], distance:400, duration:5, incidentsOnRoad:[] },
    ];
    (osmService.getRawRoutes as jest.Mock).mockResolvedValue(routes as any);

    const result = await service.sortAndAnnotate(
      [4,4], [0,0],
      { avoid_highways: false },
      [],
    );

    expect(result).toHaveLength(3);
    const scores = result.map(r => r.score);
    expect(scores).toEqual([40, 45, 70]);

  });

  it('applies incident penalties and annotates incidentsOnRoad', async () => {
    // Une route avec une unique arête de (0,0)->(1,1)
    const route = {
      geometry:{coordinates:[[0,0],[1,1]]},
      legs:[{roadType:'primary'}],
      distance:1,
      duration:1,
      incidentsOnRoad: [] as ActiveIncident[],
    };
    (osmService.getRawRoutes as jest.Mock).mockResolvedValue([route] as any);

    // Un incident précisément SUR la ligne
    const incident = {
      id: 'X1',
      latitude: 1,
      longitude: 1,
      typeId: 42,
      incidentsOnRoad: [],
      confirmedCount: 0,
      deniedCount: 0,
      reportedAt: new Date(),
      user: { id: 'mockUserId', name: 'Mock User' } as any, // Mock User object
      description: '', // Add appropriate mock value for 'description'
    } as ActiveIncident;
    // Pénalité mockée
    (incidentsService.findIncidentTypeById as jest.Mock)
      .mockResolvedValue({ id: 42, name: '', penalty: 100 });

    const result = await service.sortAndAnnotate(
      [1,1], [0,0],
      { avoid_highways: false },
      [incident],
    );

    expect(result).toHaveLength(1);
    const out = result[0];
    // l'incident est retrouvé
    expect(out.incidentsOnRoad).toContain(incident);
    // score = duration(1) + distance*0.1(0.1) + penalty(100)
    expect(out.score).toBeCloseTo(1 + 0.1 + 100, 5);
  });

  it('penalizes highways when requested', async () => {
    // Route longue mais sur autoroute
    const route = {
      geometry:{coordinates:[[0,0],[1,1]]},
      legs:[{roadType:'motorway'}],
      distance:1,
      duration:1,
      incidentsOnRoad: [] as ActiveIncident[],
    };
    (osmService.getRawRoutes as jest.Mock).mockResolvedValue([route] as any);
    (incidentsService.findIncidentTypeById as jest.Mock).mockResolvedValue(null);

    const result = await service.sortAndAnnotate(
      [1,1], [0,0],
      { avoid_highways: true },
      [],
    );
    expect(result).toHaveLength(1);
    const out = result[0];
    expect(out.hasHighway).toBe(true);
    // score = 1 + 0.1 + 600
    expect(out.score).toBeCloseTo(1 + 0.1 + 600, 5);
  });
});
