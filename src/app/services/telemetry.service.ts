import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TelemetryDto, Telemetry, RawTelemetry } from '../models';

@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private apiUrl = 'http://localhost:8080/api/telemetry';

  constructor(private http: HttpClient) { }

  saveRawTelemetry(telemetryDto: TelemetryDto): Observable<RawTelemetry> {
    return this.http.post<RawTelemetry>(`${this.apiUrl}/saveRawTelemetry`, telemetryDto);
  }

  getProcessedTelemetry(droneId: number): Observable<Telemetry[]> {
    return this.http.get<Telemetry[]>(`${this.apiUrl}/processed/${droneId}`);
  }

  getRawTelemetry(droneId: number): Observable<RawTelemetry[]> {
    return this.http.get<RawTelemetry[]>(`${this.apiUrl}/raw/${droneId}`);
  }
  clearProcessedTelemetry(droneId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/clear/${droneId}`);
  }

  processAllWithKalman(droneId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/processAll/kalman/${droneId}`, {});
  }

  processAllWithHaversine(droneId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/processAll/haversine/${droneId}`, {});
  }

  processAllWithKalmanAndHaversine(droneId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/processAll/kalman-haversine/${droneId}`, {});
  }
}