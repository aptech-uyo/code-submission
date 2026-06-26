import { ConfigService } from '@nestjs/config'
import { Test, TestingModule } from '@nestjs/testing'
import { getRepositoryToken } from '@nestjs/typeorm'

import { Execution, Question, Student, Submission } from 'models/db.entity'
import { RunnerService } from 'runner/runner.service'
import { AppController } from './app.controller'
import { AppService } from './app.service'

describe('AppController', () => {
  let app: TestingModule

  beforeAll(async () => {
    app = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn((key: string) => {
              if (key === 'COMPETITION_START_TIME') return new Date().toISOString()
              return ''
            }),
            get: jest.fn((key: string, defaultValue: string) => defaultValue)
          }
        },
        {
          provide: RunnerService,
          useValue: {}
        },
        {
          provide: getRepositoryToken(Student),
          useValue: {}
        },
        {
          provide: getRepositoryToken(Question),
          useValue: {}
        },
        {
          provide: getRepositoryToken(Submission),
          useValue: {}
        },
        {
          provide: getRepositoryToken(Execution),
          useValue: {}
        }
      ]
    }).compile()
  })

  describe('getIndex', () => {
    it('should be the home page', () => {
      const appController = app.get(AppController)
      expect(appController.getIndex()).toHaveProperty('pageTitle', 'Welcome')
    })
  })
})
