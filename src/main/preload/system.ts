// 系统环境信息：由 preload 直接读取，不经过 IPC，属于静态快照
export const systemInfo = {
  platform: process.platform,
  /** 是否输出调试信息（开发模式开启，生产模式关闭） */
  debug: !!process.env.VITE_DEV_SERVER_URL,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
}
