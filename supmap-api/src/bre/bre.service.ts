import { Injectable } from '@nestjs/common';
import * as turf from '@turf/turf';
import booleanPointOnLine from '@turf/boolean-point-on-line';
import { ActiveIncident } from '../incidents/incidents.entity/incident_active.entity';
import { IncidentsService } from '../incidents/incidents.service';
import { Route } from '../routes/route.entity/route.entity';
import { OsmService } from '../osm/osm.service';


@Injectable()
export class BreService {
    
    constructor(
        private readonly incidentsService: IncidentsService,
        private readonly osmService: OsmService) {}
  /**
   * Trie et annote les itinéraires bruts selon :
   * - pénalités issues des types d'incident
   * - préférences utilisateur
   * - présence d'autoroutes
   * Retourne toujours 3 propositions, dont au moins une sans autoroute.
   */
  async sortAndAnnotate(
    destination: [number, number],
    origin: [number, number],
    preferences: { avoid_highways?: boolean },
    incidents: ActiveIncident[],
  ): Promise<Route[]> {
    //  Récupération des itinéraires bruts
    const rawRoutes = this.osmService.getRawRoutes({origin, destination});

    // Scoring initial
    const scored: Route[] = (await rawRoutes).map(route => {
      const line = turf.lineString(route.geometry.coordinates);
      const incidentIds: string[] = [];
      let incidentPenaltySum = 0;

      // Annotation incidents
      incidents.forEach(i => {
        const pt = turf.point([i.longitude, i.latitude]);
        // Vérification si le point de l'incident est sur la ligne de l'itinéraire
        if (booleanPointOnLine(pt, line)) {
          incidentIds.push(i.id);
          incidentPenaltySum += i.type.penalty; // Pénalité associée à ce type d'incident
          route.incidentsOnRoad.push(i); // Ajout de l'incident à la route
        }
      });

      // Détection autoroute
      const hasHighway = route.legs?.some(leg => leg.roadType === 'motorway') ?? false;

      // Calcul du score
      let score = route.duration;
      score += route.distance * 0.1;
      score += incidentPenaltySum;
      // pénalité péage
      if (preferences.avoid_highways && hasHighway) {
        score += 600;
      }

      return { ...route, incidentIds, score, hasHighway };
    });

    // 2) Tri par score
    const sorted = scored.sort((a, b) => a.score - b.score);

    // 3) Sélection des 3 meilleures
    let top3 = sorted.slice(0, 3);

    // 4) S'assurer d'au moins une route sans autoroute
    if (!top3.some(r => !r.hasHighway)) {
      const highwayFree = sorted.find(r => !r.hasHighway);
      if (highwayFree) {
        top3[2] = highwayFree;
      }
    }

    return top3;
  }
}
