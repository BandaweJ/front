import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

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
  private readonly baseUrl = `${environment.apiUrl}/ai`;

  constructor(private http: HttpClient) {}

  generateComments(request: CommentGenerationRequest): Observable<string[]> {
    return this.http.post<CommentGenerationResponse>(`${this.baseUrl}/generate-comments`, request)
      .pipe(
        map(response => {
          if (response.success) {
            return response.comments;
          } else {
            console.warn('Comment generation failed:', response.error);
            return this.getFallbackComments(request.mark, request.maxMark || 100, request.subject);
          }
        }),
        catchError(error => {
          console.error('AI service error:', error);
          // Return fallback comments on error
          return of(this.getFallbackComments(request.mark, request.maxMark || 100, request.subject));
        })
      );
  }

  private getFallbackComments(mark: number, maxMark: number, subject?: string): string[] {
    const percentage = (mark / maxMark) * 100;
    const subjectRef = subject ? ` in ${subject}` : '';
    
    if (percentage >= 60) {
      return [
        `Excellent work${subjectRef}, keep it up`,
        `Great effort${subjectRef}, continue improving`,
        `Good progress${subjectRef}, maintain standard`,
        `Well done${subjectRef}, keep going`,
        `Outstanding work${subjectRef}, stay focused`
      ];
    } else if (percentage >= 50) {
      return [
        `Good progress${subjectRef}, push for more`,
        `Keep working hard${subjectRef}, aim higher`,
        `You can improve${subjectRef}, keep trying`,
        `Stay focused${subjectRef}, work harder`,
        `Good effort${subjectRef}, push yourself`
      ];
    } else {
      return [
        `Read more${subjectRef}, ask questions`,
        `Focus on basics${subjectRef}, seek help`,
        `Work harder${subjectRef}, consult teachers`,
        `Study more${subjectRef}, ask for help`,
        `Practice more${subjectRef}, stay focused`
      ];
    }
  }
}
