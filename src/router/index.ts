import { createRouter, createWebHashHistory } from 'vue-router'
import ChatView from '../views/ChatView.vue'
import CharacterLibraryView from '../views/CharacterLibraryView.vue'
import LorebookView from '../views/LorebookView.vue'
import SettingsView from '../views/SettingsView.vue'
import ApiConnectionView from '../views/ApiConnectionView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      redirect: '/chat',
    },
    {
      path: '/chat',
      name: 'chat',
      component: ChatView,
    },
    {
      path: '/characters',
      name: 'characters',
      component: CharacterLibraryView,
    },
    {
      path: '/lorebook',
      name: 'lorebook',
      component: LorebookView,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
    },
    {
      path: '/api',
      name: 'api',
      component: ApiConnectionView,
    },
  ],
})

export default router
