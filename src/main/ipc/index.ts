// IPC 处理器汇总注册
import { CatController } from '@electron/ipc/apis/cat'
import { ApiConfigController } from '@electron/ipc/apis/apiConfig'
import { ApiKeyController } from '@electron/ipc/apis/apiKey'
import { AppSettingController } from '@electron/ipc/apis/appSetting'
import { ChatController } from './apis/chat'
import { ChatSessionController } from './apis/chatSession'
import { ChatHistoryController } from './apis/chatHistory'

export function registerIpc() {

  // 小猫模块
  new CatController().register()

  // API 配置模块
  new ApiConfigController().register()

  // API 密钥模块
  new ApiKeyController().register()

  // 应用设置模块
  new AppSettingController().register()

  //
  new ChatController().register()

  // 会话（历史记录容器）模块
  new ChatSessionController().register()

  // 聊天历史（会话下的消息记录）模块
  new ChatHistoryController().register()
}
