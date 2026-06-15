import { Injectable, Logger } from '@nestjs/common'
import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

export type Language = 'C' | 'PY' | 'JAVA' | 'JS'

export interface ExecutionResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'COMPILE_ERROR' | 'RUNTIME_ERROR' | 'TIME_LIMIT_EXCEEDED'
  output?: string
  errorMessage?: string
  passedCases: number
  totalCases: number
}

@Injectable()
export class ExecutorService {
  private readonly logger = new Logger(ExecutorService.name)
  private readonly TIMEOUT_MS = 5000 // 5 seconds per test case

  async runCode(
    language: Language,
    code: string,
    testCases: { input: string; expectedOutput: string }[]
  ): Promise<ExecutionResult> {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'submission-'))

    try {
      switch (language) {
        case 'PY':
          return this.runPython(code, testCases, tmpDir)
        case 'JS':
          return this.runJavaScript(code, testCases, tmpDir)
        case 'C':
          return this.runC(code, testCases, tmpDir)
        case 'JAVA':
          return this.runJava(code, testCases, tmpDir)
        default:
          return { status: 'RUNTIME_ERROR', errorMessage: 'Unknown language', passedCases: 0, totalCases: testCases.length }
      }
    } finally {
      try { fs.rmSync(tmpDir, { recursive: true, force: true }) } catch {}
    }
  }

  private normalizeOutput(raw: string): string {
    return raw
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim()
  }

  private runAllCases(
    testCases: { input: string; expectedOutput: string }[],
    runner: (input: string) => { stdout: string; stderr: string; timedOut: boolean; error: boolean }
  ): ExecutionResult {
    let passed = 0
    let lastOutput = ''
    let lastError = ''

    for (const tc of testCases) {
      const result = runner(tc.input)

      if (result.timedOut) {
        return {
          status: 'TIME_LIMIT_EXCEEDED',
          errorMessage: 'Your program exceeded the time limit.',
          output: lastOutput,
          passedCases: passed,
          totalCases: testCases.length
        }
      }

      if (result.error) {
        return {
          status: 'RUNTIME_ERROR',
          errorMessage: result.stderr.slice(0, 800),
          output: result.stdout,
          passedCases: passed,
          totalCases: testCases.length
        }
      }

      lastOutput = result.stdout.trim()
      lastError = result.stderr

      const actual = this.normalizeOutput(result.stdout)
      const expected = this.normalizeOutput(tc.expectedOutput)

      if (actual === expected) {
        passed++
      } else {
        return {
          status: 'WRONG_ANSWER',
          output: `Expected:\n${expected}\n\nGot:\n${actual}`,
          errorMessage: lastError || undefined,
          passedCases: passed,
          totalCases: testCases.length
        }
      }
    }

    return {
      status: 'ACCEPTED',
      output: 'All test cases passed!',
      passedCases: passed,
      totalCases: testCases.length
    }
  }

  private runPython(code: string, testCases: { input: string; expectedOutput: string }[], tmpDir: string): ExecutionResult {
    const filePath = path.join(tmpDir, 'solution.py')
    fs.writeFileSync(filePath, code)

    return this.runAllCases(testCases, (input) => {
      const result = spawnSync('python3', [filePath], {
        input,
        encoding: 'utf8',
        timeout: this.TIMEOUT_MS,
        maxBuffer: 1024 * 1024
      })
      const isTimedOut = result.signal === 'SIGTERM' || result.status === null;
      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        timedOut: isTimedOut,
        error: result.status !== 0 && !isTimedOut
      }
    })
  }

  private runJavaScript(code: string, testCases: { input: string; expectedOutput: string }[], tmpDir: string): ExecutionResult {
    // Wrap code so it can read from stdin
    const wrapped = `
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  let _lineIndex = 0;
  const input = () => lines[_lineIndex++];
  const readLine = () => lines[_lineIndex++];
  // --- student code below ---
${code}
});
`
    const filePath = path.join(tmpDir, 'solution.js')
    fs.writeFileSync(filePath, wrapped)

    return this.runAllCases(testCases, (inp) => {
      const result = spawnSync('node', [filePath], {
        input: inp,
        encoding: 'utf8',
        timeout: this.TIMEOUT_MS,
        maxBuffer: 1024 * 1024
      })
      const isTimedOut = result.signal === 'SIGTERM' || result.status === null;
      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        timedOut: isTimedOut,
        error: result.status !== 0 && !isTimedOut
      }
    })
  }

  private runC(code: string, testCases: { input: string; expectedOutput: string }[], tmpDir: string): ExecutionResult {
    const srcPath = path.join(tmpDir, 'solution.c')
    const outPath = path.join(tmpDir, 'solution')
    fs.writeFileSync(srcPath, code)

    try {
      execSync(`gcc -o "${outPath}" "${srcPath}" -lm 2>&1`, { timeout: 10000, encoding: 'utf8' })
    } catch (e: any) {
      return {
        status: 'COMPILE_ERROR',
        errorMessage: e.stdout || e.message || 'Compilation failed',
        passedCases: 0,
        totalCases: testCases.length
      }
    }

    return this.runAllCases(testCases, (inp) => {
      const result = spawnSync(outPath, [], {
        input: inp,
        encoding: 'utf8',
        timeout: this.TIMEOUT_MS,
        maxBuffer: 1024 * 1024
      })
      const isTimedOut = result.signal === 'SIGTERM' || result.status === null;
      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        timedOut: isTimedOut,
        error: result.status !== 0 && !isTimedOut
      }
    })
  }

  private runJava(code: string, testCases: { input: string; expectedOutput: string }[], tmpDir: string): ExecutionResult {
    // Extract class name — Java requires filename to match public class name
    const classMatch = code.match(/public\s+class\s+(\w+)/)
    const className = classMatch ? classMatch[1] : 'Solution'

    const srcPath = path.join(tmpDir, `${className}.java`)
    fs.writeFileSync(srcPath, code)

    try {
      execSync(`javac "${srcPath}" 2>&1`, { timeout: 15000, encoding: 'utf8', cwd: tmpDir })
    } catch (e: any) {
      return {
        status: 'COMPILE_ERROR',
        errorMessage: e.stdout || e.message || 'Compilation failed',
        passedCases: 0,
        totalCases: testCases.length
      }
    }

    return this.runAllCases(testCases, (inp) => {
      const result = spawnSync('java', ['-cp', tmpDir, className], {
        input: inp,
        encoding: 'utf8',
        timeout: this.TIMEOUT_MS,
        maxBuffer: 1024 * 1024
      })
      const isTimedOut = result.signal === 'SIGTERM' || result.status === null;
      return {
        stdout: result.stdout ?? '',
        stderr: result.stderr ?? '',
        timedOut: isTimedOut,
        error: result.status !== 0 && !isTimedOut
      }
    })
  }
}