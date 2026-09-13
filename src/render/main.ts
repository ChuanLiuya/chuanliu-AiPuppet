import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Naive UI 推荐字体（Lato 为界面字体，FiraCode 为等宽字体）
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import App from './App.vue'
import router from './router'
import { debugLog } from '@/composables/useDebugLog'

// 订阅主进程的第三方api发送情况
window.electronAPI?.debug.onLog(({ title, payload, level }) =>
  debugLog('main ' + title, payload, level),
)

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
