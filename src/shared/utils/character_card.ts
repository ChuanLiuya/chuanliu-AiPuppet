/**
 * 角色卡字段的兼容解析工具
 *
 * `chat_session.character_card` 是「两态字段」：
 * - 角色卡功能落地前：存纯文本角色名（如「苏妲己」）
 * - 角色卡功能落地后：存角色卡地址（如 `res://characters/sudaji.json`）
 *
 * 两种形态都是字符串、没有类型标记，所以判定与取展示名的逻辑统一收敛在这里，
 * 主进程与渲染进程都从这里引用，不要在业务代码里自己写字符串切分。
 */

/** 带协议头的角色卡地址前缀 */
const CARD_REF_PREFIX = /^(res|file|https?):\/\//i

/** 无协议头时的兜底：常见的角色卡/图片扩展名 */
const CARD_REF_EXT = /\.(json|png|webp|jpe?g|charx|ya?ml)$/i

/**
 * 判断字段值是否为「角色卡地址」（而非纯文本角色名）
 *
 * 纯文本角色名不会带协议头、路径分隔符和扩展名，据此区分两种形态。
 *
 * @param value 字段原始值
 */
export function isCharacterCardRef(value: string | null | undefined): boolean {
  const raw = value?.trim() ?? ''
  if (!raw) return false
  if (CARD_REF_PREFIX.test(raw)) return true
  if (CARD_REF_EXT.test(raw)) return true
  return raw.includes('/') || raw.includes('\\')
}

/**
 * 取角色卡的展示名
 *
 * - 纯文本角色名：原样返回
 * - 角色卡地址：取文件名（去目录、去扩展名）作为展示名，
 *   如 `res://characters/苏妲己.json` → `苏妲己`
 *
 * @param value    字段原始值
 * @param fallback 值为空时的兜底文案，默认「角色」
 */
export function resolveCharacterDisplayName(
  value: string | null | undefined,
  fallback = '角色',
): string {
  const raw = value?.trim() ?? ''
  if (!raw) return fallback
  if (!isCharacterCardRef(raw)) return raw

  // 取最后一段路径，再剥掉扩展名
  const base = raw.split(/[\\/]/).pop() ?? ''
  const name = base.replace(/\.[^.]+$/, '').trim()
  return name || fallback
}
