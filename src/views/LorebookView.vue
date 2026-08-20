<script setup lang="ts">
// 占位世界书条目数据：仅用于查看界面效果，后续替换为真实数据
const entries = [
  { id: 1, title: '世界观：九州大陆', keyword: '九州,大陆,灵气' },
  { id: 2, title: '角色：苏妲己身世', keyword: '苏妲己,身世,狐妖' },
  { id: 3, title: '地点：昆仑山', keyword: '昆仑山,仙门' },
]

// 编辑器占位内容
const entryTitle = ref('世界观：九州大陆')
const entryKeyword = ref('九州,大陆,灵气')
const entryContent = ref('九州大陆是……（此处为占位内容）')
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h2>世界书</h2>
        <p>管理世界设定与知识条目，按关键词自动注入对话上下文</p>
      </div>
      <NButton type="primary">＋ 新建条目</NButton>
    </header>

    <div class="lorebook-layout">
      <!-- 左侧条目列表 -->
      <aside class="entry-list">
        <div
          v-for="e in entries"
          :key="e.id"
          class="entry-item"
          :class="{ active: e.id === 1 }"
        >
          <div class="entry-title">{{ e.title }}</div>
          <div class="entry-keyword">{{ e.keyword }}</div>
        </div>
      </aside>

      <!-- 右侧条目编辑器 -->
      <section class="entry-editor">
        <NInput v-model:value="entryTitle" placeholder="条目标题" class="editor-field" />
        <NInput
          v-model:value="entryKeyword"
          placeholder="触发关键词（逗号分隔）"
          class="editor-field"
        />
        <NInput
          v-model:value="entryContent"
          type="textarea"
          :rows="10"
          placeholder="条目内容"
          class="editor-field"
        />
        <div class="editor-actions">
          <NButton type="primary">保存</NButton>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lorebook-layout {
  display: flex;
  gap: 16px;
  align-items: stretch;
}

.entry-list {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.entry-item {
  padding: 12px 14px;
  border-radius: 10px;
  background: #fff;
  cursor: pointer;
}

.entry-item:hover {
  background: #f5f6fa;
}

.entry-item.active {
  background: #eef2ff;
  border: 1px solid #dbe3ff;
}

.entry-title {
  font-size: 14px;
  font-weight: 500;
}

.entry-keyword {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.entry-editor {
  flex: 1;
  min-width: 0;
  padding: 20px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.editor-field {
  margin-bottom: 12px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
