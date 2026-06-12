import { Controller, Get, Param, Render } from '@nestjs/common'
import { Page, QuestionPage } from './app.dto'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Render('index')
  getIndex(): Page {
    return {
      pageTitle: 'Home'
    }
  }

  @Get('question/:id')
  @Render('question')
  getQuestion(@Param('id') id: number): QuestionPage {
    return {
      pageTitle: 'Question ' + id,
      questionId: id
    }
  }
}
