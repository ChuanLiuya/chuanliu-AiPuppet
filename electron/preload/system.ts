// 系统环境信息：由 preload 直接读取，不经过 IPC，属于静态快照
export const systemInfo = {
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
}
