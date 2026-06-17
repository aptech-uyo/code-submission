import { IsIn, IsNotEmpty } from 'class-validator'

export interface Page {
  pageTitle: string
  competitionActive?: boolean
  competitionStartTime?: string
  competitionDurationMinutes?: number
}

export interface CsrfProtectedPage extends Page {
  csrfToken: string
}

export interface QuestionPage extends CsrfProtectedPage {
  question: QuestionDetailsDto
  students: StudentDto[]
}

export interface SubmissionsPage extends Page {
  submissions: SubmitCodeDto[]
}

export type Language = 'C' | 'PY' | 'JAVA' | 'JS'
export type ExecutionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'

export interface StudentDto {
  id: number
  name: string
}

export interface QuestionExample {
  input: string
  output: string
  explanation?: string
}

export interface QuestionDetailsDto {
  id: number
  title: string
  statement: string // HTML
  inputFormat: string // HTML
  outputFormat: string // HTML
  constraintList: string[] // HTML[]
  examplesJson: string // JSON-stringified QuestionExample[]
}

export class SubmitCodeDto {
  @IsNotEmpty()
  studentId!: number

  @IsIn(['C', 'PY', 'JAVA', 'JS'])
  language!: Language

  @IsNotEmpty()
  codeText!: string
}

interface LeaderboardEntry {
  submissionId: number
  studentId: number
  executionId: number
  studentName: string
  language: string
  latestStatus: ExecutionStatus
}

export const SESSION_COOKIE_NAME = 'connect.sid'
export const CSRF_HEADER_NAME = 'X-Csrf-Token'
export const MAX_SOURCE_FILE_SIZE = 512 * 1024 // 512KB
