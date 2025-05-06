// src/osm/osm.controller.ts
import {
    Controller,
    Get,
    Param,
    Query,
    Header,
    ParseIntPipe,
  } from '@nestjs/common';
  import { StreamableFile } from '@nestjs/common';
  import { OsmService } from './osm.service';
  import { GetRawRoutesDto } from './dto/get-raw-routes.dto';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
  
  @Controller('osm')
  export class OsmController {
    constructor(private readonly osmService: OsmService) {}
  
    /** Récupère la tuile PNG z/x/y */
    @Get('tile/:z/:x/:y')
    @ApiOperation({ summary: 'Récupère la tuile PNG z/x/y' })
    @ApiResponse({ status: 200, description: 'Tuile PNG' })
    @ApiResponse({ status: 404, description : 'Tuile non trouvée' })
    @ApiResponse({ status: 500, description : 'Erreur interne du serveur' })
    @Header('Content-Type', 'image/png')
    async getTile(
      @Param('z', ParseIntPipe) z: number,
      @Param('x', ParseIntPipe) x: number,
      @Param('y', ParseIntPipe) y: number,
    ): Promise<StreamableFile> {
      const buffer = await this.osmService.getTile(z, x, y);
      return new StreamableFile(buffer);
    }
  
    /** Récupère les itinéraires bruts OSM (OSRM) */
    @Get('routes')
    @ApiOperation({ summary: 'Récupère les itinéraires bruts OSM (OSRM)' })
    @ApiResponse({ status: 200, description: 'Itinéraires bruts' })
    @ApiResponse({ status: 400, description: 'Paramètres invalides' })
    @ApiResponse({ status: 500, description: 'Erreur interne du serveur' })
    async getRawRoutes(
      @Query() query: GetRawRoutesDto,
    ): Promise<any[]> {
      const { originLat, originLon, destinationLat, destinationLon } = query;
      return this.osmService.getRawRoutes({
        origin: [originLat, originLon],
        destination: [destinationLat, destinationLon],
      });
    }
  }
  