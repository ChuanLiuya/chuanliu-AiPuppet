<script setup lang="ts">
// 占位设置项：仅用于查看界面效果，后续替换为真实数据
const apiBase = ref('https://api.example.com/v1')
const apiKey = ref('sk-xxxxxxxxxxxxxxxx')
const model = ref('gpt-4o-mini')
const temperature = ref(0.8)
const topP = ref(0.9)
const maxTokens = ref(2048)
const darkMode = ref(true)
</script>

<template>
  <div class="page">
    <header class="page-header">
      <div>
        <h2>设置</h2>
        <p>配置模型连接、生成参数与应用偏好</p>
      </div>
    </header>

    <div class="settings-card">
      <NTabs type="line" animated>
        <!-- 模型与 API -->
        <NTabPane name="api" tab="模型与 API">
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
        </NTabPane>

        <!-- 生成参数 -->
        <NTabPane name="params" tab="生成参数">
          <NForm label-placement="left" label-width="120" class="settings-form">
            <NFormItem label="温度">
              <NSlider
                v-model:value="temperature"
                :min="0"
                :max="2"
                :step="0.1"
                class="slider"
              />
            </NFormItem>
            <NFormItem label="Top P">
              <NSlider v-model:value="topP" :min="0" :max="1" :step="0.05" class="slider" />
            </NFormItem>
            <NFormItem label="最大 Token">
              <NInputNumber v-model:value="maxTokens" :min="64" :max="8192" :step="64" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <!-- 界面 -->
        <NTabPane name="ui" tab="界面">
          <NForm label-placement="left" label-width="120" class="settings-form">
            <NFormItem label="深色模式">
              <NSwitch v-model:value="darkMode" />
            </NFormItem>
          </NForm>
        </NTabPane>

        <!-- 数据 -->
        <NTabPane name="data" tab="数据">
          <p style="color: #888; margin-bottom: 12px">备份 / 恢复 / 清空 应用数据（占位）</p>
          <NSpace>
            <NButton secondary>备份数据</NButton>
            <NButton secondary>恢复数据</NButton>
            <NButton type="error" secondary>清空数据</NButton>
          </NSpace>
        </NTabPane>
      </NTabs>
    </div>
  </div>
</template>

<style scoped>
.settings-card {
  padding: 24px;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.settings-form {
  max-width: 520px;
  margin-top: 12px;
}

.slider {
  width: 240px;
}
</style>
