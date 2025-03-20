import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RawTelemetry } from '../../models/raw-telemetry.model';

@Component({
  selector: 'app-raw-telemetry-view',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './raw-telemetry-view.component.html',
  styleUrls: ['./raw-telemetry-view.component.css']
})
export class RawTelemetryViewComponent {
  @Input() rawTelemetryData: RawTelemetry[] = [];
  @Output() close = new EventEmitter<void>();

  closeModal() {
    this.close.emit();
  }
}
