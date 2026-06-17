import {
  Body,
  Controller,
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
import { FileInterceptor } from '@nestjs/platform-express'
import { Request } from 'express'
import * as multer from 'multer'

import { ExecutionResult } from 'runner/runner.dto'
import { MAX_SOURCE_FILE_SIZE, Page, SubmitCodeDto } from './app.dto'
import { AppService } from './app.service'

@Controller()
export class AppController {
  private readonly logger

  constructor(private readonly appService: AppService) {
    this.logger = new Logger(AppController.name)
  }

  @Get()
  @Render('index')
  getIndex(): Page {
    return { pageTitle: 'Welcome' }
  }

  @Get('questions')
  @Render('questions')
  getQuestions() {
    const questions = this.appService.getQuestions()
    return {
      pageTitle: 'Questions',
      questions: questions.map((q) => ({
        id: q.id,
        title: q.title,
        timeLimit: q.timeLimit,
        memoryLimit: q.memoryLimit
      }))
    }
  }

  @Get('questions/:id')
  @Render('question')
  async getQuestion(@Param('id') id: number, @Req() req: Request) {
    const question = this.appService.getQuestion(id)
    if (!question) throw new NotFoundException('Question not found')

    return {
      pageTitle: `Problem ${question.id}: ${question.title}`,
      question: {
        ...question,
        constraintsJson: JSON.stringify(question.constraints),
        examplesJson: JSON.stringify(question.examples)
      },
      students: await this.appService.getStudents(),
      csrfToken: req.csrfToken!()
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
    const question = this.appService.getQuestion(id)
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
      if (!grouped[key]) grouped[key] = { name: key, questions: {}, totalPassed: 0 }
      const accepted = sub.executions?.some((e) => e.status === 'ACCEPTED')
      if (!grouped[key].questions[sub.questionId]) {
        grouped[key].questions[sub.questionId] = accepted ? 'ACCEPTED' : 'ATTEMPTED'
        if (accepted) grouped[key].totalPassed++
      } else if (accepted && grouped[key].questions[sub.questionId] !== 'ACCEPTED') {
        grouped[key].questions[sub.questionId] = 'ACCEPTED'
        grouped[key].totalPassed++
      }
    }

    const rows = Object.values(grouped).sort((a: any, b: any) => b.totalPassed - a.totalPassed)
    return { pageTitle: 'Leaderboard', rows: JSON.stringify(rows) }
  }
}
