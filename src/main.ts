import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import cookieParser from 'cookie-parser'
import { csrfSync } from 'csrf-sync'
import session from 'express-session'
import hbs from 'hbs'
// @ts-expect-error 'hbs-utils' has no type declarations
import hbsUtils from 'hbs-utils'
import { join } from 'path'

import { CSRF_HEADER_NAME, SESSION_COOKIE_NAME } from './app.dto'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)
  const configService = app.get(ConfigService)

  app.useStaticAssets(join(__dirname, '..', 'public'))
  app.setBaseViewsDir(join(__dirname, '..', 'views'))

  // session
  app.use(
    session({
      cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 },
      name: SESSION_COOKIE_NAME,
      proxy: false,
      secret: configService.getOrThrow<string>('SESSION_SECRET'),
      resave: false,
      saveUninitialized: false
    })
  )
  app.use(cookieParser(configService.getOrThrow<string>('SESSION_SECRET')))
  const { csrfSynchronisedProtection } = csrfSync({
    getTokenFromRequest: (req) => req.header(CSRF_HEADER_NAME)
  })
  app.use(csrfSynchronisedProtection)

  // Handlebars
  app.setViewEngine('hbs')
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', 'layouts'))
  hbsUtils(hbs).registerWatchedPartials(join(__dirname, '..', 'views', '_questions'))

  await app.listen(3000)
}

bootstrap()
