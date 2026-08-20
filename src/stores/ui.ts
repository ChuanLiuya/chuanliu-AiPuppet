import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 全局 UI 状态
 *
 * 沉浸模式：隐藏侧边导航、会话列表、顶部角色栏等所有界面元素，
 * 只保留聊天消息流与输入框，用于沉浸式角色扮演对话。
 */
export const useUiStore = defineStore('ui', () => {


  /** ================  沉浸模式 =========================== */


  /** 是否处于沉浸模式 */
  const immersive = ref(false)
  /** 切换沉浸模式 */
  function toggleImmersive() {
    immersive.value = !immersive.value
  }
  /** 退出沉浸模式 */
  function exitImmersive() {
    immersive.value = false
  }



  /** =========== ui状态 ========================== */


  const isSidebarCollapsed = ref<boolean>(false)
  /**
   * 切换折叠栏状态
   */
  function toggleSidebarCollapsed(_e: boolean) {
    // console.log(`切换折叠栏状态到 ${e? '折叠' : '展开'} 状态`)
    isSidebarCollapsed.value = ! isSidebarCollapsed.value
  }








  /** =========== 主题（明暗模式） ========================== */


  /** 是否深色模式（默认深色，读取本地持久化） */
  const isDark = ref(localStorage.getItem('app-theme') !== 'light')
  /** 切换明暗主题并持久化到 localStorage */
  function toggleTheme() {
    isDark.value = !isDark.value
    localStorage.setItem('app-theme', isDark.value ? 'dark' : 'light')
  }


  return {
    immersive, toggleImmersive, exitImmersive,
    isSidebarCollapsed, toggleSidebarCollapsed,
    isDark, toggleTheme,
  }
})
