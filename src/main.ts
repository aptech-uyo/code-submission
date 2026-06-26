import { ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import { join } from 'path'

import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))

  app.enableCors({ origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], methods: ['GET', 'POST'] })

  app.useGlobalPipes(new ValidationPipe({ transform: true }))

  const port = configService.get('APP_PORT', 3001)
  await app.listen(port)
}

bootstrap()
