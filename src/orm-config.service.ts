import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm'
import { join } from 'path'

import { AppService } from './app.service'

/**
 *  This is the ORM config to be used within the NestJS application.
 */
@Injectable()
export class OrmConfigService implements TypeOrmOptionsFactory {
  constructor(
    private configService: ConfigService,
    private appService: AppService
  ) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'sqlite',
      database: this.configService.get<string>('DATABASE_LOCATION'),
      entities: [join(__dirname, '**', '*.entity{.ts,.js}')],
      migrations: [join(__dirname, '**', 'migrations', '*{.ts,.js}')],
      migrationsRun: true,
      synchronize: this.appService.syncOrm,
      isolateWhereStatements: true
    }
  }
}
