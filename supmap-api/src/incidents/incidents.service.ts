import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveIncident } from './incidents.entity/incident_active.entity'; 
import { IncidentType } from './incidents.entity/incident_types.entity';
import { User } from '../users/user.entity/user.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';
import { CreateIncidentDto } from './dto/create-incident.dto';
import { UpdateIncidentStatusDto } from './dto/update-incident.dto';
import { Route } from '../routes/route.entity/route.entity';
import { RoutesService } from '../routes/routes.service';

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(ActiveIncident)
        private readonly incidentsActiveRepo: Repository<ActiveIncident>,
        @InjectRepository(IncidentType)
        private readonly incidentTypeRepo: Repository<IncidentType>,
        @InjectRepository(ArchivedIncident)
        private readonly incidentsArchivedRepo: Repository<ArchivedIncident>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(IncidentType)
        private readonly typeRepo: Repository<IncidentType>,
        @Inject(forwardRef(() => RoutesService))  
    private readonly routeService: RoutesService,
    ) {}

    async findAllActiveIncidents(): Promise<ActiveIncident[]> {
        return this.incidentsActiveRepo.find();
    }

    async ArchiveIncident(id: string): Promise<ArchivedIncident> {
        const incident = await this.incidentsActiveRepo.findOne({ where: { id } });
        if (!incident) {
            throw new Error(`Incident with ID ${id} not found`);
        }
        const archivedIncident = this.incidentsArchivedRepo.create(incident);
        await this.incidentsArchivedRepo.save(archivedIncident);
        await this.incidentsActiveRepo.delete(id);
        return archivedIncident;
    }

    async findIncidentTypeById(id: string): Promise<IncidentType | undefined> {
        const incidentType = await this.incidentTypeRepo.findOne({ where: { id: Number(id) } });
        return incidentType ?? undefined;
    }

    async findAllIncidentTypes(): Promise<IncidentType[]> {
        return this.incidentTypeRepo.find();
    }

    async findAllArchivedIncidents(): Promise<ArchivedIncident[]> {
        return this.incidentsArchivedRepo.find();
    }

    async findIncidentById(id: string): Promise<ActiveIncident | undefined> {
        const incident = await this.incidentsActiveRepo.findOne({ where: { id } });
        return incident ?? undefined;
    }

     /** Signaler un nouvel incident */
    async reportIncident(userId: string, dto: CreateIncidentDto): Promise<ActiveIncident> {
        const user = await this.userRepo.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException(`User ${userId} not found`);

        const type = await this.typeRepo.findOne({ where: { id: dto.typeId } });
        if (!type) throw new NotFoundException(`IncidentType ${dto.typeId} not found`);

        const inc = this.incidentsActiveRepo.create({
        user,
        type,
        description: dto.description,
        latitude: dto.latitude,
        longitude: dto.longitude,
        });
        this.routeService.updateRouteImpacted(inc); // Met à jour les incidents sur la route
        return this.incidentsActiveRepo.save(inc);
    }

    /**
   * Met à jour le statut d’un incident lorsqu’un utilisateur passe dessus
   * - si isStillPresent = true, on incrémente confirmedCount
   * - si false, on archive puis supprime de la table active_incidents
   */
    async updateIncidentStatus(
        id: string,
        dto: UpdateIncidentStatusDto,
    ): Promise<ActiveIncident | ArchivedIncident> {
        const inc = await this.incidentsActiveRepo.findOne({ where: { id }, relations: ['type', 'user'] });
        if (!inc) throw new NotFoundException(`ActiveIncident ${id} not found`);

        if (dto.isStillPresent) {
        inc.confirmedCount++;
        return this.incidentsActiveRepo.save(inc);
        } else {
        inc.deniedCount++;
        if (inc.deniedCount <= 2) {
            // Si l'incident a été refusé 3 fois, on l'archive
            return inc;
        } else {
        // création de l’archive
        const archived = this.incidentsArchivedRepo.create({
            id: inc.id,
            typeId: inc.type.id,
            description: inc.description,
            latitude: inc.latitude,
            longitude: inc.longitude,
            reportedAt: inc.reportedAt,
            resolvedAt: new Date(),
            confirmedCount: inc.confirmedCount,
            deniedCount: inc.deniedCount,
        });
        await this.incidentsArchivedRepo.save(archived);
        await this.incidentsActiveRepo.delete(id);
        return archived;
        }
    }

    }
}
