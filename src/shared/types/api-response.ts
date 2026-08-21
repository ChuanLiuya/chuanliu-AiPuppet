/**
 * 业务状态码枚举
 *
 * - `0`  → 成功
 * - `-1` → 失败（通用错误）
 * - 其他正数可按业务模块自行扩展（如 1xx 数据校验、2xx 权限等）
 */
export enum ApiCode {
  /** 成功 */
  SUCCESS = 0,
  /** 失败（通用错误） */
  FAIL = -1,
}

/**
 * 统一响应结构
 *
 * 所有后端（IPC Controller）返回给前端的对象都遵循此结构：
 * - `success`：是否成功，前端直接用此字段判断
 * - `code`：业务状态码，0 表示成功，非 0 表示失败
 * - `result`：实际的数据载荷（泛型 T）
 * - `message`：供前端弹窗展示的提示信息（成功/失败均会携带）
 *
 * 前端消费时先判断 `success` 是否为 true，再从 `result` 取业务数据，
 * 用 `message` 弹 message 通知。
 */
export interface ApiResponse<T = unknown> {
  /** 是否成功 */
  success: boolean
  /** 业务状态码，0 = 成功，非 0 = 失败 */
  code: ApiCode
  /** 实际返回的数据 */
  result: T
  /** 供前端弹窗使用的提示信息 */
  message: string
}

/**
 * 快速构造成功响应
 * @param result 数据载荷
 * @param message 提示信息（默认空字符串，表示无需弹窗）
 */
export function success<T>(result: T, message = ''): ApiResponse<T> {
  return { success: true, code: ApiCode.SUCCESS, result, message }
}

/**
 * 快速构造失败响应
 * @param message 错误提示信息（供前端弹窗展示）
 * @param result 可选的附加数据，默认为 null
 */
export function error<T = null>(message: string, result: T | null = null): ApiResponse<T> {
  return { success: false, code: ApiCode.FAIL, result: result as T, message }
}
