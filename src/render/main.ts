import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Naive UI 推荐字体（Lato 为界面字体，FiraCode 为等宽字体）
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import App from './App.vue'
import router from './router'
import { debugLog } from '@/composables/useDebugLog'

// 把主进程推送的调试日志转发到 DevTools 控制台，让两端日志统一出口
// （主进程发起的 HTTP 请求就在这里能看到真实内容）
// 用可选链：纯浏览器里没有 electronAPI，不能让它把整个应用启动流程带崩
window.electronAPI?.debug.onLog(({ title, payload }) => debugLog(title, payload))

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
