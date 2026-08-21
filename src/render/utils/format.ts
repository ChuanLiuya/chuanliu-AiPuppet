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
