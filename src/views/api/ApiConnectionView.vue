<script setup lang="ts">
// 占位数据：仅用于查看界面效果，后续替换为真实数据
const apiConnected = false
const apiBase = ref('https://api.example.com/v1')
const apiKey = ref('sk-xxxxxxxxxxxxxxxx')
const model = ref('gpt-4o-mini')
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h2>API 连接</h2>
        <p>配置模型接口并测试连通性，连接成功即可开始角色扮演对话</p>
      </div>
    </header>

    <!-- 连接状态卡片 -->
    <div class="status-card">
      <div class="status-info">
        <span class="status-dot" :class="{ connected: apiConnected }"></span>
        <div>
          <div class="status-title">{{ apiConnected ? '已连接' : '未连接' }}</div>
          <div class="status-sub">当前模型：{{ model }}</div>
        </div>
      </div>
      <NButton type="primary" secondary>测试连接</NButton>
    </div>

    <!-- API 配置表单 -->
    <div class="settings-card">
      <NForm label-placement="left" label-width="120" class="settings-form">
        <NFormItem label="API 地址">
          <NInput v-model:value="apiBase" placeholder="https://api.example.com/v1" />
        </NFormItem>
        <NFormItem label="API Key">
          <NInput
            v-model:value="apiKey"
            type="password"
            show-password-on="click"
            placeholder="sk-..."
          />
        </NFormItem>
        <NFormItem label="模型">
          <NInput v-model:value="model" placeholder="gpt-4o-mini" />
        </NFormItem>
      </NForm>
      <div class="editor-actions">
        <NButton type="primary">保存</NButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.status-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  margin-bottom: 16px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.status-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.status-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #ff6b6b;
}

.status-dot.connected {
  background: #3ddc84;
}

.status-title {
  font-size: 15px;
  font-weight: 600;
}

.status-sub {
  font-size: 12px;
  color: #999;
  margin-top: 2px;
}

.settings-card {
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.settings-form {
  max-width: 520px;
}

.editor-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;
}
</style>
