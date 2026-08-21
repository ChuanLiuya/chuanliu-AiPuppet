<script setup lang="ts">
// 会话列表页：点击「聊天」选项卡后展示
// 每个列表项：左侧角色卡头像 + 右侧（标题 / 最近一次聊天内容）

// 占位会话数据：仅用于查看界面效果，后续替换为真实数据
const sessions = [
  { id: 1, name: '苏妲己', avatar: '🦊', title: '与苏妲己的对话', lastMessage: '你终于来了~', time: '12:30' },
  { id: 2, name: '林墨', avatar: '🥷', title: '刺客的委托', lastMessage: '任务完成，等你指示', time: '昨天' },
  { id: 3, name: 'Alice', avatar: '👩‍🚀', title: '星际漫谈', lastMessage: '让我们聊聊宇宙吧', time: '周一' },
]

const router = useRouter()
</script>

<template>
  <n-layout class="page">
    <n-layout-header bordered class="page-header">
      <n-h2 class="page-title">会话列表</n-h2>
    </n-layout-header>

    <n-layout-content class="session-wrap">
      <n-space vertical :size="12">
        <n-card
          v-for="s in sessions"
          :key="s.id"
          hoverable
          class="session-item"
          @click="router.push('/chattest')"
        >
          <div class="session-body">
            <div class="session-avatar">{{ s.avatar }}</div>
            <div class="session-info">
              <div class="session-top">
                <span class="session-title">{{ s.title }}</span>
                <span class="session-time">{{ s.time }}</span>
              </div>
              <div class="session-preview">{{ s.lastMessage }}</div>
            </div>
          </div>
        </n-card>
      </n-space>
    </n-layout-content>
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
</style>
