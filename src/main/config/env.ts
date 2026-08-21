// 集中管理 Electron 主进程的环境变量与目录配置

import { app } from 'electron'
import { join } from 'node:path'

/** 是否为开发模式（vite-plugin-electron 在 dev 时注入 VITE_DEV_SERVER_URL） */
const isDev = !!process.env.VITE_DEV_SERVER_URL

/** Vite 开发服务器地址（仅开发模式存在） */
const devServerUrl = process.env.VITE_DEV_SERVER_URL

/** 应用根目录（开发时为项目根，打包后为应用安装目录） */
const rootDir = join(import.meta.dirname, '../')

/** Electron 主进程构建产物目录（dist-electron） */
const electronRootDir = join(rootDir, 'dist-electron')

/** Vue 渲染进程构建产物目录（dist，即 vite build 输出） */
const vueRootDir = join(rootDir, 'dist')

/** 公用 */
const publicDir = join(rootDir, 'public')

/** 用户数据目录（存放数据库等用户数据，开发/打包自动指向正确位置） */
const userDataDir = app.getPath('userData')

/** SQLite 数据库文件完整路径 */
const dbPath = join(userDataDir, 'notes.db')

/** 集中导出的环境变量与目录配置 */
export const env = {
  /** 是否为开发模式 */
  isDev,

  /** Vite 开发服务器地址（仅开发模式存在） */
  devServerUrl,

  /** 应用根目录 */
  rootDir,

  /** Electron 主进程构建产物目录（dist-electron） */
  electronRootDir,

  /** Vue 渲染进程构建产物目录（dist，即 vite build 输出） */
  vueRootDir,

  /** 渲染进程加载入口（开发：dev server；生产：打包后的 index.html） */
  publicDir,

  /** 用户数据目录 */
  userDataDir,

  /** SQLite 数据库文件完整路径 */
  dbPath,
}
