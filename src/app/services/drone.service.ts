import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Drone } from '../models/drone.model';

@Injectable({
  providedIn: 'root',
})
export class DroneService {
  private apiUrl = 'http://localhost:8080/api/drones';

  constructor(private http: HttpClient) {}

  getAllDrones(): Observable<Drone[]> {
    return this.http.get<Drone[]>(`${this.apiUrl}/all`);
  }

  createDrone(drone: Drone): Observable<Drone> {
    return this.http.post<Drone>(`${this.apiUrl}`, drone);
  }
  
  getDroneByName(name: string): Observable<Drone> {
    return this.http.get<Drone>(`${this.apiUrl}/by-name?name=${name}`);
  }
  
  getDronePath(droneId: number): Observable<{ latitude: number, longitude: number }[]> {
    return this.http.get<{ latitude: number, longitude: number }[]>(`${this.apiUrl}/${droneId}/path`);
  }
}