import { Injectable } from '@nestjs/common'
import { execSync, spawnSync } from 'child_process'
import * as fs from 'fs'
import * as os from 'os'
import * as path from 'path'

import { Language } from '../app.dto'
import {
  C_COMPILATION_TIMEOUT,
  ExecutionResult,
  JAVA_COMPILATION_TIMEOUT,
  MAX_RUN_BUFFER,
  TEST_CASE_TIMEOUT,
  TestCase
} from './runner.dto'

@Injectable()
export class RunnerService {
  runCode(codeText: string, language: Language, testCases: TestCase[]): ExecutionResult {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'code-submission-'))
    let result

    switch (language) {
      case 'C':
        result = this.runC(codeText, testCases, tmpDir)
        break
      case 'PY':
        result = this.runPython(codeText, testCases, tmpDir)
        break
      case 'JAVA':
        result = this.runJava(codeText, testCases, tmpDir)
        break
      case 'JS':
        result = this.runJavaScript(codeText, testCases, tmpDir)
        break
      default:
        throw new Error(`Cannot run unknown language: "${language}"`)
    }

    fs.rmSync(tmpDir, { recursive: true, force: true })
    return result
  }

  private runC(codeText: string, testCases: TestCase[], tmpDir: string): ExecutionResult {
    const srcPath = path.join(tmpDir, 'solution.c')
    const outPath = path.join(tmpDir, 'solution')
    fs.writeFileSync(srcPath, codeText)

    try {
      execSync(`gcc -o "${outPath}" "${srcPath}" -lm 2>&1`, {
        timeout: C_COMPILATION_TIMEOUT,
        encoding: 'utf8'
      })
    } catch (error: any) {
      return {
        status: 'COMPILE_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown compilation error',
        passedCases: 0,
        totalCases: testCases.length
      }
    }

    return this.runAllCases(testCases, outPath, [])
  }

  private runPython(codeText: string, testCases: TestCase[], tmpDir: string): ExecutionResult {
    const srcPath = path.join(tmpDir, 'solution.py')
    fs.writeFileSync(srcPath, codeText)

    return this.runAllCases(testCases, 'python3', [srcPath])
  }

  private runJava(codeText: string, testCases: TestCase[], tmpDir: string): ExecutionResult {
    // Extract class name — Java requires filename to match public class name
    const classMatch = codeText.match(/public\s+class\s+(\w+)/)
    const className = classMatch ? classMatch[1] : 'Solution'
    const srcPath = path.join(tmpDir, `${className}.java`)
    fs.writeFileSync(srcPath, codeText)

    try {
      execSync(`javac "${srcPath}" 2>&1`, {
        timeout: JAVA_COMPILATION_TIMEOUT,
        encoding: 'utf8',
        cwd: tmpDir
      })
    } catch (error: any) {
      return {
        status: 'COMPILE_ERROR',
        errorMessage: error instanceof Error ? error.message : 'Unknown compilation error',
        passedCases: 0,
        totalCases: testCases.length
      }
    }

    return this.runAllCases(testCases, 'java', ['-cp', tmpDir, className])
  }

  private runJavaScript(codeText: string, testCases: TestCase[], tmpDir: string): ExecutionResult {
    // Wrap code so it can read from stdin
    const wrappedCodeText = `
const readline = require('readline');
const rl = readline.createInterface({ input: process.stdin, terminal: false });
const lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  let _lineIndex = 0;
  const input = () => lines[_lineIndex++];
  const readLine = () => lines[_lineIndex++];
  // --- student code below ---
${codeText}
});
`
    const srcPath = path.join(tmpDir, 'solution.js')
    fs.writeFileSync(srcPath, wrappedCodeText)

    return this.runAllCases(testCases, 'node', [srcPath])
  }

  private runAllCases(testCases: TestCase[], command: string, args: string[]): ExecutionResult {
    let passedCases = 0
    let lastOutput = ''
    let lastError = ''

    for (const tc of testCases) {
      const result = spawnSync(command, args, {
        input: tc.input,
        encoding: 'utf8',
        timeout: TEST_CASE_TIMEOUT,
        maxBuffer: MAX_RUN_BUFFER
      })
      const timedOut = result.signal === 'SIGTERM' || result.status === null

      if (timedOut)
        return {
          status: 'TIME_LIMIT_EXCEEDED',
          errorMessage: 'Time limit exceeded',
          passedCases,
          totalCases: testCases.length
        }
      if (result.error != null)
        return {
          status: 'RUNTIME_ERROR',
          output: result.stdout,
          errorMessage: result.stderr.slice(0, 800),
          passedCases,
          totalCases: testCases.length
        }

      lastOutput = result.stdout.trim()
      lastError = result.stderr

      const actual = this.normalizeOutput(result.stdout)
      const expected = this.normalizeOutput(tc.expected)
      if (actual !== expected)
        return {
          status: 'WRONG_ANSWER',
          output: `Expected:\n${expected}\n\nGot:\n${actual}`,
          errorMessage: lastError.length > 0 ? lastError : undefined,
          passedCases,
          totalCases: testCases.length
        }

      passedCases++
    }

    return { status: 'ACCEPTED', output: 'All test cases passed!', passedCases, totalCases: testCases.length }
  }

  private normalizeOutput(raw: string): string {
    return raw
      .split('\n')
      .map((line) => line.trimEnd())
      .join('\n')
      .trim()
  }
}
