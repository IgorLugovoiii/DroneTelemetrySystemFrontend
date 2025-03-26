import { Component, AfterViewInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { DroneService } from './services/drone.service';
import { TelemetryService } from './services/telemetry.service';
import { TelemetryDto } from './models/telemetry-dto.model';
import { Drone, RawTelemetry, Telemetry } from './models';
import L from 'leaflet';
import { AddDroneModalComponent } from './components/add-drone-modal/add-drone-modal.component';
import { AddRawTelemetryModalComponent } from './components/add-raw-telemetry-modal/add-raw-telemetry-modal.component';
import { ShowDronePathModalComponent } from './components/show-drone-path-modal/show-drone-path-modal.component';
import { RawTelemetryViewComponent } from './components/raw-telemetry-view/raw-telemetry-view.component';
import { ProcessedTelemetryViewComponent } from './components/processed-telemetry-view/processed-telemetry-view.component';
import { ProcessTelemetryModalComponent } from './components/process-telemetry-modal/process-telemetry-modal.component';
import { TelemetrySelectorModalComponent } from './components/telemetry-selector-modal/telemetry-selector-modal.component';

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
    TelemetrySelectorModalComponent  
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
  isComparisonVisible = false;
  isRawTelemetryModalVisible = false;
  isProcessedTelemetryModalVisible = false;
  isProcessModalOpen = false;
  processingType: string = '';
  isTelemetrySelectorModalOpen = false;
  telemetryViewType: 'raw' | 'processed' | null = null;

  private legend: L.Control | null = null;
  selectedDroneName: string | null = null;

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

        // Додаємо popup з інформацією про дрон
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
    this.isDronePathModalOpen = true;
  }
  
  showProcessedAndRawPathsOnMap(droneId: number): void {
    this.clearMapExceptDrones();
  
    this.telemetryService.getRawTelemetry(droneId).subscribe({
      next: (rawTelemetry) => {
        this.telemetryService.getProcessedTelemetry(droneId).subscribe({
          next: (processedTelemetry) => {
            let rawPolyline: L.Polyline | null = null;
            let processedPolyline: L.Polyline | null = null;
  
            // Відображення сирої телеметрії (червоний шлях)
            if (rawTelemetry.length > 0) {
              const rawLatLngs: L.LatLngTuple[] = rawTelemetry.map(
                (point) => [point.latitude, point.longitude] as L.LatLngTuple
              );
              rawPolyline = L.polyline(rawLatLngs, {
                color: 'red',
                weight: 5,
                opacity: 0.7
              }).addTo(this.map);
            }
  
            // Відображення обробленої телеметрії (синій шлях)
            if (processedTelemetry.length > 0) {
              const processedLatLngs: L.LatLngTuple[] = processedTelemetry.map(
                (point) => [point.latitude, point.longitude] as L.LatLngTuple
              );
              processedPolyline = L.polyline(processedLatLngs, {
                color: 'blue',
                weight: 3,
                opacity: 0.7
              }).addTo(this.map);
            }
  
            this.legend = new L.Control({ position: 'bottomright' });
            this.legend.onAdd = () => {
              const div = L.DomUtil.create('div', 'info legend');
              div.innerHTML += `
                <h4>Легенда</h4>
                <p style="color: red;">Сира телеметрія</p>
                <p style="color: blue;">Оброблена телеметрія</p>
              `;
              return div;
            };
            this.legend.addTo(this.map);
  
            if (rawPolyline || processedPolyline) {
              this.map.fitBounds(rawPolyline?.getBounds() || processedPolyline?.getBounds());
            }
          },
          error: (err) => {
            console.error('Помилка при отриманні обробленої телеметрії:', err);
            alert('Не вдалося отримати оброблену телеметрію.');
          }
        });
      },
      error: (err) => {
        console.error('Помилка при отриманні сирої телеметрії:', err);
        alert('Не вдалося отримати сиру телеметрію.');
      }
    });
  }
  openProcessModal(type: string): void {
    this.isProcessModalOpen = true;
    this.processingType = type;
  }
  
  onProcessTelemetry(event: {droneId: number, processingType: string}): void {
    const { droneId, processingType } = event;
    
    if (this.legend) {
      this.legend.remove();
      this.legend = null;
    }
  
    this.telemetryService.getRawTelemetry(droneId).subscribe({
      next: (rawTelemetryList) => {
        if (rawTelemetryList.length === 0) {
          alert('Немає сирої телеметрії для обробки');
          return;
        }
  
        const lastRawTelemetry = rawTelemetryList[rawTelemetryList.length - 1];
        const telemetryDto: TelemetryDto = {
          droneId: droneId,
          latitude: lastRawTelemetry.latitude,
          longitude: lastRawTelemetry.longitude,
          altitude: lastRawTelemetry.altitude,
          speed: lastRawTelemetry.speed,
          gpsAccuracy: lastRawTelemetry.gpsAccuracy
        };
  
        let processObservable;
        switch (processingType) {
          case 'KALMAN':
            processObservable = this.telemetryService.processWithKalman(telemetryDto);
            break;
          case 'HAVERSINE':
            processObservable = this.telemetryService.processWithHaversine(telemetryDto);
            break;
          case 'KALMAN_AND_HAVERSINE':
            processObservable = this.telemetryService.processWithKalmanAndHaversine(telemetryDto);
            break;
          default:
            return;
        }
  
        processObservable.subscribe({
          next: () => {
            alert(`Телеметрія оброблена за допомогою ${processingType}`);
            this.loadDrones();
            this.closeProcessModal();
          },
          error: (err) => {
            console.error('Помилка при обробці телеметрії:', err);
            alert('Не вдалося обробити телеметрію');
          }
        });
      },
      error: (err) => {
        console.error('Помилка при отриманні сирої телеметрії:', err);
        alert('Не вдалося отримати сиру телеметрію для обробки');
      }
    });
  }
  
  closeProcessModal(): void {
    this.isProcessModalOpen = false;
    this.processingType = '';
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