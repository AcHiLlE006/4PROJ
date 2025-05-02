import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActiveIncident } from './incidents.entity/incident_active.entity'; 
import { IncidentType } from './incidents.entity/incident_types.entity';
import { User } from '../users/user.entity/user.entity';
import { ArchivedIncident } from './incidents.entity/incident_archived.entity';

@Injectable()
export class IncidentsService {
    constructor(
        @InjectRepository(ActiveIncident)
        private readonly incidentsActiveRepo: Repository<ActiveIncident>,
        @InjectRepository(IncidentType)
        private readonly incidentTypeRepo: Repository<IncidentType>,
        @InjectRepository(ArchivedIncident)
        private readonly incidentsArchivedRepo: Repository<ArchivedIncident>
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

    async findIncidentById(id: string): Promise<ActiveIncident | undefined> {
        const incident = await this.incidentsActiveRepo.findOne({ where: { id } });
        return incident ?? undefined;
    }


}
