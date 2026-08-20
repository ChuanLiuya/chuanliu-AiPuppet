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
  apiConfig: {
    /** 查找所有配置项 */
    findAll: 'api:apiConfig:findAll',
    /** 通过id查找单个配置项 */
    findOneById: 'api:apiConfig:findOneById',
    /** 新建配置项 */
    create: 'api:apiConfig:create',
    /** 修改配置项 */
    update: 'api:apiConfig:update',
    /** 删除配置项 */
    remove: 'api:apiConfig:remove',
  },
} as const
