/// <reference types="vite/client" />

// preload 通过 contextBridge 暴露到 window 上的 API 类型声明
// 数据契约来自 shared/types（shared/types/cat.ts），入口形状（electronAPI.cat）从 preload 的 catApi 推导（typeof）
// 这样改 preload 方法签名时 window 类型自动同步，无需再手写方法列表
import type { CatApi } from './electron/preload/apis/cat'

declare global {
  interface Window {
    /** 业务功能 API（走 IPC 调用主进程） */
    electronAPI: {
      cat: CatApi
    }
    /** 系统环境信息（preload 直接读取，不经过 IPC） */
    systemInfo: {
      platform: string
      versions: {
        electron: string
        chrome: string
        node: string
      }
    }
  }
}

export { }
