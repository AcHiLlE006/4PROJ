
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Route } from './route.entity/route.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { OsmService } from '../osm/osm.service';
import { BreService } from '../bre/bre.service';
import { IncidentsService } from '../incidents/incidents.service';
import { User } from '../users/user.entity/user.entity';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly osmService: OsmService,
    private readonly breService: BreService,
    private readonly incidentsService: IncidentsService,
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
}
