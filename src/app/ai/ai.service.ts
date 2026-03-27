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
  studentName?: string;
  className?: string;
  examType?: string;
  tone?: 'encouraging' | 'balanced' | 'firm';
  average?: number;
  position?: number;
  classSize?: number;
}

type SchoolStage = 'form1to2' | 'form3to4' | 'form5to6' | 'genericSecondary';

export interface CommentGenerationResponse {
  comments: string[];
  success: boolean;
  error?: string;
  source?: 'openai' | 'fallback';
}

@Injectable({
  providedIn: 'root'
})
export class AIService {
  private readonly baseUrl = `${environment.apiUrl}/ai`;
  private readonly stageDisallowedTerms: Record<SchoolStage, string[]> = {
    form1to2: [
      'algorithm',
      'algorithms',
      'derivative',
      'derivatives',
      'integration',
      'integral',
      'stoichiometry',
      'electrolysis',
      'trigonometric',
      'kinematics',
      'organic chemistry',
      'argumentation',
      'evaluation',
      'hypothesis',
      'theorem'
    ],
    form3to4: [
      'derivative',
      'derivatives',
      'integration',
      'integral',
      'electromagnetism',
      'stoichiometry',
      'algorithmic complexity'
    ],
    form5to6: [],
    genericSecondary: []
  };

  constructor(private http: HttpClient) {}

  generateComments(request: CommentGenerationRequest): Observable<string[]> {
    return this.http.post<CommentGenerationResponse>(`${this.baseUrl}/generate-comments`, request)
      .pipe(
        map(response => {
          if (response.success) {
            if (response.source === 'fallback') {
              console.warn('Using fallback comments from server');
            }
            return response.comments;
          } else {
            console.warn('Comment generation failed:', response.error);
            return this.getFallbackComments(
              request.mark,
              request.maxMark || 100,
              request.subject,
              request.className,
              request.studentLevel
            );
          }
        }),
        catchError(error => {
          console.error('AI service error:', error);
          // Return fallback comments on error
          return of(
            this.getFallbackComments(
              request.mark,
              request.maxMark || 100,
              request.subject,
              request.className,
              request.studentLevel
            )
          );
        })
      );
  }

  private getFallbackComments(
    mark: number,
    maxMark: number,
    subject?: string,
    className?: string,
    studentLevel?: string
  ): string[] {
    const percentage = (mark / maxMark) * 100;
    const stage = this.inferSchoolStage(className, studentLevel);
    const keyword = this.getPrimarySubjectKeyword(subject, stage);
    
    if (percentage >= 60) {
      return [
        `Strong ${keyword}, sustain this accuracy`,
        `Apply ${keyword} in harder tasks`,
        `Extend ${keyword} through challenge questions`,
        `Maintain precise ${keyword} exam technique`,
        `Refine ${keyword} with timed practice`
      ];
    } else if (percentage >= 50) {
      return [
        `Improve ${keyword} with daily drills`,
        `Review ${keyword} errors each evening`,
        `Practice ${keyword} using past papers`,
        `Clarify ${keyword} concepts with teacher`,
        `Strengthen ${keyword} through corrections`
      ];
    } else {
      return [
        `Rebuild ${keyword} foundations stepwise`,
        `Practice ${keyword} basics before tests`,
        `Ask support on ${keyword} misconceptions`,
        `Revise ${keyword} with guided examples`,
        `Correct ${keyword} mistakes immediately`
      ];
    }
  }

  private getPrimarySubjectKeyword(
    subject?: string,
    stage: SchoolStage = 'genericSecondary'
  ): string {
    if (!subject) return 'concepts';
    const normalized = subject.toLowerCase();
    const lowStage = stage === 'form1to2';
    const midStage = stage === 'form3to4';
    let keyword = 'concepts';

    if (normalized.includes('math')) keyword = lowStage ? 'steps' : midStage ? 'equations' : 'problem-solving';
    else if (normalized.includes('physics')) keyword = lowStage ? 'units' : midStage ? 'calculations' : 'principles';
    else if (normalized.includes('chem')) keyword = lowStage ? 'symbols' : midStage ? 'reactions' : 'concepts';
    else if (normalized.includes('biology')) keyword = lowStage ? 'definitions' : midStage ? 'processes' : 'analysis';
    else if (normalized.includes('history')) keyword = lowStage ? 'facts' : midStage ? 'evidence' : 'arguments';
    else if (normalized.includes('geography')) keyword = lowStage ? 'mapwork' : midStage ? 'maps' : 'case-studies';
    else if (normalized.includes('account')) keyword = lowStage ? 'entries' : midStage ? 'ledgers' : 'interpretation';
    else if (normalized.includes('business')) keyword = lowStage ? 'key terms' : midStage ? 'analysis' : 'evaluation';
    else if (normalized.includes('english') || normalized.includes('language'))
      keyword = lowStage ? 'sentence structure' : midStage ? 'writing' : 'argumentation';
    else if (normalized.includes('computer')) keyword = lowStage ? 'logic' : midStage ? 'program structure' : 'algorithms';

    return this.safeKeyword(keyword, stage);
  }

  private inferSchoolStage(className?: string, studentLevel?: string): SchoolStage {
    const classText = (className || '').toLowerCase();
    const levelText = (studentLevel || '').toLowerCase();

    if (
      levelText.includes('a level') ||
      levelText.includes('as level') ||
      classText.includes('form 5') ||
      classText.includes('form 6') ||
      classText.startsWith('5') ||
      classText.startsWith('6')
    ) {
      return 'form5to6';
    }

    if (
      classText.includes('form 1') ||
      classText.includes('form 2') ||
      classText.startsWith('1') ||
      classText.startsWith('2')
    ) {
      return 'form1to2';
    }

    if (
      classText.includes('form 3') ||
      classText.includes('form 4') ||
      classText.startsWith('3') ||
      classText.startsWith('4')
    ) {
      return 'form3to4';
    }

    if (levelText.includes('o level') || levelText.includes('igcse')) {
      return 'form3to4';
    }

    return 'genericSecondary';
  }

  private safeKeyword(keyword: string, stage: SchoolStage): string {
    return this.containsDisallowedTerms(keyword, stage) ? 'concepts' : keyword;
  }

  private containsDisallowedTerms(text: string, stage: SchoolStage): boolean {
    const disallowed = this.stageDisallowedTerms[stage] || [];
    const normalized = text.toLowerCase();
    return disallowed.some((term) => normalized.includes(term));
  }
}
