import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { Execution, Question, Student, Submission } from 'models/db.entity'
import { ExecutionResult } from 'runner/runner.dto'
import { RunnerService } from 'runner/runner.service'
import { StudentDto, SubmitCodeDto } from './app.dto'

@Injectable()
export class AppService {
  constructor(
    private readonly runnerService: RunnerService,
    @InjectRepository(Student) private readonly studentRepo: Repository<Student>,
    @InjectRepository(Question) private readonly questionRepo: Repository<Question>,
    @InjectRepository(Submission) private readonly submissionRepo: Repository<Submission>,
    @InjectRepository(Execution) private readonly executionRepo: Repository<Execution>
  ) {}

  async getStudents(): Promise<StudentDto[]> {
    const studentList = await this.studentRepo.find()
    return studentList.map((s) => ({ id: s.id, name: `${s.firstName} ${s.lastName}` }))
  }

  async getQuestions(): Promise<Question[]> {
    return await this.questionRepo.find()
  }

  async getQuestion(id: number): Promise<Question | null> {
    return await this.questionRepo.findOneBy({ id })
  }

  async submitCode(question: Question, data: SubmitCodeDto): Promise<Submission> {
    const submission = this.submissionRepo.create({
      questionId: question.id,
      studentId: data.studentId,
      language: data.language,
      codeText: data.codeText
    })
    return await this.submissionRepo.save(submission)
  }

  async runSubmission(submission: Submission): Promise<ExecutionResult> {
    const question = (await this.getQuestion(submission.questionId))!
    const result = this.runnerService.runCode(submission.codeText, submission.language, question.testCases)

    const execution = this.executionRepo.create({
      submissionId: submission.id,
      status: result.status,
      output: result.output,
      errorMessage: result.errorMessage
    })
    await this.executionRepo.save(execution)

    if (result.status === 'ACCEPTED' && !submission.acceptedAt) {
      submission.acceptedAt = new Date()
      await this.submissionRepo.save(submission)
    }

    return result
  }

  async getLeaderboard() {
    const submissions = await this.submissionRepo.find({
      relations: ['student', 'executions'],
      order: { createdAt: 'ASC' }
    })
    return submissions
  }

  // for internal use only via REPL, until admin UI is built
  getQuestionRepo() {
    return this.questionRepo
  }
}
