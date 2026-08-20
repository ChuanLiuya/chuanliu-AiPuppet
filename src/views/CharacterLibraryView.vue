<script setup lang="ts">
// 占位角色卡数据：仅用于查看界面效果，后续替换为真实数据
const characters = [
  { id: 1, name: '苏妲己', avatar: '🦊', tags: ['古风', '妖狐'], desc: '修行千年的狐妖，魅惑众生。' },
  { id: 2, name: '林墨', avatar: '🥷', tags: ['武侠', '冷峻'], desc: '代号「墨」，出手果断的刺客。' },
  { id: 3, name: 'Alice', avatar: '👩‍🚀', tags: ['科幻', '温柔'], desc: '深空探测员，向往未知宇宙。' },
  { id: 4, name: '太乙真人', avatar: '🧙', tags: ['仙侠', '顽童'], desc: '昆仑山上的老顽童道长。' },
]
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h2>角色库</h2>
        <p>管理你的 AI 角色卡片，点击卡片即可开始对话</p>
      </div>
      <div class="header-actions">
        <NButton secondary>⬆ 导入</NButton>
        <NButton type="primary">＋ 新建角色</NButton>
      </div>
    </header>

    <div class="card-grid">
      <div v-for="c in characters" :key="c.id" class="character-card">
        <div class="card-avatar">{{ c.avatar }}</div>
        <div class="card-name">{{ c.name }}</div>
        <div class="card-tags">
          <span v-for="t in c.tags" :key="t" class="tag">{{ t }}</span>
        </div>
        <div class="card-desc">{{ c.desc }}</div>
        <div class="card-actions">
          <NButton size="tiny" type="primary" secondary>开聊</NButton>
          <NButton size="tiny" secondary>编辑</NButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px;
}

.character-card {
  padding: 20px 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 8px;
  transition: box-shadow 0.2s, transform 0.2s;
}

.character-card:hover {
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.card-avatar {
  font-size: 48px;
}

.card-name {
  font-size: 16px;
  font-weight: 600;
}

.card-tags {
  display: flex;
  gap: 6px;
}

.tag {
  font-size: 11px;
  color: #4f6ef2;
  background: #eef2ff;
  padding: 2px 8px;
  border-radius: 999px;
}

.card-desc {
  font-size: 13px;
  color: #888;
  line-height: 1.5;
  min-height: 40px;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
</style>
