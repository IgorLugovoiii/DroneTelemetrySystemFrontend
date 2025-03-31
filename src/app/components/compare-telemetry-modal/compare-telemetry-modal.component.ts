import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DroneService } from '../../services/drone.service';
import { Drone } from '../../models/drone.model';

@Component({
  selector: 'app-compare-telemetry-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './compare-telemetry-modal.component.html',
  styleUrls: ['./compare-telemetry-modal.component.css'],
})
export class CompareTelemetryModalComponent {
  @Output() compare = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  selectedDroneName: string | null = null;
  drones: Drone[] = [];

  constructor(private droneService: DroneService) {}

  ngOnInit(): void {
    this.loadDrones();
  }

  loadDrones(): void {
    this.droneService.getAllDrones().subscribe((drones: Drone[]) => {
      this.drones = drones;
    });
  }

  onSubmit(): void {
    if (this.selectedDroneName) {
      this.droneService.getDroneByName(this.selectedDroneName).subscribe((drone) => {
        if (!drone || !drone.id) {
          alert('Дрон не знайдено або ID некоректний.');
          return;
        }
        this.compare.emit(drone.id);
        this.onClose();
      });
    } else {
      alert('Будь ласка, оберіть дрон зі списку.');
    }
  }

  onClose(): void {
    this.close.emit();
  }
}