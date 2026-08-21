// 主进程入口：应用生命周期 + 启动流程
import { app, BrowserWindow } from 'electron'
import { registerIpc } from '@electron/ipc'
import { dataSource, initializeDatabase } from '@electron/database'
import { createWindow } from '@electron/main/window'

app.whenReady().then(async () => {
  // 初始化数据库连接（TypeORM）
  await initializeDatabase()
  // 注册所有 IPC 处理器
  registerIpc()
  // 创建主窗口
  createWindow()

  // macOS：点击 Dock 图标时若无窗口则重新创建
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('will-quit', () => {
  if (dataSource.isInitialized) dataSource.destroy()
})

// Windows / Linux：所有窗口关闭即退出应用
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
