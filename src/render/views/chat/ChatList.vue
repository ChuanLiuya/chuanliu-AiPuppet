<script setup lang="ts">
// 会话列表页：展示所有会话（附带最后一条消息预览），点击进入具体聊天
import type { ChatSessionListItem } from '@shared/types/chat'
import { formatRelativeTime } from '@/utils/format'
import { debugLog } from '@/composables/useDebugLog'
import { AddOutline } from '@vicons/ionicons5'

const router = useRouter()
const message = useMessage()

/** 会话列表（含最后一条消息摘要） */
const sessions = ref<ChatSessionListItem[]>([])
/** 是否正在加载列表 */
const loading = ref(false)
/** 是否显示「新建会话」弹窗 */
const showCreate = ref(false)
/** 是否正在创建 */
const creating = ref(false)

/** 新建会话表单 */
const createForm = reactive({
  character_name: '',
  avatar: '🤖',
  title: '',
})

/** 加载会话列表 */
async function loadSessions() {
  loading.value = true
  const res = await window.electronAPI.chatSession.listWithPreview()
  debugLog('chatSession.listWithPreview', res)
  loading.value = false
  if (res.success) sessions.value = res.result
  else message.error(res.message)
}

/** 打开新建弹窗并重置表单 */
function openCreate() {
  createForm.character_name = ''
  createForm.avatar = '🤖'
  createForm.title = ''
  showCreate.value = true
}

/** 确认新建会话，成功后直接进入该会话 */
async function confirmCreate() {
  const name = createForm.character_name.trim()
  if (!name) {
    message.warning('请输入角色名')
    return
  }

  creating.value = true
  const res = await window.electronAPI.chatSession.create({
    character_name: name,
    avatar: createForm.avatar.trim() || '🤖',
    title: createForm.title.trim() || name,
  })
  debugLog('chatSession.create', res)
  creating.value = false

  if (!res.success) {
    message.error(res.message)
    return
  }

  showCreate.value = false
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
      <div v-if="loading" class="list-loading">
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
          @click="router.push(`/chat/${s.id}`)"
        >
          <div class="session-body">
            <div class="session-avatar">{{ s.avatar || '🤖' }}</div>
            <div class="session-info">
              <div class="session-top">
                <span class="session-title">{{ s.title || s.character_name }}</span>
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

    <!-- 新建会话弹窗：角色表落地前先在这里手填角色信息 -->
    <n-modal v-model:show="showCreate" preset="card" title="新建会话" class="create-modal">
      <n-form label-placement="left" label-width="64">
        <n-form-item label="角色名">
          <n-input v-model:value="createForm.character_name" placeholder="例如：苏妲己" />
        </n-form-item>
        <n-form-item label="头像">
          <n-input v-model:value="createForm.avatar" placeholder="一个 emoji，例如 🦊" />
        </n-form-item>
        <n-form-item label="标题">
          <n-input v-model:value="createForm.title" placeholder="留空则用角色名" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showCreate = false">取消</n-button>
          <n-button type="primary" :loading="creating" @click="confirmCreate">创建</n-button>
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
  padding: 0 24px;
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

.session-avatar {
  font-size: 34px;
  line-height: 1;
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
