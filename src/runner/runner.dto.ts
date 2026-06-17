import { ExecutionStatus } from '../app.dto'

export interface TestCase {
  input: string
  expected: string
}

export interface ExecutionResult {
  status: ExecutionStatus
  output?: string
  errorMessage?: string
  passedCases: number
  totalCases: number
}

export const TEST_CASE_TIMEOUT = 5000
export const C_COMPILATION_TIMEOUT = 10000
export const JAVA_COMPILATION_TIMEOUT = 15000
export const MAX_RUN_BUFFER = 1024 * 1024
