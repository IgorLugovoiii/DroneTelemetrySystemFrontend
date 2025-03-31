import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DroneService } from './services/drone.service';
import { TelemetryService } from './services/telemetry.service';

import { Drone, RawTelemetry, Telemetry } from './models';
import L from 'leaflet';
import { AddDroneModalComponent } from './components/add-drone-modal/add-drone-modal.component';
import { AddRawTelemetryModalComponent } from './components/add-raw-telemetry-modal/add-raw-telemetry-modal.component';
import { ShowDronePathModalComponent } from './components/show-drone-path-modal/show-drone-path-modal.component';
import { RawTelemetryViewComponent } from './components/raw-telemetry-view/raw-telemetry-view.component';
import { ProcessedTelemetryViewComponent } from './components/processed-telemetry-view/processed-telemetry-view.component';
import { ProcessTelemetryModalComponent } from './components/process-telemetry-modal/process-telemetry-modal.component';
import { TelemetrySelectorModalComponent } from './components/telemetry-selector-modal/telemetry-selector-modal.component';
import { CompareTelemetryModalComponent } from './components/compare-telemetry-modal/compare-telemetry-modal.component';
import { Observable } from 'rxjs/internal/Observable';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    AddDroneModalComponent,
    AddRawTelemetryModalComponent,
    ShowDronePathModalComponent,
    RawTelemetryViewComponent,
    ProcessedTelemetryViewComponent,
    ProcessTelemetryModalComponent,
    TelemetrySelectorModalComponent,
    CompareTelemetryModalComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements AfterViewInit {
  isModalOpen = false;
  isRawTelemetryModalOpen = false;
  isDronePathModalOpen = false;
  rawTelemetryData: RawTelemetry[] = [];
  processedTelemetryData: Telemetry[] = [];
  isRawTelemetryDataVisible = false;
  isProcessedTelemetryDataVisible = false;
  isRawTelemetryModalVisible = false;
  isProcessedTelemetryModalVisible = false;
  isProcessModalOpen = false;
  processingType: string = '';
  isTelemetrySelectorModalOpen = false;
  telemetryViewType: 'raw' | 'processed' | null = null;
  isCompareModalOpen = false;

  private legend: L.Control | null = null;


  private map: any;
  drones: Drone[] = [];

  isDropdownOpen = {
    drones: false,
    telemetry: false,
    filters: false
  };

  constructor(
    private droneService: DroneService,
    private telemetryService: TelemetryService,
    @Inject(PLATFORM_ID) private platformId: object
  ) { }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      import('leaflet').then((L) => {
        this.initMap(L);
        this.loadDrones();
      });
    }
  }

  private initMap(L: any): void {
    this.map = L.map('map').setView([50, 30], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);
  }

  private loadDrones(): void {
    this.droneService.getAllDrones().subscribe((drones: Drone[]) => {
      console.log("Отримані дрони:", drones);
      this.drones = drones;
      this.addMarkers();
    });
  }

  private addMarkers(): void {
    this.drones.forEach((drone) => {
      if (drone.rawTelemetryList && drone.rawTelemetryList.length > 0) {
        const lastRawTelemetry = drone.rawTelemetryList[drone.rawTelemetryList.length - 1];
        const circle = L.circle([lastRawTelemetry.latitude, lastRawTelemetry.longitude], {
          radius: 500, // Радіус круга в метрах
          color: 'black', // Колір обводки
          fillColor: '#000', // Колір заповнення
          fillOpacity: 0.5 // Прозорість
        }).addTo(this.map);

        circle.bindPopup(`<b>${drone.name}</b><br>ID: ${drone.id}`).openPopup();
      }
    });
  }

  toggleDropdown(menu: 'drones' | 'telemetry' | 'filters'): void {
    (Object.keys(this.isDropdownOpen) as (keyof typeof this.isDropdownOpen)[]).forEach(key => {
      if (key !== menu) {
        this.isDropdownOpen[key] = false;
      }
    });
    this.isDropdownOpen[menu] = !this.isDropdownOpen[menu];
  }

  addDrone(): void {
    this.isDropdownOpen.drones = false;
    this.isModalOpen = true;
  }

  refreshDrones(): void {
    this.loadDrones();
    this.isDropdownOpen.drones = false;
  }

  clearMap(): void {
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polyline) {
        this.map.removeLayer(layer);
      }
    });
  }

  showDronePath(): void {
    this.isDropdownOpen.drones = false;
    this.isDronePathModalOpen = true;
  }

  onDronePathSelected(path: { latitude: number; longitude: number }[]): void {
    if (path && path.length > 0) {
      this.showDronePathOnMap(path);
    } else {
      alert("Немає даних для відображення шляху.");
    }
    this.closeDronePathModal();
  }


  showDronePathOnMap(path: { latitude: number; longitude: number }[]): void {
    this.clearMapExceptDrones();

    const latLngs: L.LatLngTuple[] = path.map((point) => [point.latitude, point.longitude] as L.LatLngTuple);
    const polyline = L.polyline(latLngs, { color: 'blue' }).addTo(this.map);

    this.map.fitBounds(polyline.getBounds());
  }

  closeDronePathModal(): void {
    this.isDronePathModalOpen = false;
  }

  onDroneSaved(drone: Drone): void {
    this.droneService.createDrone(drone).subscribe({
      next: (createdDrone) => {
        console.log('Дрон додано:', createdDrone);
        this.loadDrones();
        this.closeModal();
      },
      error: (err) => {
        console.error('Помилка при додаванні дрона:', err);
        alert('Не вдалося додати дрон. Спробуйте ще раз.');
      }
    });
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  addRawTelemetry(): void {
    this.isDropdownOpen.telemetry = false;
    this.isRawTelemetryModalOpen = true;
  }

  onRawTelemetrySaved(): void {
    this.loadDrones();
    this.closeRawTelemetryModal();
  }

  closeRawTelemetryModal(): void {
    this.isRawTelemetryModalOpen = false;
    this.isRawTelemetryModalVisible = false;
  }

  showRawTelemetryModal(): void {
    this.telemetryViewType = 'raw';
    this.isTelemetrySelectorModalOpen = true;
  }

  showProcessedTelemetryModal(): void {
    this.telemetryViewType = 'processed';
    this.isTelemetrySelectorModalOpen = true;
  }

  onDroneSelected(droneId: number): void {
    if (this.telemetryViewType === 'raw') {
      this.loadRawTelemetry(droneId);
    } else if (this.telemetryViewType === 'processed') {
      this.loadProcessedTelemetry(droneId);
    }
    this.closeTelemetrySelectorModal();
  }

  loadRawTelemetry(droneId: number): void {
    this.telemetryService.getRawTelemetry(droneId).subscribe({
      next: (rawTelemetry) => {
        this.rawTelemetryData = rawTelemetry;
        this.isRawTelemetryModalVisible = true;
      },
      error: (err) => {
        console.error('Помилка при отриманні сирої телеметрії:', err);
        alert('Не вдалося отримати сиру телеметрію.');
      }
    });
  }

  loadProcessedTelemetry(droneId: number): void {
    this.telemetryService.getProcessedTelemetry(droneId).subscribe({
      next: (processedTelemetry) => {
        this.processedTelemetryData = processedTelemetry;
        this.isProcessedTelemetryModalVisible = true;
      },
      error: (err) => {
        console.error('Помилка при отриманні обробленої телеметрії:', err);
        alert('Не вдалося отримати оброблену телеметрію.');
      }
    });
  }

  closeTelemetrySelectorModal(): void {
    this.isTelemetrySelectorModalOpen = false;
    this.telemetryViewType = null;
  }


  closeProcessedTelemetryModal(): void {
    this.isProcessedTelemetryModalVisible = false;
  }

  showProcessedAndRawPaths(): void {
    this.isDropdownOpen.telemetry = false;
    this.isCompareModalOpen = true;
  }

  onCompareSelected(droneId: number): void {
    this.showProcessedAndRawPathsOnMap(droneId);
    this.closeCompareModal();
  }

  closeCompareModal(): void {
    this.isCompareModalOpen = false;
  }

  showProcessedAndRawPathsOnMap(droneId: number): void {
    this.clearMapExceptDrones();

    forkJoin([
      this.telemetryService.getRawTelemetry(droneId),
      this.telemetryService.getProcessedTelemetry(droneId)
    ]).subscribe({
      next: ([rawTelemetry, processedTelemetry]) => {
        const sortedRaw = [...rawTelemetry].sort((a, b) =>
          new Date(a.localDateTime).getTime() - new Date(b.localDateTime).getTime());
        const sortedProcessed = [...processedTelemetry].sort((a, b) =>
          new Date(a.localDateTime).getTime() - new Date(b.localDateTime).getTime());

        console.log("Raw Telemetry (sorted):", sortedRaw);
        console.log("Processed Telemetry (sorted):", sortedProcessed);

        if (sortedRaw.length > 0) {
          const rawLatLngs = sortedRaw.map(point => {
            if (point.latitude < -90 || point.latitude > 90 || point.longitude < -180 || point.longitude > 180) {
              console.error("Invalid raw coordinates:", point);
              return null;
            }
            return [point.latitude, point.longitude] as L.LatLngTuple;
          }).filter(point => point !== null);

          if (rawLatLngs.length > 0) {
            L.polyline(rawLatLngs as L.LatLngTuple[], { color: 'red', weight: 5 }).addTo(this.map);
          }
        }

        if (sortedProcessed.length > 0) {
          const processedLatLngs = sortedProcessed.map(point => {
            if (point.latitude < -90 || point.latitude > 90 || point.longitude < -180 || point.longitude > 180) {
              console.error("Invalid processed coordinates:", point);
              return null;
            }
            return [point.latitude, point.longitude] as L.LatLngTuple;
          }).filter(point => point !== null);

          if (processedLatLngs.length > 0) {
            L.polyline(processedLatLngs as L.LatLngTuple[], { color: 'blue', weight: 3 }).addTo(this.map);
          }
        }

        this.addLegend();
        this.fitMapToPaths(sortedRaw, sortedProcessed);
      },
      error: (err) => console.error('Помилка при отриманні телеметрії:', err)
    });
  }

  private addLegend(): void {
    if (this.legend) {
      this.legend.remove();
    }

    this.legend = new L.Control({ position: 'bottomright' });
    this.legend.onAdd = () => {
      const div = L.DomUtil.create('div', 'info legend');
      div.innerHTML = `
            <h4>Легенда</h4>
            <p style="color: red;">Сира телеметрія</p>
            <p style="color: blue;">Оброблена телеметрія</p>
        `;
      return div;
    };
    this.legend.addTo(this.map);
  }

  private fitMapToPaths(rawData: RawTelemetry[], processedData: Telemetry[]): void {
    const bounds = new L.LatLngBounds([]);

    rawData.forEach(point => {
      bounds.extend([point.latitude, point.longitude]);
    });

    processedData.forEach(point => {
      bounds.extend([point.latitude, point.longitude]);
    });

    if (!bounds.isValid()) {
      bounds.extend([50, 30]);
    }

    this.map.fitBounds(bounds);
  }

  openProcessModal(type: string): void {
    this.isProcessModalOpen = true;
    this.processingType = type;
  }

  onProcessTelemetry(event: { droneId: number, processingType: string }): void {
    const { droneId, processingType } = event;

    if (this.legend) {
      this.legend.remove();
      this.legend = null;
    }

    this.telemetryService.clearProcessedTelemetry(droneId).subscribe({
      next: () => {
        let processObservable: Observable<any>;
        switch (processingType) {
          case 'KALMAN':
            processObservable = this.telemetryService.processAllWithKalman(droneId);
            break;
          case 'HAVERSINE':
            processObservable = this.telemetryService.processAllWithHaversine(droneId);
            break;
          case 'KALMAN_AND_HAVERSINE':
            processObservable = this.telemetryService.processAllWithKalmanAndHaversine(droneId);
            break;
          default:
            return;
        }

        processObservable.subscribe({
          next: (processedData) => {
            alert(`Телеметрія оброблена за допомогою ${processingType}`);
            this.loadDrones();

            this.telemetryService.getRawTelemetry(droneId).subscribe(rawData => {
              this.rawTelemetryData = rawData;
              this.processedTelemetryData = processedData;
              this.isRawTelemetryDataVisible = true;
              this.isProcessedTelemetryDataVisible = true;
            });

            this.closeProcessModal();
          },
          error: (err) => {
            console.error('Помилка при обробці телеметрії:', err);
            alert('Не вдалося обробити телеметрію');
          }
        });
      },
      error: (err) => {
        console.error('Помилка при очищенні обробленої телеметрії:', err);
        alert('Не вдалося очистити оброблену телеметрію');
      }
    });
  }

  closeProcessModal(): void {
    this.isProcessModalOpen = false;
    this.processingType = '';
  }

  showCompareModal(): void {
    this.isDropdownOpen.drones = false;
    this.isCompareModalOpen = true;
  }
  clearMapExceptDrones(): void {
    this.map.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polyline) {
        this.map.removeLayer(layer);
      }
    });

    if (this.legend) {
      this.legend.remove();
      this.legend = null;
    }
  }
}