import { createRouter, createWebHashHistory } from 'vue-router'
import ChatList from '../views/chat/ChatList.vue'
import ChatView from '../views/chat/ChatView.vue'
import ChatTestView from '../views/chat/ChatTestView.vue'
import CharacterLibraryView from '../views/characters/CharacterLibraryView.vue'
import LorebookView from '../views/lorebook/LorebookView.vue'
import SettingsView from '../views/settings/SettingsView.vue'
import ApiConnectionView from '../views/api/ApiConnectionView.vue'
import ApiEditView from '../views/api/ApiEditView.vue'
import ApiKeyView from '../views/api/ApiKeyView.vue'

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
      component: ChatList,
    },
    {
      path: '/chat/:id',
      name: 'chat-detail',
      component: ChatView,
    },
    {
      path: '/chattest',
      name: 'chattest',
      component: ChatTestView,
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
    {
      path: '/api/edit',
      name: 'api-edit',
      component: ApiEditView,
    },
    {
      path: '/api/keys',
      name: 'api-keys',
      component: ApiKeyView,
    },
  ],
})

export default router
