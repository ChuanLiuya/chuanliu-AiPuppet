
import { catApi } from '@electron/preload/apis/cat'
import { apiConfigApi } from '@electron/preload/apis/apiConfig'
import { apiKeyApi } from '@electron/preload/apis/apiKey'
import { appSettingApi } from '@electron/preload/apis/appSetting'
import { chatApi } from '@electron/preload/apis/chat'
import { chatSessionApi } from '@electron/preload/apis/chatSession'
import { chatMessageApi } from '@electron/preload/apis/chatMessage'
import { debugApi } from '@electron/preload/apis/debug'

export const api = {
  cat: catApi,
  apiConfig: apiConfigApi,
  apiKey: apiKeyApi,
  appSetting: appSettingApi,
  chat: chatApi,
  chatSession: chatSessionApi,
  chatMessage: chatMessageApi,
  debug: debugApi,
}
