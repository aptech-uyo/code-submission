import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

@Injectable()
export class AppService {
  constructor(private readonly configService: ConfigService) {}

  get syncOrm(): boolean {
    return this.configService.get('SYNC_ORM') === 'true'
  }
}
