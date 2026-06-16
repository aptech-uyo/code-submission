import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Execution, Student, Submission } from 'models/db.entity'
import { ExecutorService } from 'models/executor.service'
import { QuestionData, QUESTIONS } from 'models/questions.data'
import { SubmitCodeDto } from './app.dto'

@Injectable()
export class AppService {
  constructor(
    private readonly executorService: ExecutorService,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Execution)
    private readonly executionRepo: Repository<Execution>
  ) {}

  async getStudents() {
    const studentList = await this.studentRepo.find()
    return studentList.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))
  }

  getQuestions() {
    return QUESTIONS
  }

  getQuestion(id: number) {
    return QUESTIONS.find((q) => q.id === id) ?? null
  }

  async submitCode(question: QuestionData, data: SubmitCodeDto) {
    // Save submission
    const submission = this.submissionRepo.create({
      questionId: question.id,
      studentId: data.studentId,
      language: data.language,
      codeText: data.codeText
    })
    await this.submissionRepo.save(submission)

    // Run code against test cases
    const result = await this.executorService.runCode(data.language, data.codeText, question.testCases)

    // Save execution record
    const execution = this.executionRepo.create({
      submissionId: submission.id,
      status: result.status,
      output: result.output,
      errorMessage: result.errorMessage
    })
    await this.executionRepo.save(execution)

    return { submission, execution, result }
  }

  async getLeaderboard() {
    const submissions = await this.submissionRepo.find({
      relations: ['student', 'executions'],
      order: { createdAt: 'ASC' }
    })
    return submissions
  }
}
