import { Test } from '@nestjs/testing';
import { INestApplication, HttpCode } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as request from 'supertest';
import * as nock from 'nock';
import { OsmModule } from '../src/osm/osm.module';
import { OsmService } from '../src/osm/osm.service';

describe('OsmModule Integration', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({
      imports: [                        // pour HttpService
        CacheModule.register(),                // cache en mémoire
        OsmModule,                             // ton module OSM
      ],
    }).compile();

    app = mod.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    nock.cleanAll();
  });

  describe('GET /osm/tile/:z/:x/:y', () => {
    const z = 5, x = 10, y = 15;
    const tileBuffer = Buffer.from([0x89, 0x50, 0x4E, 0x47]); // PNG magic bytes
    const externalTilePath = `/${z}/${x}/${y}.png`;
    const internalTilePath = `/osm/tile/${z}/${x}/${y}`;

    it('should fetch from OSM and cache it', async () => {
      // 1) On intercepte l’appel à tile.openstreetmap.org
      nock('https://tile.openstreetmap.org')
        .get(externalTilePath)
        .reply(200, tileBuffer, { 'Content-Type': 'image/png' });

      // 2) Premier appel → passe par nock + met en cache
      let res = await request(app.getHttpServer()).get(internalTilePath);
      expect(res.status).toBe(200);
      expect(res.header['content-type']).toBe('image/png');
      expect(res.body).toEqual(tileBuffer);

      // 3) Deuxième appel → doit être servi depuis le cache,
      //    donc pas de nouveau GET vers OSM
      nock.cleanAll();
      // si on re-nock sans définir d’interception, une requête réelle provoquerait une erreur
      res = await request(app.getHttpServer()).get(internalTilePath);
      expect(res.status).toBe(200);
      expect(res.body).toEqual(tileBuffer);
    });
  });

  describe('GET /osm/routes', () => {
    const origin      = [48.8, 2.3];
    const destination = [48.9, 2.4];
    const osrmPath = `/route/v1/driving/${origin[1]},${origin[0]};` +
                     `${destination[1]},${destination[0]}`;
    const osrmQuery = {
      overview: 'full',
      geometries: 'geojson',
      alternatives: 'true',
    };
    const fakeRoutes = {
      routes: [
        { geometry: { coordinates: [[0,0],[1,1]] }, distance: 123, duration: 456, legs: [] },
      ],
    };

    it('should fetch from OSRM and cache it', async () => {
      // 1) Interception OSRM
      nock('http://router.project-osrm.org')
        .get(osrmPath)
        .query(osrmQuery)
        .reply(200, fakeRoutes);

      // 2) Premier appel
      let res = await request(app.getHttpServer())
        .get('/osm/routes')
        .query({
          originLat:      origin[0],
          originLon:      origin[1],
          destinationLat: destination[0],
          destinationLon: destination[1],
        });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeRoutes.routes);

      // 3) Deuxième appel → cache
      nock.cleanAll(); // plus d’interception active
      res = await request(app.getHttpServer())
        .get('/osm/routes')
        .query({
          originLat:      origin[0],
          originLon:      origin[1],
          destinationLat: destination[0],
          destinationLon: destination[1],
        });
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeRoutes.routes);
    });
  });
});
