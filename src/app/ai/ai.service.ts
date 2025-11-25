import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface CommentGenerationRequest {
  mark: number;
  maxMark?: number;
  subject?: string;
  studentLevel?: string;
}

export interface CommentGenerationResponse {
  comments: string[];
  success: boolean;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly baseUrl = 'http://localhost:3000/ai'; // Update for production

  constructor(private http: HttpClient) {}

  generateComments(request: CommentGenerationRequest): Observable<string[]> {
    return this.http.post<CommentGenerationResponse>(`${this.baseUrl}/generate-comments`, request)
      .pipe(
        map(response => {
          if (response.success) {
            return response.comments;
          } else {
            console.warn('Comment generation failed:', response.error);
            return this.getFallbackComments(request.mark, request.maxMark || 100);
          }
        }),
        catchError(error => {
          console.error('AI service error:', error);
          // Return fallback comments on error
          return of(this.getFallbackComments(request.mark, request.maxMark || 100));
        })
      );
  }

  private getFallbackComments(mark: number, maxMark: number): string[] {
    const percentage = (mark / maxMark) * 100;
    
    if (percentage >= 80) {
      return ['Excellent work, keep it up', 'Outstanding performance', 'Superb effort shown'];
    } else if (percentage >= 70) {
      return ['Good work, well done', 'Shows solid understanding', 'Keep up good work'];
    } else if (percentage >= 60) {
      return ['Satisfactory performance', 'Fair attempt made', 'Room for improvement'];
    } else if (percentage >= 50) {
      return ['Needs more effort', 'Requires additional practice', 'Work harder to improve'];
    } else {
      return ['Significant improvement needed', 'Requires intensive support', 'Must work much harder'];
    }
  }
}
