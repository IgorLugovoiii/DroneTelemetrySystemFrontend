import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Telemetry } from '../../models/telemetry.model';
import { ProcessingType } from '../../models/processing-type.enum';

@Component({
  selector: 'app-processed-telemetry-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './processed-telemetry-view.component.html',
  styleUrls: ['./processed-telemetry-view.component.css']
})
export class ProcessedTelemetryViewComponent {
  @Input() processedTelemetryData: Telemetry[] = [];
  @Output() close = new EventEmitter<void>();

  getProcessingTypeName(type: string): string {
    if (!type) return 'Н/Д';
    
    switch(type) {
      case ProcessingType.KALMAN:
        return 'Kalman';
      case ProcessingType.HAVERSINE:
        return 'Haversine';
      case ProcessingType.KALMAN_AND_HAVERSINE:
        return 'Kalman+Haversine';
      default:
        return type;
    }
  }

  getDroneName(drone: { name?: string } | undefined): string {
    return drone?.name || 'Н/Д';
  }

  closeModal() {
    this.close.emit();
  }
}