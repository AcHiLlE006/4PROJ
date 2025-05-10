
import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Route } from './route.entity/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { OsmService } from '../osm/osm.service';
import { BreService } from '../bre/bre.service';
import { IncidentsService } from '../incidents/incidents.service';
import { User } from '../users/user.entity/user.entity';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';
import booleanPointOnLine from '@turf/boolean-point-on-line';
import { UsersService } from '../users/users.service';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @Inject(forwardRef(() => BreService))
    private readonly breService: BreService,
    @Inject(forwardRef(() => IncidentsService))
    private readonly incidentsService: IncidentsService,
    private readonly userService: UsersService,
    private readonly notificationService: NotificationService
  ) {}


    /** Récupère tous les itinéraires */
    async findAll(): Promise<Route[]> {
        return this.routeRepo.find();
        }

  /** Crée un nouvel itinéraire pour un utilisateur */
  async createRoute(
    userId: string,
    dto: CreateRouteDto,
  ): Promise<Route[]> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException(`User ${userId} not found`);


    // Récupérer la liste des incidents actifs
    const activeIncidents = await this.incidentsService.findAllActiveIncidents();

    const origin: [number, number] = [dto.originLat, dto.originLon];
    const destination: [number, number] = [dto.destinationLat, dto.destinationLon];

    //Trier et annoter via le BRE
    const sorted = await this.breService.sortAndAnnotate(
      origin,
      destination,
      user.preferences,
      activeIncidents,
    );
    // sorted: [{ geometry, legs, waypoints, distance, duration, incidentIds: string[] }, ...]

    
    return sorted;
  }

  /** Récupère tous les itinéraires d’un utilisateur */
  async findAllForUser(userId: string): Promise<Route[]> {
    return this.routeRepo.find({
      where: { user: { id: userId } },
      relations: ['incidentsOnRoad'],
      order: { createdAt: 'DESC' },
    });
  }

  /** Récupère un itinéraire par son id */
  async findOne(id: string): Promise<Route> {
    const route = await this.routeRepo.findOne({
      where: { id },
      relations: ['user','incidentsOnRoad'],
    });
    if (!route) throw new NotFoundException(`Route ${id} not found`);
    return route;
  }

  async deleteRoute(id: string): Promise<void> {
    const route = await this.routeRepo.findOne({ where: { id } });
    if (!route) throw new NotFoundException(`Route ${id} not found`);
    await this.routeRepo.remove(route);

  }



  //** Recherche et Met à jour les routes impactée par un incident créer */
  async updateRouteImpacted(incident: ActiveIncident
  ): Promise<void > {
    //  Récupérer toutes les routes (avec géométrie et user pour prefs)
    const allRoutes = await this.routeRepo.find();

    // Filtrer celles passant par l'incident (tolérance ~50m)
    const pt = turf.point([incident.longitude, incident.latitude]);
    const impacted = allRoutes.filter(route => {
      const line = turf.lineString((route.geometry as any).coordinates);
      return booleanPointOnLine(pt, line);
    });

    const results = [];

    //Pour chaque route impactée, relancer un nouveau calcul
    //    et mettre à jour la base si besoin
    for (const route of impacted) {
      route.incidentsOnRoad.push(incident);

      const position = await this.userService.getPosition(route.user.id);
      
      if (!position) {
        throw new NotFoundException(`Position for user ${route.user.id} not found`);
      }

      this.userService.updatePosition(route.user.id, position);
      
      this.createRoute(route.user.id, {
        originLat: position.latitude,
        originLon: position.longitude,
        destinationLat: route.destinationLat,
        destinationLon: route.destinationLon}) 
        .then((suggestions) => {
          const best = suggestions[0]; // Meilleure suggestion
          this.notificationService.notifyRouteImpacted(
            route.user.id,
            suggestions,
          );
        })
  }
}
}
