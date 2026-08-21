// preload 入口：通过 contextBridge 将 API 暴露到渲染进程
import { contextBridge } from 'electron'
import { api } from '@electron/preload/api'
import { systemInfo } from '@electron/preload/system'

// 业务功能
contextBridge.exposeInMainWorld('electronAPI', api)
// 系统环境信息
contextBridge.exposeInMainWorld('systemInfo', systemInfo)
