import { Telemetry } from './telemetry.model';
import { RawTelemetry } from './raw-telemetry.model';

export interface Drone {
  id?: number;
  name: string;
  telemetryList?: Telemetry[];
  rawTelemetryList?: RawTelemetry[];
}