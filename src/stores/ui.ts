import { ref } from 'vue'
import { defineStore } from 'pinia'

/**
 * 全局 UI 状态
 *
 * 沉浸模式：隐藏侧边导航、会话列表、顶部角色栏等所有界面元素，
 * 只保留聊天消息流与输入框，用于沉浸式角色扮演对话。
 */
export const useUiStore = defineStore('ui', () => {
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

  return { immersive, toggleImmersive, exitImmersive }
})
