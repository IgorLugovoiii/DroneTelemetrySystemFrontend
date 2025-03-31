import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Drone } from '../../models/drone.model';
import { DroneService } from '../../services/drone.service';

@Component({
  selector: 'app-telemetry-selector-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './telemetry-selector-modal.component.html',
  styleUrls: ['./telemetry-selector-modal.component.css']
})
export class TelemetrySelectorModalComponent {
  @Output() selected = new EventEmitter<number>();
  @Output() close = new EventEmitter<void>();

  drones: Drone[] = [];
  selectedDroneName: string | null = null;

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
      const selectedDrone = this.drones.find(d => d.name === this.selectedDroneName);
      if (selectedDrone && selectedDrone.id) {
        this.selected.emit(selectedDrone.id);
        this.onClose();
      }
    }
  }

  onClose(): void {
    this.close.emit();
  }
}