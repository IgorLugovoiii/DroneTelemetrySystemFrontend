import { Component, AfterViewInit, PLATFORM_ID, Inject, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  private map: any;

  constructor(@Inject(PLATFORM_ID) private platformId: object, private cd: ChangeDetectorRef) {}

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        this.initMap(L);
        this.cd.detectChanges();
      });
    }
  }

  private initMap(L: any): void {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) {
      console.error('Елемент #map не знайдено!');
      return;
    }

    this.map = L.map('map').setView([50, 30], 5);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
      attribution: '&copy; CartoDB &copy; OpenStreetMap contributors',
      maxZoom: 19,
      tileSize: 256,
      zoomOffset: 0,
    }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 5000);
  }
}
