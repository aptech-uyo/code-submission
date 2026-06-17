import {
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
import { MAX_SOURCE_FILE_SIZE, Page, QuestionPage, SubmitCodeDto } from './app.dto'
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
    this.competitionDurationMinutes = parseInt(
      this.configService.get<string>('COMPETITION_DURATION_MINUTES', '75'),
      10
    )
  }

  /** Shared timer data passed to every page */
  private getTimerData() {
    return {
      competitionStartTime: this.competitionStartTime,
      competitionDurationMinutes: this.competitionDurationMinutes
    }
  }

  /** Check whether the competition is currently active (started and not expired) */
  private isCompetitionActive(): boolean {
    const start = new Date(this.competitionStartTime).getTime()
    const now = Date.now()
    const end = start + this.competitionDurationMinutes * 60 * 1000
    return now >= start && now < end
  }

  @Get()
  @Render('index')
  getIndex(): Page & Record<string, any> {
    return { pageTitle: 'Welcome', ...this.getTimerData() }
  }

  @Get('questions')
  @Render('questions')
  async getQuestions() {
    const questions = await this.appService.getQuestions()
    return {
      pageTitle: 'Questions',
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        timeLimit: '1s',
        memoryLimit: '256MB'
      })),
      ...this.getTimerData()
    }
  }

  @Get('questions/:id')
  @Render('question')
  async getQuestion(@Param('id') id: number, @Req() req: Request): Promise<QuestionPage> {
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
    if (!this.isCompetitionActive()) {
      throw new ForbiddenException('Submissions are closed. The competition has either not started or has ended.')
    }

    const question = await this.appService.getQuestion(id)
    if (!question) throw new NotFoundException('Question not found')

    const codeText = file ? file.buffer.toString('utf8') : body.codeText
    if (codeText == null || codeText.trim() == null)
      throw new NotFoundException('No code provided. Either paste code or upload a file.')

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
  async getLeaderboard() {
    const submissions = await this.appService.getLeaderboard()
    const grouped: Record<string, any> = {}

    for (const sub of submissions) {
      const key = `${sub.student.firstName} ${sub.student.lastName}`
      if (!grouped[key]) grouped[key] = { name: key, questions: {}, totalPassed: 0, firstAcceptedAt: null }
      
      const accepted = sub.acceptedAt != null || sub.executions?.some((e) => e.status === 'ACCEPTED')
      
      if (accepted) {
        const time = sub.acceptedAt ? new Date(sub.acceptedAt).getTime() : new Date(sub.createdAt).getTime()
        if (!grouped[key].firstAcceptedAt || time < grouped[key].firstAcceptedAt) {
          grouped[key].firstAcceptedAt = time
        }
      }

      if (!grouped[key].questions[sub.questionId]) {
        grouped[key].questions[sub.questionId] = accepted ? 'ACCEPTED' : 'ATTEMPTED'
        if (accepted) grouped[key].totalPassed++
      } else if (accepted && grouped[key].questions[sub.questionId] !== 'ACCEPTED') {
        grouped[key].questions[sub.questionId] = 'ACCEPTED'
        grouped[key].totalPassed++
      }
    }

    const rows = Object.values(grouped).sort((a: any, b: any) => {
      if (a.firstAcceptedAt && b.firstAcceptedAt) {
        return a.firstAcceptedAt - b.firstAcceptedAt
      }
      if (a.firstAcceptedAt) return -1
      if (b.firstAcceptedAt) return 1
      return b.totalPassed - a.totalPassed
    })
    return { pageTitle: 'Leaderboard', rows: JSON.stringify(rows), ...this.getTimerData() }
  }
}
