// IPC 通道名集中定义：主进程 ipcMain.handle 与 preload ipcRenderer.invoke 共用同一份
// 命名规范：api:<模块>:<动作>。统一前缀避免与未来其它通道冲突；
// 新增模块只需在此加一项，两端的处理器/调用方自动同步
export const IpcChannels = {
  cat: {
    /** 查找所有小猫 */
    findAll: 'api:cat:findAll',
    /** 通过id查找单个小猫 */
    findOneById: 'api:cat:findOneById',
    /** 创建一个小猫 */
    create: 'api:cat:create',
    /** 修改一个小猫 */
    update: 'api:cat:update',
    /** 删除一个小猫 */
    remove: 'api:cat:remove',
  },
} as const
