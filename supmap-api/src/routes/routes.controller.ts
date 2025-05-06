// src/routes/routes.controller.ts
import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { RoutesService } from './routes.service';
  import { CreateRouteDto } from './dto/create-route.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @Controller('routes')
  export class RoutesController {
    constructor(private readonly svc: RoutesService) {}


  
    /** POST /routes */
    @Post()
    @ApiOperation({
      summary: 'Créer un nouvel itinéraire pour l’utilisateur connecté',
        description: 'Crée un nouvel itinéraire pour l’utilisateur connecté',
    })
    @ApiResponse({
      status: 201, description: 'Itinéraire créé avec succès'})
    @ApiResponse({
      status: 400, description: 'Erreur lors de la création de l\'itinéraire.' })
    async create(@Req() req, @Body() dto: CreateRouteDto) {
      return this.svc.createRoute(req.user.userId, dto);
    }
  
    /** GET /routes */
    @Get()
    @ApiOperation({
      summary: 'Récupérer tous les itinéraires',
        description: 'Récupérer tous les itinéraires',
    })
    @ApiResponse({
      status: 200, description: 'Liste des itinéraires.'})
    @ApiResponse({
      status: 404, description: 'Aucun itinéraire trouvé.' })
    async list() {
      return this.svc.findAll();
    }
  
    /** GET /routes/:id */
    @Get(':id')
    @ApiOperation({
      summary: 'Récupérer un itinéraire par son ID',
        description: 'Récupérer un itinéraire par son ID',
    })
    @ApiResponse({
      status: 200, description: 'Itinéraire trouvé.'})
    @ApiResponse({
      status: 404, description: 'Itinéraire non trouvé.' })
    
    async one(@Param('id') id: string) {
      return this.svc.findOne(id);
    }
  }
  