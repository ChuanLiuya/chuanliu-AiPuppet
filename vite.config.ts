import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import electron from 'vite-plugin-electron/simple'
import { esmShim, notBundle } from 'vite-plugin-electron/plugin'
// Naive UI 按需自动引入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    // 自动导入 Vue / Vue Router API（ref、computed、useRouter 等），无需手动 import
    // 生成的类型声明写入 src/auto-imports.d.ts（在 tsconfig.app.json include 范围内）
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        // Naive UI 的 API 函数（useMessage 等）无法用 NaiveUiResolver 自动导入（其只匹配组件），需在此显式声明
        {
          'naive-ui': ['useMessage', 'useDialog', 'useNotification', 'useLoadingBar'],
        },
      ],
      dts: 'src/auto-imports.d.ts',
    }),
    // 按需自动引入 Naive UI 组件（模板中直接使用 NButton 等，无需手动 import）
    // 生成的类型声明写入 src/components.d.ts（在 tsconfig.app.json include 范围内）
    Components({
      resolvers: [NaiveUiResolver()],
      dts: 'src/components.d.ts',
    }),
    electron({
      main: {
        // 主进程入口（electron/main/index.ts），构建产物输出到 dist-electron/
        entry: 'electron/main/index.ts',
        vite: {
          build: {
            // 固定输出为 main.js，保证 package.json 的 main 字段不用跟着改
            lib: {
              entry: 'electron/main/index.ts',
              formats: ['es'],
              fileName: () => 'main.js',
            },
          },
          // notBundle：外部化 better-sqlite3 等依赖，避免被内联进 ESM
          // esmShim：为用到 __dirname/__filename 的代码注入 ESM 兼容 shim
          plugins: [notBundle(), esmShim()],
        },
      },
      preload: {
        // 预加载脚本入口（electron/preload/index.ts）
        input: 'electron/preload/index.ts',
        vite: {
          build: {
            // 固定输出为 preload.mjs，保持主进程里对 preload 的引用不变
            rolldownOptions: {
              output: { entryFileNames: 'preload.mjs' },
            },
          },
        },
      },
      // 可选：若渲染进程需要使用 Node.js API，取消下面注释
      // renderer: {},
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 主进程路径别名：@electron 指向 electron/ 目录
      '@electron': fileURLToPath(new URL('./electron', import.meta.url)),
      // 前后端共享类型：@shared 指向 shared/ 目录
      '@shared': fileURLToPath(new URL('./shared', import.meta.url)),
    },
  },
})
