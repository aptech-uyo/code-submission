import { IsIn, IsNotEmpty } from 'class-validator'

export interface Page {
  pageTitle: string
}

export interface CsrfProtectedPage extends Page {
  csrfToken: string // for forms and POST requests
}

export interface QuestionPage extends CsrfProtectedPage {
  questionId: number
}

export interface SubmissionsPage extends Page {
  submissions: SubmitCodeDto[]
}

export class SubmitCodeDto {
  @IsNotEmpty()
  studentId!: number

  @IsIn(['C', 'PY', 'JAVA', 'JS'])
  language!: 'C' | 'PY' | 'JAVA' | 'JS'

  @IsNotEmpty()
  codeText!: string
}

interface LeaderboardEntry {
  submissionId: number
  studentId: number
  executionId: number
  studentName: string
  language: string
  latestStatus: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED'
}

export const SESSION_COOKIE_NAME = 'connect.sid'
export const CSRF_HEADER_NAME = 'X-Csrf-Token'
