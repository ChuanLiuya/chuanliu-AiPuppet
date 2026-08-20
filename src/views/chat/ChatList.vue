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
  <div class="page">
    <header class="page-header">
      <div>
        <h2>会话</h2>
        <p>选择一个对话继续，或开始新的角色扮演</p>
      </div>
      <NButton type="primary">＋ 新建会话</NButton>
    </header>

    <div class="session-list">
      <div
        v-for="s in sessions"
        :key="s.id"
        class="session-item"
        @click="router.push(`/chat/${s.id}`)"
      >
        <div class="session-avatar">{{ s.avatar }}</div>
        <div class="session-info">
          <div class="session-top">
            <span class="session-title">{{ s.title }}</span>
            <span class="session-time">{{ s.time }}</span>
          </div>
          <div class="session-preview">{{ s.lastMessage }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.session-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.session-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  cursor: pointer;
  transition: box-shadow 0.2s, transform 0.2s;
}

.session-item:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transform: translateY(-1px);
}

.session-avatar {
  width: 56px;
  height: 56px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0f2f7;
  font-size: 30px;
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
