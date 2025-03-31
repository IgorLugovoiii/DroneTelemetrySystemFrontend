import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DroneService } from '../../services/drone.service';
import { Drone } from '../../models/drone.model';

@Component({
  selector: 'app-show-drone-path-modal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './show-drone-path-modal.component.html',
  styleUrls: ['./show-drone-path-modal.component.css'],
})
export class ShowDronePathModalComponent {
  @Output() close = new EventEmitter<{ latitude: number; longitude: number }[]>();
  
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

        this.droneService.getDronePath(drone.id).subscribe((path) => {
          if (!path || path.length < 2) {
            alert("Не вдалося побудувати маршрут: потрібно як мінімум 2 точки.");
            return;
          }
          this.close.emit(path);
        });
      });
    } else {
      alert('Будь ласка, оберіть дрон зі списку.');
    }
  }

  onClose(): void {
    this.close.emit();
  }
}