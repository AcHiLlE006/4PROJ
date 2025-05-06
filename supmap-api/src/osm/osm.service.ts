// src/osm/osm.service.ts
import { Injectable, Inject, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { Cache } from 'cache-manager';
import { firstValueFrom } from 'rxjs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class OsmService {
  private readonly logger = new Logger(OsmService.name);

  constructor(
    private readonly http: HttpService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  /** Récupère une tuile {z}/{x}/{y}.png */
  async getTile(z: number, x: number, y: number): Promise<Buffer> {
    const key = `tile:${z}:${x}:${y}`;
    const cached = await this.cache.get<Buffer>(key);
    if (cached) return cached;

    const url = `https://tile.openstreetmap.org/${z}/${x}/${y}.png`;
    const response = await firstValueFrom(
      this.http.get<Buffer>(url, { responseType: 'arraybuffer' }),
    );
    await this.cache.set(key, response.data, 3600); // 1h
    return response.data;
  }

  /** Récupère des itinéraires bruts via OSRM (ou autre) */
  async getRawRoutes(params: {
    origin: [number, number];
    destination: [number, number];
  }): Promise<any[]> {
    const [olat, olon] = params.origin;
    const [dlat, dlon] = params.destination;
    const key = `route:${olat},${olon}:${dlat},${dlon}`;
    const cached = await this.cache.get<any[]>(key);
    if (cached) return cached;

    const url = `http://router.project-osrm.org/route/v1/driving/` +
                `${olon},${olat};${dlon},${dlat}` +
                `?overview=full&geometries=geojson&alternatives=true`;
    const response = await firstValueFrom(this.http.get<any>(url));
    const routes = response.data.routes; // [{geometry, distance, duration, …}, …]
    await this.cache.set(key, routes, 3600); // 1h
    this.logger.debug(`Cached OSRM response under ${key}`);
    return routes;
  }
}
