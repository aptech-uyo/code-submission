import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Render,
  Req,
  UploadedFile,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import hljs from 'highlight.js'
import { marked } from 'marked'
import { markedHighlight } from 'marked-highlight'
import markedKatex, { MarkedKatexOptions } from 'marked-katex-extension'
import * as multer from 'multer'

import { ExecutionResult } from 'runner/runner.dto'
import {
  LeaderboardEntry,
  LeaderboardPage,
  MAX_SOURCE_FILE_SIZE,
  Page,
  QuestionPage,
  SubmitCodeDto
} from './app.dto'
import { AppService } from './app.service'

marked.use(
  markedKatex({ throwOnError: false } as MarkedKatexOptions),
  markedHighlight({
    highlight: function highlight(code: string, language: string, info: string): string {
      return hljs.highlight(code, { language: hljs.getLanguage(language) ? language : 'plaintext' }).value
    }
  })
)

@Controller()
export class AppController {
  private readonly logger
  private readonly competitionStartTime: string
  private readonly competitionDurationMinutes: number

  constructor(
    private readonly appService: AppService,
    private readonly configService: ConfigService
  ) {
    this.logger = new Logger(AppController.name)
    this.competitionStartTime = this.configService.getOrThrow<string>('COMPETITION_START_TIME')
    this.competitionDurationMinutes = Number(
      this.configService.get<string>('COMPETITION_DURATION_MINUTES', '75')
    )
  }

  /** Shared timer data passed to every page */
  private getTimerData() {
    return {
      competitionStartTime: this.competitionStartTime,
      competitionDurationMinutes: this.competitionDurationMinutes,
      competitionStarted: this.hasCompetitionStarted()
    }
  }

  /** Check whether the competition is currently active (started and not expired) */
  private isCompetitionActive(): boolean {
    const start = new Date(this.competitionStartTime).getTime()
    const now = Date.now()
    const end = start + this.competitionDurationMinutes * 60 * 1000
    return now >= start && now < end
  }

  /** Check whether the competition has started */
  private hasCompetitionStarted(): boolean {
    const start = new Date(this.competitionStartTime).getTime()
    const now = Date.now()
    return now >= start
  }

  @Get()
  @Render('index')
  getIndex(): Page & Record<string, any> {
    return { pageTitle: 'Welcome', ...this.getTimerData() }
  }

