import { IsNotEmpty, IsNumber } from 'class-validator'

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
  submissions: SubmissionReportDto[]
}
export class SubmissionResponseDto {
  @IsNumber()
  studentId!: number

  @IsNotEmpty()
  codeText!: string
}

interface SubmissionReportDto {
  submissionId: number
  studentId: number
  executionId: number
  studentName: string
  language: string
  latestStatus: 'SUCCESS' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'WRONG_OUTPUT'
}

export const SESSION_COOKIE_NAME = 'connect.sid'
export const CSRF_HEADER_NAME = 'X-Csrf-Token'
