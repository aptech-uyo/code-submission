import { ValidationPipe } from '@nestjs/common'
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

  app.setViewEngine('hbs')
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', 'layouts'))
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', '_questions'))

  // Register Handlebars helpers
  hbs.registerHelper('json', (context: any) => JSON.stringify(context))
  hbs.registerHelper('eq', (a: any, b: any) => a === b)
  hbs.registerHelper('add', (a: number, b: number) => a + b)

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const port = process.env.APP_PORT ?? 3000
  await app.listen(port)
  console.log(`\n🚀 Competition server running at http://localhost:${port}\n`)
}

bootstrap()