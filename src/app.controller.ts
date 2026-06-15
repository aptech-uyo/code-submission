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
  UseInterceptors
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

  @Get('question/:id')
  @Render('question')
  getQuestion(@Param('id') id: string, @Req() req: Request) {
    const question = this.appService.getQuestion(Number(id))
    if (!question) throw new NotFoundException('Question not found')
    return {
      pageTitle: `Problem ${question.id}: ${question.title}`,
      question: {
        ...question,
        constraintsJson: JSON.stringify(question.constraints),
        examplesJson: JSON.stringify(question.examples)
      },
      csrfToken: req.csrfToken!()
    }
  }

  @Post('submit')
  @UseInterceptors(
    FileInterceptor('codeFile', {
      storage: multer.memoryStorage(),
      limits: { fileSize: 512 * 1024 } // 512KB max
    })
  )
  async submitCode(
    @Body() body: any,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Res() res: Response
  ) {
    const codeText = file ? file.buffer.toString('utf8') : body.codeText

    if (!codeText || !codeText.trim()) {
      return res.status(400).json({ error: 'No code provided. Either paste code or upload a file.' })
    }

    const dto: SubmitCodeDto = {
      questionId: Number(body.questionId),
      studentName: body.studentName?.trim() || 'Anonymous',
      language: body.language,
      codeText
    }

    try {
      const { result } = await this.appService.submitCode(dto)
      return res.json({
        status: result.status,
        output: result.output,
        errorMessage: result.errorMessage,
        passedCases: result.passedCases,
        totalCases: result.totalCases
      })
    } catch (e: any) {
      return res.status(500).json({ error: e.message })
    }
  }

  @Get('leaderboard')
  @Render('leaderboard')
  async getLeaderboard() {
    const submissions = await this.appService.getLeaderboard()
    const grouped: Record<string, any> = {}

    for (const sub of submissions) {
      const key = sub.studentName
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
