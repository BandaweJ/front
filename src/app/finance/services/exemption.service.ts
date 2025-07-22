import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ExemptionModel } from '../../finance/models/exemption.model'; // Adjust path if exemption.model.ts is moved
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root', // Makes the service a singleton and available throughout the app
})
export class ExemptionService {
  // IMPORTANT: Replace with your actual backend API URL
  baseURL = `${environment.apiUrl}exemptions/`;

  constructor(private http: HttpClient) {}

  /**
   * Sends a POST request to create a new exemption on the backend.
   * @param exemption The exemption data to create.
   * @returns An Observable of the created ExemptionModel.
   */
  createExemption(exemption: ExemptionModel): Observable<ExemptionModel> {
    // Note: The backend typically handles ID generation, createdAt, updatedAt.
    // Send only the necessary fields for creation.
    const payload = {
      studentNumber: exemption.student.studentNumber, // Assuming student.id is the foreign key
      type: exemption.type,
      fixedAmount: exemption.fixedAmount,
      percentageAmount: exemption.percentageAmount,
      description: exemption.description,
      isActive: exemption.isActive,
    };
    console.log('payload ', payload);
    return this.http.post<ExemptionModel>(this.baseURL, payload);
  }

  // You can add more methods here for fetching, updating, deleting exemptions
  // getExemptionById(id: number): Observable<ExemptionModel> { ... }
  // updateExemption(exemption: ExemptionModel): Observable<ExemptionModel> { ... }
  // deleteExemption(id: number): Observable<void> { ... }
}
