/**
 * 启动期的轻量列迁移（必须在 TypeORM synchronize 之前跑）
 *
 * TypeORM 的 `synchronize` 对齐表结构时是「建新表 + 搬运同名列」，改过名的列
 * 会被当成新增列，老数据随之丢失。所以凡是「列改名 / 列语义变化」的改动，
 * 都先在这里用 SQL 把老数据摆正，再让 synchronize 去对齐剩余差异。
 *
 * 目前两条：
 * - chat_session：去头像 + 角色名换角色卡（2026-09）
 * - chat_message → chat_history：表改名 + 布尔身份位换 role 字符串 + 正文列 mes 改 content（2026-09）
 */
import { existsSync } from 'node:fs'
import Database from 'better-sqlite3'
import { env } from '@electron/config/env'

/** 读取某张表的列名；表不存在时返回空数组 */
function readColumns(db: Database.Database, table: string): string[] {
  const existed = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?")
    .get(table)
  if (!existed) return []
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as { name: string }[]
  return rows.map((row) => row.name)
}

/** chat_session：character_name 改名为 character_card，并删除 avatar 列 */
function migrateChatSessionCharacterCard(db: Database.Database) {
  const columns = readColumns(db, 'chat_session')
  if (!columns.length) return

  // 角色名换角色卡：直接改名保留老数据（老值仍是纯文本角色名，符合两态兼容语义）
  if (columns.includes('character_name') && !columns.includes('character_card')) {
    db.exec('ALTER TABLE chat_session RENAME COLUMN character_name TO character_card')
  }

  // 头像字段已废弃（DROP COLUMN 需要 SQLite 3.35+，better-sqlite3 自带的版本满足）
  if (columns.includes('avatar')) {
    db.exec('ALTER TABLE chat_session DROP COLUMN avatar')
  }
}

/** 老的布尔位身份 → role 字符串（需要 is_user / is_system 两列都在） */
const ROLE_FROM_FLAGS = `CASE WHEN is_system = 1 THEN 'system' WHEN is_user = 1 THEN 'user' ELSE 'assistant' END`

/**
 * 把老表 chat_message 的数据搬进 chat_history（两表并存时才会走到）
 *
 * 走到这里说明 synchronize 已经按新实体把 chat_history 建好了，
 * 源表的身份列 / 正文列可能还是改名前的旧名字，按实际列名做映射。
 */
function mergeLegacyMessages(db: Database.Database, sourceColumns: string[]) {
  const targetColumns = readColumns(db, 'chat_history')
  const roleExpr = sourceColumns.includes('role')
    ? 'role'
    : sourceColumns.includes('is_user')
      ? ROLE_FROM_FLAGS
      : `'assistant'`
  // 正文列：老表叫 mes，新实体叫 content，两边各自判断
  const contentSource = sourceColumns.includes('content') ? 'content' : 'mes'
  const contentTarget = targetColumns.includes('content') ? 'content' : 'mes'

  db.exec(`
    INSERT OR IGNORE INTO chat_history (id, session_id, name, role, ${contentTarget}, extra, created_at)
    SELECT id, session_id, name, ${roleExpr}, ${contentSource}, extra, created_at FROM chat_message
  `)
}

/**
 * chat_message → chat_history：表名改成「聊天历史」，身份从 is_user / is_system
 * 两个布尔位换成单个 role 字符串，正文列 mes 改名 content。
 */
function migrateChatMessageToChatHistory(db: Database.Database) {
  const messageColumns = readColumns(db, 'chat_message')
  if (messageColumns.length) {
    if (!readColumns(db, 'chat_history').length) {
      // 常规路径：老表原地改名，数据一行不动
      db.exec('ALTER TABLE chat_message RENAME TO chat_history')
    } else {
      // synchronize 抢跑建过新表：先把老数据并过去，再丢掉老表
      mergeLegacyMessages(db, messageColumns)
      db.exec('DROP TABLE chat_message')
    }
  }

  let columns = readColumns(db, 'chat_history')
  if (!columns.length) return

  // 改名过来的老表没有 role 列，先补上再回填（NOT NULL 必须带默认值）
  if (!columns.includes('role')) {
    db.exec(`ALTER TABLE chat_history ADD COLUMN role varchar NOT NULL DEFAULT 'assistant'`)
    columns = readColumns(db, 'chat_history')
  }

  if (columns.includes('is_user') || columns.includes('is_system')) {
    db.exec(`UPDATE chat_history SET role = ${ROLE_FROM_FLAGS}`)
    for (const legacy of ['is_user', 'is_system']) {
      if (columns.includes(legacy)) db.exec(`ALTER TABLE chat_history DROP COLUMN ${legacy}`)
    }
  }

  // 正文列改名：mes → content
  columns = readColumns(db, 'chat_history')
  if (columns.includes('mes') && !columns.includes('content')) {
    db.exec('ALTER TABLE chat_history RENAME COLUMN mes TO content')
  }
}

/**
 * 执行所有启动期列迁移
 *
 * 数据库文件不存在则直接跳过（首次启动交给 synchronize 建表）。
 * 迁移失败只告警不中断启动——synchronize 仍会按实体结构把表对齐，
 * 代价是那几列老数据丢失，但不至于让应用起不来。
 */
export function migrateLegacyColumns() {
  if (!existsSync(env.dbPath)) return

  const db = new Database(env.dbPath)
  try {
    migrateChatSessionCharacterCard(db)
    migrateChatMessageToChatHistory(db)
  } catch (err) {
    console.warn('[migrate] 启动期列迁移失败，跳过：', err)
  } finally {
    db.close()
  }
}
