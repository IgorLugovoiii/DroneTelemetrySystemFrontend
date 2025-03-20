import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TelemetryDto, Telemetry, RawTelemetry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private apiUrl = 'http://localhost:8080/api/telemetry';

  constructor(private http: HttpClient) {}

  saveRawTelemetry(telemetryDto: TelemetryDto): Observable<RawTelemetry> {
    return this.http.post<RawTelemetry>(`${this.apiUrl}/saveRawTelemetry`, telemetryDto);
  }

  processWithKalman(telemetryDto: TelemetryDto): Observable<Telemetry> {
    return this.http.post<Telemetry>(`${this.apiUrl}/kalman`, telemetryDto);
  }

  processWithHaversine(telemetryDto: TelemetryDto): Observable<Telemetry> {
    return this.http.post<Telemetry>(`${this.apiUrl}/haversine`, telemetryDto);
  }

  processWithKalmanAndHaversine(telemetryDto: TelemetryDto): Observable<Telemetry> {
    return this.http.post<Telemetry>(`${this.apiUrl}/haversine-kalman`, telemetryDto);
  }

  getProcessedTelemetry(droneId: number): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.apiUrl}/processed/${droneId}`);
  }

  getRawTelemetry(droneId: number): Observable<RawTelemetry[]> {
    return this.http.get<RawTelemetry[]>(`${this.apiUrl}/raw/${droneId}`);
  }
}