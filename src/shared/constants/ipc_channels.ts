/**
 * IPC 通道名集中定义：主进程 ipcMain.handle 与 preload ipcRenderer.invoke 共用同一份
 *
 * 命名规范：api:<模块>:<动作>。统一前缀避免与未来其它通道冲突；
 * 新增模块只需在此加一项，两端的处理器/调用方自动同步
 */
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
    /** 获取模型列表 */
    findModels: 'api:apiConfig:findModels',
    /** 测试连接是否正常 */
    testConnection: 'api:apiConfig:testConnection',
  },
  apiKey: {
    /** 查找所有密钥 */
    findAll: 'api:apiKey:findAll',
    /** 通过id查找单个密钥 */
    findOneById: 'api:apiKey:findOneById',
    /** 新建密钥 */
    create: 'api:apiKey:create',
    /** 修改密钥 */
    update: 'api:apiKey:update',
    /** 删除密钥 */
    remove: 'api:apiKey:remove',
  },
  appSetting: {
    /** 获取单个设置项 */
    get: 'api:appSetting:get',
    /** 设置单个设置项 */
    set: 'api:appSetting:set',
    /** 删除单个设置项 */
    remove: 'api:appSetting:remove',
  },
  chat: {
    /** 发送一条消息（自动读写历史记录） */
    send: 'api:chat:send',
  },
  chatSession: {
    /** 查找所有会话 */
    findAll: 'api:chatSession:findAll',
    /** 查找所有会话（附带最后一条消息摘要，列表页用） */
    listWithPreview: 'api:chatSession:listWithPreview',
    /** 通过id查找单个会话 */
    findOneById: 'api:chatSession:findOneById',
    /** 新建会话 */
    create: 'api:chatSession:create',
    /** 修改会话 */
    update: 'api:chatSession:update',
    /** 删除会话（级联删除其下所有消息） */
    remove: 'api:chatSession:remove',
  },
  chatHistory: {
    /** 查找某个会话下的全部历史 */
    findAll: 'api:chatHistory:findAll',
    /** 通过id查找单条历史 */
    findOneById: 'api:chatHistory:findOneById',
    /** 新增一条历史 */
    create: 'api:chatHistory:create',
    /** 修改一条历史 */
    update: 'api:chatHistory:update',
    /** 删除一条历史 */
    remove: 'api:chatHistory:remove',
    /** 清空某个会话下的全部历史 */
    clear: 'api:chatHistory:clear',
  },
  debug: {
    /** 主进程 → 渲染进程：推送调试日志（推送通道，用 on 订阅而非 invoke） */
    log: 'api:debug:log',
  },
} as const
