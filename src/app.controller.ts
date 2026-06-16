import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Render,
  Req,
  Res,
  UploadedFile,
  UseInterceptors,
  ValidationPipe
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { Request, Response } from 'express'
import * as multer from 'multer'

import { Page, SubmitCodeDto } from './app.dto'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

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
      limits: { fileSize: 512 * 1024 } // 512KB max
    })
  )
  async submitCode(
    @Param('id') id: number,
    @Body(new ValidationPipe({ expectedType: SubmitCodeDto, whitelist: true, forbidNonWhitelisted: true }))
    body: SubmitCodeDto,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res() res: Response
  ) {
    const question = this.appService.getQuestion(id)
    if (!question) throw new NotFoundException('Question not found')

    const codeText = file ? file.buffer.toString('utf8') : body.codeText
    if (!codeText || !codeText.trim())
      return res.status(400).json({ error: 'No code provided. Either paste code or upload a file.' })

    try {
      const { result } = await this.appService.submitCode(question, body)
      return res.json({
        status: result.status,
        output: result.output,
        errorMessage: result.errorMessage,
        passedCases: result.passedCases,
        totalCases: result.totalCases
      })
    } catch (e: any) {
      console.error(e)
      return res.status(500).json({ error: e.message })
    }
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
