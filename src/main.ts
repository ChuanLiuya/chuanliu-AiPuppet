import { createApp } from 'vue'
import { createPinia } from 'pinia'

// Naive UI 推荐字体（Lato 为界面字体，FiraCode 为等宽字体）
import 'vfonts/Lato.css'
import 'vfonts/FiraCode.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
