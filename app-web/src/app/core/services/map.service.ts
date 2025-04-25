import { Injectable } from '@angular/core';
import * as L from 'leaflet';
import {FeatureCollection, LineString} from "geojson";

@Injectable({
  providedIn: 'root'
})
export class MapService {
  private map!: L.Map;
  private routeLayer!: L.GeoJSON;
  private zoomThreshold = 13;

  private normalStyle = {
    color: "#3388ff",
    weight: 3,
    opacity: 0.7
  };

  private highlightedStyle = {
    color: "#ff0000",
    weight: 6,
    opacity: 1
  };

  initializeMap(mapId: string, center: L.LatLngExpression, zoom: number): L.Map {
    this.map = L.map(mapId).setView(center, zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    this.routeLayer = L.geoJSON(null, {
      style: { color: 'blue', weight: 2 }
    }).addTo(this.map);

    this.map.on('moveend', () => this.updateRoutes());
    this.map.on('zoomend', () => this.updateRoutes());

    return this.map;
  }


  private loadRoutes(bounds: L.LatLngBounds) {
    // ⚡ Simule une requête API pour récupérer les routes visibles
    const geoJsonData: FeatureCollection<LineString> = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "LineString",
            coordinates: [
              [bounds.getWest(), bounds.getSouth()],
              [bounds.getEast(), bounds.getNorth()]
            ]
          },
          properties: {}
        }
      ]
    };

    this.routeLayer.clearLayers();
    this.routeLayer.addData(geoJsonData);
  }

  private updateRoutes() {
    if (this.map.getZoom() < this.zoomThreshold) {
      this.routeLayer.clearLayers(); // On enlève les routes si le zoom est trop faible
      return;
    }
}
}
