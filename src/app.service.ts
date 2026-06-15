import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { SubmitCodeDto } from './app.dto'

import { Execution, Submission } from './models/db.entity'
import { ExecutorService } from 'models/executor.service'
import { QUESTIONS } from 'models/questions.data'

@Injectable()
export class AppService {
  constructor(
    private readonly configService: ConfigService,
    private readonly executorService: ExecutorService,
    @InjectRepository(Submission)
    private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Execution)
    private readonly executionRepo: Repository<Execution>
  ) {}

  get syncOrm(): boolean {
    return this.configService.get('SYNC_ORM') === 'true'
  }

  getQuestions() {
    return QUESTIONS
  }

  getQuestion(id: number) {
    return QUESTIONS.find((q) => q.id === id) ?? null
  }

  async submitCode(dto: SubmitCodeDto) {
    const question = this.getQuestion(Number(dto.questionId))
    if (!question) throw new Error('Question not found')

    // Save submission
    const submission = this.submissionRepo.create({
      questionId: Number(dto.questionId),
      studentName: dto.studentName,
      language: dto.language,
      codeText: dto.codeText
    })
    await this.submissionRepo.save(submission)

    // Run code against test cases
    const result = await this.executorService.runCode(dto.language, dto.codeText, question.testCases)

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
      relations: ['executions'],
      order: { createdAt: 'ASC' }
    })
    return submissions
  }
}