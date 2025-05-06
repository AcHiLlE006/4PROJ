// src/incidents/incidents.controller.ts
import {
    Controller,
    Post,
    Get,
    Put,
    Param,
    Body,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { IncidentsService } from './incidents.service';
  import { CreateIncidentDto } from './dto/create-incident.dto';
  import { UpdateIncidentStatusDto } from './dto/update-incident.dto';
  import { JwtGuard } from '../auth/guards/jwt/jwt.guard';
  import { ApiOperation, ApiResponse } from '@nestjs/swagger';
  import { RolesGuard } from 'src/auth/guards/roles/roles.guard';
  
  @Controller('incidents')
  export class IncidentsController {
    constructor(private readonly svc: IncidentsService) {}

    /** GET /incidents */
    @Get()
    @ApiOperation({ summary: 'Récupérer tous les incidents actifs' })
    @ApiResponse({ status: 200, description: 'Liste des incidents actifs.' })
    @ApiResponse({ status: 404, description: 'Aucun incident trouvé.' })

    async list() {
      return this.svc.findAllActiveIncidents();
    }
    
    /** GET /incidents/:id */
    @Get(':id')
    @ApiOperation({ summary: 'Récupérer un incident par ID' })
    @ApiResponse({ status: 200, description: 'Incident trouvé.' })
    @ApiResponse({ status: 404, description: 'Incident non trouvé.' })
    async getById(@Param('id') id: string) {
      return this.svc.findIncidentById(id);
    }
  
    /** POST /incidents */
    @Post()
    @ApiOperation({ summary: 'Signaler un nouvel incident' })
    @ApiResponse({ status: 201, description: 'Incident signalé avec succès.' })
    @ApiResponse({ status: 400, description: 'Erreur lors de la signalisation de l\'incident.' })

    async report(
      @Req() req,
      @Body() dto: CreateIncidentDto,
    ) {
      return this.svc.reportIncident(req.user.userId, dto);
    }
  
    /** GET /incidents/archived */
    @Get('archived')
    @ApiOperation({ summary: 'Récupérer tous les incidents archivés' })
    @ApiResponse({ status: 200, description: 'Liste des incidents archivés.' })
    @ApiResponse({ status: 404, description: 'Aucun incident trouvé.' })
    async listArchived() {
      return this.svc.findAllArchivedIncidents();
    }
  
    /** PUT /incidents/:id/status */
    @Put(':id/status')
    @ApiOperation({ summary: 'Mettre à jour le statut d\'un incident' })
    @ApiResponse({ status: 200, description: 'Statut de l\'incident mis à jour.' })
    @ApiResponse({ status: 404, description: 'Incident non trouvé.' })
    async updateStatus(
      @Param('id') id: string,
      @Body() dto: UpdateIncidentStatusDto,
    ) {
      return this.svc.updateIncidentStatus(id, dto);
    }
  }
  