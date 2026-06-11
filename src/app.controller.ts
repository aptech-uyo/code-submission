import { Controller, Get, Param, Render } from '@nestjs/common'
import { QuestionPage } from './app.dto'
import { AppService } from './app.service'

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello()
  }

  @Get('question/:id')
  @Render('question')
  getQuestion(@Param('id') id: number): QuestionPage {
    return {
      questionId: id
    }
  }
}
