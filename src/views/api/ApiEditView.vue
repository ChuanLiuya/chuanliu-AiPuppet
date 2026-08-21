<script setup lang="ts">
/**
 * API 配置新增 / 编辑页。
 * 从 ApiConnectionView 跳转过来，通过路由 query 的 id 判断是新增还是编辑。
 * 模型字段需先点击「获取模型列表」拉取可用模型后，才能下拉选择。
 */
import { NIcon } from 'naive-ui'
import { ArrowBackOutline, DownloadOutline } from '@vicons/ionicons5'
import type { ApiConfigDTO } from '@shared/types/api_config'

const route = useRoute()
const router = useRouter()
const message = useMessage()

// ═════════════════════════════════════════════════════
// 状态
// ═════════════════════════════════════════════════════

/** 正在编辑的配置项 id；null 表示新增 */
const editingId = ref<number | null>(null)
/** 是否正在保存 */
const isSaving = ref(false)
/** 是否正在获取模型列表 */
const isLoadingModels = ref(false)
/** 拉取到的模型列表（用于下拉选择） */
const modelOptions = ref<string[]>([])
/** 表单数据 */
const form = reactive({
  name: '',
  base_url: '',
  api_key: '',
  model: '',
})

/** 模型下拉是否可用：有模型列表数据时才启用 */
const isModelEnabled = computed(() => modelOptions.value.length > 0)

/** 页面标题 */
const pageTitle = computed(() => (editingId.value == null ? '新增配置' : '编辑配置'))

// ═════════════════════════════════════════════════════
// 函数
// ═════════════════════════════════════════════════════

/** 返回列表页 */
function goBack() {
  router.push('/api')
}

/** 加载已有配置项（编辑模式） */
async function loadConfig() {
  const id = Number(route.query.id)
  if (!id) return
  editingId.value = id
  try {
    const config = await window.electronAPI.apiConfig.findOneById(id)
    if (config) {
      Object.assign(form, {
        name: config.name,
        base_url: config.base_url,
        api_key: config.api_key,
        model: config.model,
      })
    }
  } catch (err) {
    message.error(`加载配置失败：${err}`)
  }
}

/**
 * 获取模型列表（当前 mock，后续对接后端 /v1/models 接口）
 * 需要先填写 API 地址和 API Key
 */
async function fetchModels() {
  if (!form.base_url.trim()) return message.warning('请先填写 API 地址')
  if (!form.api_key.trim()) return message.warning('请先填写 API Key')

  isLoadingModels.value = true
  try {
    // TODO: 对接后端，调用 window.electronAPI.apiConfig.findModels(...)
    await new Promise((resolve) => setTimeout(resolve, 800))
    modelOptions.value = ['deepseek-chat', 'deepseek-reasoner', 'gpt-4o-mini', 'gpt-4o']
    message.success('获取模型列表成功')
  } catch (err) {
    message.error(`获取模型列表失败：${err}`)
  } finally {
    isLoadingModels.value = false
  }
}

/** 保存（新增或编辑） */
async function save() {
  if (!form.name.trim()) return message.warning('请填写配置名称')
  if (!form.base_url.trim()) return message.warning('请填写 API 地址')
  if (!form.api_key.trim()) return message.warning('请填写 API Key')
  if (!form.model.trim()) return message.warning('请选择模型')

  isSaving.value = true
  try {
    const data = { ...form }
    if (editingId.value == null) {
      await window.electronAPI.apiConfig.create(data)
      message.success('新增配置成功')
    } else {
      await window.electronAPI.apiConfig.update(editingId.value, data)
      message.success('保存成功')
    }
    router.push('/api')
  } catch (err) {
    message.error(`保存失败：${err}`)
  } finally {
    isSaving.value = false
  }
}

// ═════════════════════════════════════════════════════
// 生命周期
// ═════════════════════════════════════════════════════

onMounted(loadConfig)
</script>

<template>
  <div class="page">
    <!-- 页头：返回按钮 + 标题 -->
    <div class="page-header">
      <n-button quaternary circle @click="goBack">
        <template #icon>
          <NIcon :component="ArrowBackOutline" />
        </template>
      </n-button>
      <n-h2 class="page-title">{{ pageTitle }}</n-h2>
    </div>

    <!-- 表单区 -->
    <div class="page-content">
      <n-form label-placement="top" :show-feedback="false" size="large" class="edit-form">
        <n-form-item label="配置名称" required>
          <n-input v-model:value="form.name" placeholder="例如：DS官方api-v4pro" />
        </n-form-item>
        <n-form-item label="API 地址" required>
          <n-input v-model:value="form.base_url" placeholder="https://api.deepseek.com" />
        </n-form-item>
        <n-form-item label="API Key" required>
          <n-input
            v-model:value="form.api_key"
            type="password"
            show-password-on="click"
            placeholder="sk-..."
          />
        </n-form-item>

        <!-- 模型：需先获取模型列表才能选择 -->
        <n-form-item label="模型" required>
          <div class="model-row">
            <n-select
              v-model:value="form.model"
              :options="modelOptions.map((m) => ({ label: m, value: m }))"
              :disabled="!isModelEnabled"
              :placeholder="isModelEnabled ? '请选择模型' : '请先获取模型列表'"
              class="model-select"
            />
            <n-button
              :loading="isLoadingModels"
              :disabled="isLoadingModels"
              @click="fetchModels"
            >
              <template #icon>
                <NIcon :component="DownloadOutline" />
              </template>
              获取模型列表
            </n-button>
          </div>
        </n-form-item>
      </n-form>
    </div>

    <!-- 底部操作栏 -->
    <div class="page-footer">
      <n-space :size="12" justify="end">
        <n-button @click="goBack">取消</n-button>
        <n-button type="primary" :loading="isSaving" @click="save">保存</n-button>
      </n-space>
    </div>
  </div>
</template>

<style scoped>
.page {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 20px;
  overflow: hidden;

  .page-header {
    flex: 0;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 24px;

    .page-title {
      margin: 0;
      font-size: 18px;
    }
  }

  .page-content {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    padding: 20px 24px;

    .edit-form {
      max-width: 560px;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .model-row {
      display: flex;
      gap: 12px;
      width: 100%;

      .model-select {
        flex: 1;
      }
    }
  }

  .page-footer {
    flex: 0;
    padding: 12px 24px;
    border-top: 1px solid var(--n-border-color, rgba(255, 255, 255, 0.09));
  }
}
</style>
