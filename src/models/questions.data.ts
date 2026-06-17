import { TestCase } from 'runner/runner.dto'

export interface QuestionData {
  id: number
  title: string
  timeLimit: string
  memoryLimit: string
  statement: string
  inputFormat: string
  outputFormat: string
  constraints: string[]
  examples: { input: string; output: string; explanation?: string }[]
  testCases: TestCase[] // hidden test cases used for judging
}

export const QUESTIONS: QuestionData[] = [
  {
    id: 1,
    title: 'Sum of Two Numbers',
    timeLimit: '1 second',
    memoryLimit: '256 megabytes',
    statement: `You are given two integers $a$ and $b$. Your task is to compute and print their sum.

This is a classic problem to test basic input/output handling and arithmetic operations in your programming language of choice.`,
    inputFormat: `The input consists of a single line containing two integers $a$ and $b$ separated by a single space.`,
    outputFormat: `Print a single integer equal to the sum of $a$ and $b$.`,
    constraints: [
      '$-10^9 \\leq a, b \\leq 10^9$',
      'The integers are guaranteed to fit in a 32-bit signed integer.'
    ],
    examples: [
      {
        input: '3 5',
        output: '8',
        explanation: '$3 + 5 = 8$'
      },
      {
        input: '-4 10',
        output: '6',
        explanation: '$-4 + 10 = 6$'
      },
      {
        input: '0 0',
        output: '0'
      }
    ],
    testCases: [
      { input: '3 5', expected: '8' },
      { input: '-4 10', expected: '6' },
      { input: '0 0', expected: '0' },
      { input: '1000000000 -1000000000', expected: '0' },
      { input: '-500 -300', expected: '-800' },
      { input: '1 1', expected: '2' },
      { input: '999999999 1', expected: '1000000000' },
      { input: '-1 -1', expected: '-2' }
    ]
  },
  {
    id: 2,
    title: 'FizzBuzz Range',
    timeLimit: '2 seconds',
    memoryLimit: '256 megabytes',
    statement: `You are given two integers $l$ and $r$. For each integer $i$ from $l$ to $r$ (inclusive), print:

- **"FizzBuzz"** if $i$ is divisible by both 3 and 5
- **"Fizz"** if $i$ is divisible by 3 only
- **"Buzz"** if $i$ is divisible by 5 only
- The integer $i$ itself if it is not divisible by 3 or 5

This is a classic programming exercise that tests your understanding of conditional logic and loops.`,
    inputFormat: `The input consists of a single line containing two integers $l$ and $r$ separated by a single space.`,
    outputFormat: `Print $r - l + 1$ lines. On each line, print the corresponding FizzBuzz result for each integer from $l$ to $r$.`,
    constraints: ['$1 \\leq l \\leq r \\leq 100$', 'It is guaranteed that $l \\leq r$.'],
    examples: [
      {
        input: '1 15',
        output: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz',
        explanation:
          'Classic FizzBuzz from 1 to 15. Note that 15 is divisible by both 3 and 5, so it prints "FizzBuzz".'
      },
      {
        input: '13 16',
        output: '13\n14\nFizzBuzz\n16'
      }
    ],
    testCases: [
      { input: '1 15', expected: '1\n2\nFizz\n4\nBuzz\nFizz\n7\n8\nFizz\nBuzz\n11\nFizz\n13\n14\nFizzBuzz' },
      { input: '13 16', expected: '13\n14\nFizzBuzz\n16' },
      { input: '1 1', expected: '1' },
      { input: '15 15', expected: 'FizzBuzz' },
      { input: '3 3', expected: 'Fizz' },
      { input: '5 5', expected: 'Buzz' },
      { input: '1 5', expected: '1\n2\nFizz\n4\nBuzz' },
      { input: '30 30', expected: 'FizzBuzz' },
      { input: '14 17', expected: '14\nFizzBuzz\n16\n17' },
      { input: '7 12', expected: '7\n8\nFizz\nBuzz\n11\nFizz' }
    ]
  }
]
