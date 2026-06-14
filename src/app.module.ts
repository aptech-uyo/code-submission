import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { AppController } from './app.controller'
import { AppService } from './app.service'
import { OrmConfigService } from './orm-config.service'

@Module({
  imports: [
    ConfigModule.forRoot({ cache: true, expandVariables: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useClass: OrmConfigService,
      extraProviders: [AppService]
    })
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
