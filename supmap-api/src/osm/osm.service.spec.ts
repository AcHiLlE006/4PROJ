import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { of } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { OsmService } from './osm.service';

describe('OsmService', () => {
  let service: OsmService;
  let httpService: Partial<Record<keyof HttpService, jest.Mock>>;
  let cache: Partial<Record<keyof Cache, jest.Mock>>;

  beforeEach(async () => {
    httpService = {
      get: jest.fn(),
    };
    cache = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OsmService,
        { provide: HttpService, useValue: httpService },
        { provide: 'CACHE_MANAGER', useValue: cache },
      ],
    }).compile();

    service = module.get(OsmService);
  });

  describe('getTile', () => {
    const z = 1, x = 2, y = 3;
    const key = `tile:${z}:${x}:${y}`;
    const fakeBuffer = Buffer.from([0x01, 0x02]);

    it('should return cached tile if present', async () => {
      (cache.get as jest.Mock).mockResolvedValue(fakeBuffer);

      const result = await service.getTile(z, x, y);
      expect(cache.get).toHaveBeenCalledWith(key);
      expect(result).toBe(fakeBuffer);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch, cache and return tile if not cached', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      // simulate http.get(url, {responseType}) returning observable of { data: Buffer }
      const response = { data: fakeBuffer };
      (httpService.get as jest.Mock).mockReturnValue(of(response));

      const result = await service.getTile(z, x, y);
      const expectedUrl = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;

      expect(cache.get).toHaveBeenCalledWith(key);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl, { responseType: 'arraybuffer' });
      expect(cache.set).toHaveBeenCalledWith(key, fakeBuffer, 3600);
      expect(result).toBe(fakeBuffer);
    });
  });

  describe('getRawRoutes', () => {
    const origin = [48.8, 2.3] as [number, number];
    const destination = [48.9, 2.4] as [number, number];
    const key = `route:${origin[0]},${origin[1]}:${destination[0]},${destination[1]}`;
    const fakeRoutes = [{ foo: 'bar' }];

    it('should return cached routes if present', async () => {
      (cache.get as jest.Mock).mockResolvedValue(fakeRoutes);

      const result = await service.getRawRoutes({ origin, destination });
      expect(cache.get).toHaveBeenCalledWith(key);
      expect(result).toBe(fakeRoutes);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch, cache and return routes if not cached', async () => {
      (cache.get as jest.Mock).mockResolvedValue(null);
      const osrmResponse = { data: { routes: fakeRoutes } };
      (httpService.get as jest.Mock).mockReturnValue(of(osrmResponse));

      const result = await service.getRawRoutes({ origin, destination });

      const [olat, olon] = origin;
      const [dlat, dlon] = destination;
      const expectedUrl =
        `http://router.project-osrm.org/route/v1/driving/` +
        `${olon},${olat};${dlon},${dlat}` +
        `?overview=full&geometries=geojson&alternatives=true`;

      expect(cache.get).toHaveBeenCalledWith(key);
      expect(httpService.get).toHaveBeenCalledWith(expectedUrl);
      expect(cache.set).toHaveBeenCalledWith(key, fakeRoutes, 3600);
      expect(result).toBe(fakeRoutes);
    });
  });
});
