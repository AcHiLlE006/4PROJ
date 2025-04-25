import {AfterViewInit, Component} from '@angular/core';
import {MapService} from "../../../core/services/map.service";

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
  constructor(private mapService: MapService) {}

  ngAfterViewInit(): void {
    const map = this.mapService.initializeMap('map', [48.8566, 2.3522], 7);
  }
}

