import { IsIn, IsNotEmpty, ValidateIf } from 'class-validator'

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
  statement: string
  inputFormat: string
  outputFormat: string
  constraintList: string[]
  examplesJson: string
}

export class SubmitCodeDto {
  @IsNotEmpty({ message: 'Please select your name.' })
  studentId!: number

  @IsIn(['C', 'PY', 'JAVA', 'JS'], { message: 'Please select a valid language.' })
  language!: Language

  @ValidateIf((o, v) => v != null)
  @IsNotEmpty({ message: 'No code provided. Either paste code or upload a file.' })
  codeText?: string
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
export const MAX_SOURCE_FILE_SIZE = 512 * 1024
