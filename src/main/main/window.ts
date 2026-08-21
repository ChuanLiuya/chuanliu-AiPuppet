// 主窗口的创建与管理
import { BrowserWindow, shell } from 'electron'
import { join } from 'node:path'
import { env } from '@electron/config/env'

const { isDev, devServerUrl, electronRootDir, vueRootDir, publicDir } = env

/** 创建并显示主窗口 */
export function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    title: 'Electron Vue3 Starter',
    icon: join(publicDir, 'favicon.ico'),
    webPreferences: {
      preload: join(electronRootDir, 'preload.mjs'),
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // 开发模式：加载 Vite 开发服务器（支持 HMR）
  if (isDev && devServerUrl) {
    // 仅开发环境注册 F12 快捷键，生产环境无法打开开发者工具
    mainWindow.webContents.on('before-input-event', (event, input) => {
      if (input.type === 'keyDown' && input.key === 'F12') {
        mainWindow.webContents.toggleDevTools()
        event.preventDefault()
      }
    })
    mainWindow.loadURL(devServerUrl)
    // mainWindow.webContents.openDevTools()
  } else {
    // 生产模式：加载构建产物
    mainWindow.loadFile(join(vueRootDir, 'index.html'))
  }

  // 外部链接交给系统浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}
