<script setup lang="ts">
// 会话列表页：展示所有会话（附带最后一条消息预览），点击进入具体聊天
import type { ChatSessionListItem } from '@shared/types/chat'
import { resolveCharacterDisplayName } from '@shared/utils/character_card'
import { formatRelativeTime } from '@/utils/format'
import { debugLog } from '@/composables/useDebugLog'
import { useChatStore } from '@/stores/chat'
import { AddOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()
const chatStore = useChatStore()

/** 会话列表（含最后一条消息摘要） */
const sessions = ref<ChatSessionListItem[]>([])
/** 是否正在加载列表 */
const isListLoading = ref(false)
/** 是否显示「新建会话」弹窗 */
const isShowCreate = ref(false)
/** 是否正在创建 */
const isCreatingSession = ref(false)

/** 新建会话表单 */
const createForm = reactive({
  character_card: '',
  title: '',
})

/** 加载会话列表 */
async function loadSessions() {
  isListLoading.value = true
  const res = await window.electronAPI.chatSession.listWithPreview()
  debugLog('chatSession.listWithPreview', res)
  isListLoading.value = false
  if (res.success) sessions.value = res.result
  else message.error(res.message)
}

/**
 * 进入会话
 *
 * 列表已经拿到整条会话记录，交给 store 带过去，聊天页就不用再查一次会话信息；
 * 历史消息仍由聊天页在挂载时补拉（列表只有最后一条摘要）。
 */
function openSession(s: ChatSessionListItem) {
  chatStore.setCurrentSession(s)
  router.push(`/chat/${s.id}`)
}

/** 打开新建弹窗并重置表单 */
function openCreate() {
  createForm.character_card = ''
  createForm.title = ''
  isShowCreate.value = true
}

/** 确认新建会话，成功后直接进入该会话 */
async function confirmCreate() {
  const card = createForm.character_card.trim()
  if (!card) {
    message.warning('请填写角色名或角色卡地址')
    return
  }

  isCreatingSession.value = true
  const res = await window.electronAPI.chatSession.create({
    character_card: card,
    title: createForm.title.trim() || resolveCharacterDisplayName(card),
  })
  debugLog('chatSession.create', res)
  isCreatingSession.value = false

  if (!res.success) {
    message.error(res.message)
    return
  }

  isShowCreate.value = false
  router.push(`/chat/${res.result}`)
}

/** 删除会话（连同其下所有消息） */
async function removeSession(id: number) {
  const res = await window.electronAPI.chatSession.remove(id)
  debugLog('chatSession.remove', res)
  if (!res.success) {
    message.error(res.message)
    return
  }
  message.success(res.message)
  // 删掉的正是当前会话：顺手清掉 store 里的临时状态
  if (chatStore.sessionId === id) chatStore.clear()
  await loadSessions()
}

onMounted(loadSessions)
</script>

<template>
  <n-layout class="page">
    <n-layout-header bordered class="page-header">
      <n-h2 class="page-title">会话列表</n-h2>
      <n-button type="primary" @click="openCreate">
        <template #icon>
          <NIcon :component="AddOutline" />
        </template>
        新建会话
      </n-button>
    </n-layout-header>

    <n-layout-content class="session-wrap">
      <div v-if="isListLoading" class="list-loading">
        <n-spin size="large" />
      </div>

      <n-empty v-else-if="!sessions.length" description="还没有会话，先新建一个吧" class="empty">
        <template #extra>
          <n-button size="small" @click="openCreate">新建会话</n-button>
        </template>
      </n-empty>

      <n-space v-else vertical :size="12">
        <n-card
          v-for="s in sessions"
          :key="s.id"
          hoverable
          class="session-item"
          @click="openSession(s)"
        >
          <div class="session-body">
            <div class="session-info">
              <div class="session-top">
                <span class="session-title">
                  {{ s.title || resolveCharacterDisplayName(s.character_card) }}
                </span>
                <span class="session-time">{{ formatRelativeTime(s.updated_at) }}</span>
              </div>
              <div class="session-preview">{{ s.last_message || '暂无消息' }}</div>
            </div>
            <n-button size="tiny" quaternary type="error" @click.stop="removeSession(s.id)">
              删除
            </n-button>
          </div>
        </n-card>
      </n-space>
    </n-layout-content>

    <!-- 新建会话弹窗：角色卡功能落地前先在这里手填角色名 -->
    <n-modal v-model:show="isShowCreate" preset="card" title="新建会话" class="create-modal">
      <n-form label-placement="left" label-width="64">
        <n-form-item label="角色">
          <n-input
            v-model:value="createForm.character_card"
            placeholder="角色名，例如：苏妲己（将来也可填角色卡地址）"
          />
        </n-form-item>
        <n-form-item label="标题">
          <n-input v-model:value="createForm.title" placeholder="留空则用角色名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="isShowCreate = false">取消</n-button>
          <n-button type="primary" :loading="isCreatingSession" @click="confirmCreate">创建</n-button>
        </n-space>
      </template>
    </n-modal>
  </n-layout>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 24px;
}

.page-title {
  margin: 0;
  font-size: 18px;
}

.session-wrap {
  flex: 1;
  overflow: auto;
  padding: 20px 24px;
}

.list-loading {
  display: flex;
  justify-content: center;
  padding: 48px 0;
}

.empty {
  padding: 48px 0;
}

.session-item {
  cursor: pointer;
}

.session-body {
  display: flex;
  align-items: center;
  gap: 16px;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-top {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.session-title {
  font-size: 15px;
  font-weight: 600;
}

.session-time {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 12px;
  color: #bbb;
}

.session-preview {
  margin-top: 6px;
  font-size: 13px;
  color: #999;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.create-modal {
  width: 420px;
  max-width: 92vw;
}
</style>
