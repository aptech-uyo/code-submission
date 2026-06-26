import { IsIn, IsNotEmpty, ValidateIf } from 'class-validator'

export interface TimerData {
  competitionStarted?: boolean
  competitionActive?: boolean
  competitionStartTime?: string
  competitionDurationMinutes?: number
}

export interface QuestionList extends TimerData {
  questions: QuestionDto[]
}

export interface QuestionDetails extends TimerData {
  question: QuestionDetailsDto
  students: StudentDto[]
}

export interface SubmissionList extends TimerData {
  submissions: SubmitCodeDto[]
}

export interface LeaderboardList extends TimerData {
  rows: LeaderboardEntry[]
}

export type Language = 'C' | 'PY' | 'JAVA' | 'JS'
export type ExecutionStatus =
  | 'ACCEPTED'
  | 'WRONG_ANSWER'
  | 'COMPILE_ERROR'
  | 'RUNTIME_ERROR'
  | 'TIME_LIMIT_EXCEEDED'

export interface QuestionDto {
  id: number
  title: string
}

export interface StudentDto {
  id: number
  name: string
}

export interface QuestionExample {
  input: string
  output: string
  explanation?: string // HTML snippet
}

export interface QuestionDetailsDto {
  id: number
  title: string
  statement: string // HTML snippet
  inputFormat: string // HTML snippet
  outputFormat: string // HTML snippet
  constraintList: string[] // list of HTML snippets
  examples: QuestionExample[]
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

export interface LeaderboardEntry {
  studentId: number
  studentName: string
  submissions: SubmissionWithStatus[]
}

export interface SubmissionWithStatus {
  id: number
  questionId: number
  createdAt: string
  status: ExecutionStatus
}

export const MAX_SOURCE_FILE_SIZE = 512 * 1024
