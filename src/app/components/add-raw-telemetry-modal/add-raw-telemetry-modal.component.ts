import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TelemetryService } from '../../services/telemetry.service';
import { TelemetryDto } from '../../models/telemetry-dto.model';
import { DroneService } from '../../services/drone.service';
import { Drone } from '../../models/drone.model';

@Component({
  selector: 'app-add-raw-telemetry-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-raw-telemetry-modal.component.html',
  styleUrls: ['./add-raw-telemetry-modal.component.css'],
})
export class AddRawTelemetryModalComponent {
  @Output() close = new EventEmitter<void>();

  telemetryDto: TelemetryDto = {
    id: 0,
    latitude: 0,
    longitude: 0,
    altitude: 0,
    speed: 0,
    gpsAccuracy: 0,
    droneId: 0,
    altitudeChange: 0,
  };

  selectedDroneName: string | null = null;
  drones: Drone[] = [];

  constructor(
    private telemetryService: TelemetryService,
    private droneService: DroneService
  ) {}

  ngOnInit(): void {
    this.loadDrones();
  }

  loadDrones(): void {
    this.droneService.getAllDrones().subscribe((drones: Drone[]) => {
      this.drones = drones;
    });
  }

  onSubmit(): void {
    if (!this.selectedDroneName) {
      alert('Будь ласка, оберіть дрон зі списку.');
      return;
    }

    if (
      this.telemetryDto.latitude < -90 || this.telemetryDto.latitude > 90 ||
      this.telemetryDto.longitude < -180 || this.telemetryDto.longitude > 180
    ) {
      alert("Некоректні координати! Широта має бути від -90 до 90, довгота від -180 до 180.");
      return;
    }

    const selectedDrone = this.drones.find(drone => drone.name === this.selectedDroneName);
    if (!selectedDrone || !selectedDrone.id) {
      alert('Дрон не знайдено або ID некоректний.');
      return;
    }

    this.telemetryDto.droneId = selectedDrone.id;

    this.telemetryService.saveRawTelemetry(this.telemetryDto).subscribe({
      next: () => {
        this.close.emit();
      },
      error: (err) => {
        console.error("Помилка при додаванні сирої телеметрії:", err);
        alert("Не вдалося додати сиру телеметрію. Спробуйте ще раз.");
      }
    });
  }

  onClose(): void {
    this.close.emit();
  }
}