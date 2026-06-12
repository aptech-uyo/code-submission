import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import hbs from 'hbs'
import { join } from 'path'
import { AppModule } from './app.module'
// @ts-expect-error 'hbs-utils' has no type declarations
import hbsUtils from 'hbs-utils'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))

  // Handlebars
  app.setViewEngine('hbs')
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', 'layouts'))
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', '_questions'))

  await app.listen(3000)
}

bootstrap()
