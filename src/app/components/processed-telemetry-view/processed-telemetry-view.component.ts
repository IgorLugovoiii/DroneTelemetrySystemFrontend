import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Telemetry } from '../../models/telemetry.model';

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

  closeModal() {
    this.close.emit();
  }
}
