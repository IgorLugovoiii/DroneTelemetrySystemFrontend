export interface Telemetry {
    id: number;
    latitude: number;
    longitude: number;
    altitude: number;
    altitudeChange: number;
    speed: number;
    localDateTime: string;
    totalDistance: number;
    totalDistanceHaversine: number;
    processingType: string;
    drone: {
        id?: number;
        name: string;
    };
    gpsAccuracy?: number;
}