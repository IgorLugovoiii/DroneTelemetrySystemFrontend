import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Drone } from '../../models/drone.model';
import { DroneService } from '../../services/drone.service';

@Component({
  selector: 'app-process-telemetry-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './process-telemetry-modal.component.html',
  styleUrls: ['./process-telemetry-modal.component.css']
})
export class ProcessTelemetryModalComponent {
  @Output() process = new EventEmitter<{droneId: number, processingType: string}>();
  @Output() close = new EventEmitter<void>();

  drones: Drone[] = [];
  selectedDroneName: string | null = null;
  processingType: string = '';

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
    if (this.selectedDroneName && this.processingType) {
      const selectedDrone = this.drones.find(d => d.name === this.selectedDroneName);
      if (selectedDrone && selectedDrone.id) {
        this.process.emit({
          droneId: selectedDrone.id,
          processingType: this.processingType
        });
        this.onClose();
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }
}