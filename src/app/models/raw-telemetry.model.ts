import { Drone } from './drone.model';

export interface RawTelemetry {
    id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    altitudeChange: number;
    speed: number;
    gpsAccuracy: number;
    localDateTime: string;
    totalDistance: number;
    totalDistanceHaversine: number;
    processingType: string;
    drone: Drone;
  }