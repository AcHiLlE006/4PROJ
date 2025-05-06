import { BreService } from './bre.service';
import { OsmService } from '../osm/osm.service';
import * as turf from '@turf/turf';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';

describe('BreService', () => {
  let breService: BreService;
  let osmServiceMock: Partial<OsmService>;

  beforeEach(() => {
    osmServiceMock = {
      getRawRoutes: jest.fn(),
    };
    breService = new BreService({} as any, osmServiceMock as OsmService);
  });

  it('should return 3 routes sorted by score and include a highway-free route even when avoid_highways is false', async () => {
    const rawRoutes = [
      {
        geometry: turf.lineString([[0, 0], [1, 1]]).geometry,
        distance: 100,
        duration: 100,
        legs: [{ roadType: 'motorway' }],
        incidentsOnRoad: [],
      },
      {
        geometry: turf.lineString([[0, 0], [2, 2]]).geometry,
        distance: 200,
        duration: 200,
        legs: [{ roadType: 'residential' }],
        incidentsOnRoad: [],
      },
      {
        geometry: turf.lineString([[0, 0], [3, 3]]).geometry,
        distance: 300,
        duration: 300,
        legs: [{ roadType: 'motorway' }],
        incidentsOnRoad: [],
      },
      {
        geometry: turf.lineString([[0, 0], [4, 4]]).geometry,
        distance: 400,
        duration: 400,
        legs: [{ roadType: 'residential' }],
        incidentsOnRoad: [],
      },
    ];
    (osmServiceMock.getRawRoutes as jest.Mock).mockResolvedValue(rawRoutes);

    const destination: [number, number] = [1, 1];
    const origin: [number, number] = [0, 0];
    const preferences = { avoid_highways: false };
    const incidents: ActiveIncident[] = [
      {
        id: 'inc1',
        latitude: 2,
        longitude: 2,
        type: { id: 1, name: 'test', penalty: 50 },
      } as any,
    ];

    const result = await breService.sortAndAnnotate(destination, origin, preferences, incidents);

    expect(result).toHaveLength(3);
    // Ensure sorted by ascending score
    for (let i = 0; i < result.length - 1; i++) {
      expect(result[i].score).toBeLessThanOrEqual(result[i + 1].score);
    }
    // Ensure at least one highway-free route
    expect(result.some(r => !r.hasHighway)).toBe(true);
  });

  it('should apply highway avoidance penalty when requested', async () => {
    const rawRoutes = [
      {
        geometry: turf.lineString([[0, 0], [1, 1]]).geometry,
        distance: 100,
        duration: 100,
        legs: [{ roadType: 'motorway' }],
        incidentsOnRoad: [],
      },
      {
        geometry: turf.lineString([[0, 0], [2, 2]]).geometry,
        distance: 200,
        duration: 200,
        legs: [{ roadType: 'residential' }],
        incidentsOnRoad: [],
      },
      {
        geometry: turf.lineString([[0, 0], [3, 3]]).geometry,
        distance: 300,
        duration: 300,
        legs: [{ roadType: 'residential' }],
        incidentsOnRoad: [],
      },
    ];
    (osmServiceMock.getRawRoutes as jest.Mock).mockResolvedValue(rawRoutes);

    const result = await breService.sortAndAnnotate([1, 1], [0, 0], { avoid_highways: true }, []);

    const highwayRoute = result.find(r => r.hasHighway);
    const nonHighwayRoute = result.find(r => !r.hasHighway);
    expect((highwayRoute?.score ?? 0)).toBeGreaterThan((nonHighwayRoute?.score ?? 0));
  });
});
