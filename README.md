# electron-vue3-starter

基于 **Electron + Vue 3** 的桌面应用起步模板（Starter）。

当前仓库已包含完整的 Vue 3 前端工程化配置（Vite + TypeScript + Pinia + Vue Router），
Electron 相关集成（主进程、preload、打包）正在规划中，详见下方 [Electron 集成计划](#electron-集成计划)。

## 技术栈

| 类别     | 技术                                                                                  | 说明                        |
| -------- | ------------------------------------------------------------------------------------- | --------------------------- |
| UI 框架  | [Vue 3](https://cn.vuejs.org/)                                                        | `<script setup>` 组合式 API |
| 构建工具 | [Vite](https://cn.vitejs.dev/)                                                        | 极快的冷启动与 HMR          |
| 语言     | [TypeScript](https://www.typescriptlang.org/)                                         | 全量类型检查                |
| 状态管理 | [Pinia](https://pinia.vuejs.org/zh/)                                                  | 轻量、类型安全的 store      |
| 路由     | [Vue Router](https://router.vuejs.org/zh/)                                            | 单页应用路由                |
| 代码规范 | [ESLint](https://eslint.org/) + [oxlint](https://oxc.rs/docs/guide/usage/linter.html) | 双引擎 lint                 |
| 格式化   | [Prettier](https://prettier.io/)                                                      | 统一代码风格                |

## 目录结构

```
├── public/               # 静态资源（不经过构建处理）
├── src/
│   ├── assets/           # 全局样式与静态资源
│   ├── components/       # 通用组件
│   │   └── icons/        # SVG 图标组件
│   ├── router/           # Vue Router 配置
│   ├── stores/           # Pinia 状态仓库
│   ├── views/            # 页面视图
│   ├── App.vue           # 根组件
│   └── main.ts           # 应用入口
├── index.html            # HTML 入口
├── vite.config.ts        # Vite 配置（含 @ -> src 别名）
├── tsconfig*.json        # TypeScript 配置
├── eslint.config.ts      # ESLint 配置
├── .oxlintrc.json        # oxlint 配置
└── .prettierrc.json      # Prettier 配置
```

## 环境要求

- **Node.js**：`^22.18.0` 或 `>=24.12.0`（见 `package.json` 中 `engines` 字段）
- **包管理器**：npm（建议使用 v10+）
- **C++ 编译器（仅打包需要，Windows）**：项目使用原生模块 `better-sqlite3`，`npm run build` 打包时会按 Electron 的 ABI 重新编译它。Windows 上需安装 **Visual Studio Build Tools 2022**，并在安装时勾选「使用 C++ 的桌面开发」工作负载（含 MSVC 编译器与 Windows SDK）。
  - 下载：[Visual Studio Build Tools 2022](https://visualstudio.microsoft.com/zh-hans/downloads/#build-tools-for-visual-studio-2022)
  - 说明：只有 `npm run build` 打包时需要；开发模式（`npm run dev`）不受影响，暂不打包可先不装
  - 装完验证：在终端运行 `npx node-gyp --version`，能输出版本号即表示编译器可用

## 快速开始

```sh
# 1. 安装依赖
npm install

# 2. 启动开发服务器（支持热更新）
npm run dev

# 3. 构建生产版本（先类型检查，再编译打包）
npm run build

# 4. 本地预览构建产物
npm run preview
```

## 常用脚本

| 命令                 | 作用                                  |
| -------------------- | ------------------------------------- |
| `npm run dev`        | 启动 Vite 开发服务器                  |
| `npm run build`      | 类型检查 + 生产构建                   |
| `npm run build-only` | 仅生产构建（跳过类型检查）            |
| `npm run preview`    | 预览构建产物                          |
| `npm run type-check` | 运行 `vue-tsc` 类型检查               |
| `npm run lint`       | 依次运行 oxlint 与 ESLint（自动修复） |
| `npm run format`     | 使用 Prettier 格式化 `src/` 目录      |

## 路径别名

`@` 指向 `src/` 目录，例如：

```ts
import { useCounterStore } from '@/stores/counter'
```

## 推荐 IDE 配置

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar)（Volar）扩展
- 浏览器端开发时可安装 [Vue.js devtools](https://devtools.vuejs.org/) 便于调试

## Electron 集成计划

> 目前仅包含前端部分，Electron 相关能力尚未接入，以下是规划中的内容：

- [ ] 集成 `electron` + `electron-builder`（或 `electron-vite`）依赖
- [ ] 增加 Electron 主进程与 preload 脚本（`electron/main`、`electron/preload`）
- [ ] 配置开发模式下的 Electron 与 Vite 热更新协同
- [ ] 配置跨平台打包（Windows / macOS / Linux）产物输出

集成完成后，本 README 会同步更新对应的启动与打包说明。

## 相关链接

- [Vue 3 官方文档](https://cn.vuejs.org/)
- [Vite 配置参考](https://cn.vitejs.dev/config/)
- [Pinia 文档](https://pinia.vuejs.org/zh/)
- [Vue Router 文档](https://router.vuejs.org/zh/)
- [Electron 官方文档](https://www.electronjs.org/zh/)
