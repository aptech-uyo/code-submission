import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { Execution, Submission } from './models/db.entity'
import { OrmConfigService } from './orm-config.service'
import { ExecutorService } from 'models/executor.service'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, expandVariables: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: OrmConfigService
    }),
    TypeOrmModule.forFeature([Submission, Execution])
  ],
  controllers: [AppController],
  providers: [AppService, ExecutorService]
})
export class AppModule {}