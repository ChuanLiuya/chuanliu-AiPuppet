<script setup lang="ts">
// ref / toRaw / useMessage 均由 unplugin-auto-import 自动导入
import type { CatCreateInput, CatDTO } from '@shared/types/cat'

// Naive UI 消息提示（依赖 App.vue 中包裹的 NMessageProvider）
const message = useMessage()

const catForm = ref<CatCreateInput>({
  name: '',
  age: 0,
  breed: '',
})

const catData = ref<CatDTO[]>([])

async function handleClickAddBtn() {
  // Electron IPC 传参需传普通对象（响应式 Proxy 无法被结构化克隆）
  if (!window.electronAPI) {
    message.warning('当前为浏览器预览，无法访问 Electron API')
    return
  }
  await window.electronAPI.cat.create(toRaw(catForm.value))
  message.success('猫信息已存入')
  await handleClickLoadBtn()
}

async function handleClickLoadBtn() {
  if (!window.electronAPI) {
    message.warning('当前为浏览器预览，无法访问 Electron API')
    return
  }
  catData.value = await window.electronAPI.cat.findAll()
  message.info(`共读取到 ${catData.value.length} 条猫信息`)
}
</script>

<template>
  <main style="max-width: 640px; margin: 0 auto; padding: 24px">
    <n-card title="🐱 猫信息管理" style="margin-bottom: 16px">
      <n-space vertical size="large">
        <n-input v-model:value="catForm.name" placeholder="请输入猫的名字" clearable />
        <n-input-number
          v-model:value="catForm.age"
          placeholder="请输入猫的年龄"
          :min="0"
          style="width: 100%"
        />
        <n-input v-model:value="catForm.breed" placeholder="请输入猫的品种" clearable />
        <n-space justify="end">
          <n-button type="primary" @click="handleClickAddBtn">存入</n-button>
          <n-button @click="handleClickLoadBtn">读取猫信息</n-button>
        </n-space>
      </n-space>
    </n-card>

    <n-card title="猫信息列表">
      <n-table :bordered="true" :single-line="false">
        <thead>
          <tr>
            <th>id</th>
            <th>品种</th>
            <th>名称</th>
            <th>年龄</th>
          </tr>
        </thead>
        <tbody>
          <template v-if="catData.length">
            <tr v-for="value in catData" :key="value.id">
              <td>{{ value.id }}</td>
              <td>{{ value.breed }}</td>
              <td>{{ value.name }}</td>
              <td>{{ value.age }}</td>
            </tr>
          </template>
          <tr v-else>
            <td colspan="4" style="text-align: center; color: #999">暂无数据</td>
          </tr>
        </tbody>
      </n-table>
    </n-card>
  </main>
</template>
