// 集中管理 Electron 主进程的环境变量与目录配置

import { app } from 'electron'
import { join } from 'node:path'

/** 是否为开发模式（vite-plugin-electron 在 dev 时注入 VITE_DEV_SERVER_URL） */
const isDev = !!process.env.VITE_DEV_SERVER_URL

/** Vite 开发服务器地址（仅开发模式存在） */
const devServerUrl = process.env.VITE_DEV_SERVER_URL

/** 应用根目录（开发时为项目根；打包后为 app.asar 内部，只读） */
const rootDir = join(import.meta.dirname, '../')

/** Electron 主进程构建产物目录（dist-electron） */
const electronRootDir = join(rootDir, 'dist-electron')

/** Vue 渲染进程构建产物目录（dist，即 vite build 输出） */
const vueRootDir = join(rootDir, 'dist')

/** 公用 */
const publicDir = join(rootDir, 'public')

/** 用户数据目录（仅打包后使用；开发环境的数据放在项目根目录） */
const userDataDir = app.getPath('userData')

/**
 * SQLite 数据库文件完整路径
 * - 开发：项目根目录下的 notes.db
 * - 生产：系统用户数据目录（%APPDATA%/<appName>/notes.db）
 */
const dbPath = isDev ? join(rootDir, 'notes.db') : join(userDataDir, 'notes.db')

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
