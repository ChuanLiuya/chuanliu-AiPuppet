// IPC 处理器汇总注册
import { CatController } from '@electron/ipc/apis/cat'
import { ApiConfigController } from '@electron/ipc/apis/apiConfig'

export function registerIpc() {

  // 小猫模块
  new CatController().register()

  // API 配置模块
  new ApiConfigController().register()
}
