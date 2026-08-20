// IPC 处理器汇总注册
import { CatController } from '@electron/ipc/apis/cat'

export function registerIpc() {

  // 小猫模块
  new CatController().register()
}
