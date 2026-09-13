/**
 * 通用格式化工具函数
 */

/**
 * 格式化时间为 YYYY-MM-DD HH:mm
 *
 * @param value 日期对象、日期字符串或时间戳
 * @returns 格式化后的字符串，空值返回 '-'
 */
export function formatTime(value: Date | string | number): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/**
 * 密钥掩码展示（保留头尾 4 位，中间打码）
 *
 * @param key 原始密钥
 * @returns 掩码后的密钥字符串
 */
export function maskKey(key: string): string {
  if (!key) return ''
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

/** 星期缩写，索引对应 Date.getDay() */
const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'] as const

/**
 * 会话列表用的相对时间
 *
 * 今天 → `HH:mm`；昨天 → `昨天`；一周内 → `周X`；更早 → `YYYY-MM-DD`。
 *
 * @param value 日期对象、日期字符串或时间戳
 * @returns 相对时间字符串，空值返回 '-'
 */
export function formatRelativeTime(value: Date | string | number): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')

  // 只比较「日期」部分，避免把今天凌晨算成昨天
  const startOfDay = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime()
  const diffDays = Math.round((startOfDay(new Date()) - startOfDay(d)) / 86400000)

  if (diffDays <= 0) return `${pad(d.getHours())}:${pad(d.getMinutes())}`
  if (diffDays === 1) return '昨天'
  if (diffDays < 7) return `周${WEEKDAYS[d.getDay()]}`
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}
