// This file exists solely for use by the TypeORM CLI.
import 'dotenv/config'
import { join } from 'path'
import { DataSource, DataSourceOptions } from 'typeorm'

export const dataSourceOptions: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DATABASE_LOCATION ?? '',
  entities: [join(__dirname, '**', '*.entity.ts')],
  migrations: [join(__dirname, '**', 'migrations', '*.ts')],
  migrationsRun: true,
  synchronize: process.env.SYNC_ORM === 'true',
  isolateWhereStatements: true
}

/**
 * This is the ORM config to be used for the TypeORM CLI.
 */
export const dataSource = new DataSource(dataSourceOptions)