  @Get('questions')
  @Render('questions')
  async getQuestions() {
    if (!this.hasCompetitionStarted()) {
      throw new ForbiddenException('The competition has not started yet.')
    }
    const questions = await this.appService.getQuestions()
    return {
      pageTitle: 'Questions',
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title
      })),
      ...this.getTimerData()
    }
  }

  @Get('questions/:id')
  @Render('question')
  async getQuestion(@Param('id') id: number, @Req() req: Request): Promise<QuestionPage> {
    if (!this.hasCompetitionStarted()) {
      throw new ForbiddenException('The competition has not started yet.')
    }
    const question = await this.appService.getQuestion(id)
    if (!question) throw new NotFoundException('Question not found')

    return {
      pageTitle: `Problem ${question.id}: ${question.title}`,
      question: {
        id: question.id,
        title: question.title,
        statement: await marked.parseInline(question.statement),
        inputFormat: await marked.parseInline(question.inputFormatStatement),
        outputFormat: await marked.parseInline(question.outputFormatStatement),
        constraintList: await Promise.all(
          question.constraintList?.map(async (c) => await marked.parseInline(c)) ?? []
        ),
        examplesJson: JSON.stringify(
          await Promise.all(
            question.examples.map(async (ex) => {
              ex.explanation = ex.explanation ? await marked.parseInline(ex.explanation) : undefined
              return ex
            })
          )
        )
      },
      students: await this.appService.getStudents(),
      csrfToken: req.csrfToken!(),
      competitionActive: this.isCompetitionActive(),
      ...this.getTimerData()
    }
  }

  @Post('questions/:id')
  @UseInterceptors(
    FileInterceptor('codeFile', {
      storage: multer.memoryStorage(),
      limits: { fileSize: MAX_SOURCE_FILE_SIZE }
    })
  )
  async submitCode(
    @Param('id') id: number,
    @Body(new ValidationPipe({ expectedType: SubmitCodeDto, whitelist: true, forbidNonWhitelisted: true }))
    body: SubmitCodeDto,
    @UploadedFile() file: Express.Multer.File | undefined
  ): Promise<ExecutionResult> {
    // Block submissions when competition has not started or has ended
    if (!this.isCompetitionActive())
      throw new ForbiddenException(
        'Submissions are closed. The competition has either not started or has ended.'
      )

    const question = await this.appService.getQuestion(id)
    if (!question) throw new NotFoundException('Question not found')

    const codeText = file ? file.buffer.toString('utf8') : body.codeText
    if (codeText == null || codeText.trim() == null)
      throw new BadRequestException('No code provided. Either paste code or upload a file.')
    body.codeText = codeText

    let submission
    try {
      submission = await this.appService.submitCode(question, body)
    } catch (error) {
      this.logger.error(`Could not submit code for question with ID "${id}"`)
      throw error
    }

    let result
    try {
      result = await this.appService.runSubmission(submission)
    } catch (error) {
      this.logger.error(`Could not run code for question with ID "${id}"`)
      throw error
    }

    return result
  }

  @Get('leaderboard')
  @Render('leaderboard')
  async getLeaderboard(): Promise<LeaderboardPage> {
    const submissions = await this.appService.getLeaderboard()
    const rows: LeaderboardEntry[] = []

    for (const sub of submissions) {
      const entry = rows.find((e) => e.studentId == sub.studentId)
      if (entry) {
        entry.submissions.push({
          id: sub.id,
          questionId: sub.questionId,
          createdAt: sub.createdAt.toISOString(),
          status: sub.executions[0].status // only works now because we guarantee only one exec/submission
        })
      } else {
        rows.push({
          studentId: sub.studentId,
          studentName: `${sub.student.firstName} ${sub.student.lastName}`,
          submissions: [
            {
              id: sub.id,
              questionId: sub.questionId,
              createdAt: sub.createdAt.toISOString(),
              status: sub.executions[0].status
            }
          ]
        })
      }
    }

    rows.sort((a, b) => {
      const aAcceptedCount = a.submissions.reduce((acc, i) => acc + (i.status === 'ACCEPTED' ? 1 : 0), 0)
      const bAcceptedCount = b.submissions.reduce((acc, i) => acc + (i.status === 'ACCEPTED' ? 1 : 0), 0)
      if (aAcceptedCount != bAcceptedCount) return bAcceptedCount - aAcceptedCount

      if (aAcceptedCount == 0) {
        const aWrongCount = a.submissions.reduce((acc, i) => acc + (i.status === 'WRONG_ANSWER' ? 1 : 0), 0)
        const bWrongCount = b.submissions.reduce((acc, i) => acc + (i.status === 'WRONG_ANSWER' ? 1 : 0), 0)
        if (aWrongCount != bWrongCount) return bWrongCount - aWrongCount
      }

      const now = new Date()
      const aAcceptedAt = a.submissions.reduce(
        (prev, i) =>
          i.status === 'ACCEPTED' ? (new Date(prev.createdAt) < new Date(i.createdAt) ? prev : i) : prev,
        { id: 0, questionId: 0, createdAt: now.toISOString(), status: 'ACCEPTED' }
      )
      const bAcceptedAt = b.submissions.reduce(
        (prev, i) =>
          i.status === 'ACCEPTED' ? (new Date(prev.createdAt) < new Date(i.createdAt) ? prev : i) : prev,
        { id: 0, questionId: 0, createdAt: now.toISOString(), status: 'ACCEPTED' }
      )
      if (new Date(aAcceptedAt.createdAt).getTime() != new Date(bAcceptedAt.createdAt).getTime())
        return new Date(bAcceptedAt.createdAt).getTime() - new Date(aAcceptedAt.createdAt).getTime()

      const aWrongAt = a.submissions.reduce(
        (prev, i) =>
          i.status === 'WRONG_ANSWER' ? (new Date(prev.createdAt) < new Date(i.createdAt) ? prev : i) : prev,
        { id: 0, questionId: 0, createdAt: now.toISOString(), status: 'WRONG_ANSWER' }
      )
      const bWrongAt = b.submissions.reduce(
        (prev, i) =>
          i.status === 'WRONG_ANSWER' ? (new Date(prev.createdAt) < new Date(i.createdAt) ? prev : i) : prev,
        { id: 0, questionId: 0, createdAt: now.toISOString(), status: 'WRONG_ANSWER' }
      )
      if (new Date(aWrongAt.createdAt).getTime() != new Date(bWrongAt.createdAt).getTime())
        return new Date(bWrongAt.createdAt).getTime() - new Date(aWrongAt.createdAt).getTime()

      return 0
    })

    return { pageTitle: 'Leaderboard', rows: JSON.stringify(rows), ...this.getTimerData() }
  }
}
