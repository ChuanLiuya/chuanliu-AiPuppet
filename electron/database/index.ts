// TypeORM 数据源配置（仅主进程使用）
import 'reflect-metadata'
import { DataSource } from 'typeorm'
import { env } from '@electron/config/env'
import { CatEntity } from '@electron/database/entities/cat'
export const dataSource = new DataSource({
  type: 'better-sqlite3',
  database: env.dbPath,
  entities: [CatEntity],
  synchronize: true,
})

/** 初始化数据库连接（由主进程在应用就绪后调用） */
export async function initializeDatabase() {
  await dataSource.initialize()
}
