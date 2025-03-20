import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Drone } from '../../models/drone.model';
import { DroneService } from '../../services/drone.service';

@Component({
  selector: 'app-add-drone-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './add-drone-modal.component.html',
  styleUrls: ['./add-drone-modal.component.css'],
})
export class AddDroneModalComponent {
  @Output() save = new EventEmitter<Drone>();
  @Output() close = new EventEmitter<void>();

  drone: Drone = { name: '' };

  constructor(private droneService: DroneService) {}

  onDroneSaved(drone: Drone): void {
    this.droneService.createDrone(drone).subscribe({
      next: (newDrone) => {
        console.log('Дрон додано:', newDrone);
        this.save.emit(newDrone);
        this.onClose();
      },
      error: (err) => {
        console.error('Помилка при додаванні дрона:', err);
        alert('Не вдалося додати дрон. Спробуйте ще раз.');
      }
    });
  }

  onSubmit(): void {
    if (this.drone.name) {
      const newDrone: Drone = { name: this.drone.name };
      this.onDroneSaved(newDrone);
    } else {
      alert('Будь ласка, введіть назву дрона.');
    }
  }
  

  onClose(): void {
    this.close.emit();
  }
}