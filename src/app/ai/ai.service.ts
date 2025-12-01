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
      return [
        'Excellent work, keep it up',
        'Outstanding performance, stay motivated',
        'Superb effort, continue excelling',
        'Exceptional understanding, keep going',
        'Continue this excellent standard'
      ];
    } else if (percentage >= 70) {
      return [
        'Good work, well done',
        'Shows solid understanding, continue',
        'Great effort, keep improving',
        'Good progress, stay focused',
        'Keep up the good work'
      ];
    } else if (percentage >= 60) {
      return [
        'Good progress, keep pushing',
        'You can do even better',
        'Keep working, you\'re improving',
        'Stay positive, continue learning',
        'Believe in yourself, keep going'
      ];
    } else if (percentage >= 50) {
      return [
        'Keep trying, you\'ll improve',
        'Stay focused, practice more',
        'You can do better, believe',
        'Keep working hard, stay positive',
        'Don\'t give up, keep going'
      ];
    } else {
      return [
        'You can improve, stay positive',
        'Keep trying, don\'t give up',
        'Believe in yourself, keep working',
        'Stay motivated, you\'ll get there',
        'Keep pushing forward, stay strong'
      ];
    }
  }
}
