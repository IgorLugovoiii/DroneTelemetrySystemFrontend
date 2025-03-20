export interface TelemetryDto {
    id?: number;
    latitude: number;
    longitude: number;
    altitude: number;
    speed: number;
    gpsAccuracy: number;
    droneId: number;
    altitudeChange?: number;
  }