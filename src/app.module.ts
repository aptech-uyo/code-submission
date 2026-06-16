import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { Execution, Student, Submission } from 'models/db.entity'
import { ExecutorService } from 'models/executor.service'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OrmConfigService } from './orm-config.service'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, expandVariables: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: OrmConfigService
    }),
    TypeOrmModule.forFeature([Student, Submission, Execution])
  ],
  controllers: [AppController],
  providers: [AppService, ExecutorService]
})
export class AppModule {}
