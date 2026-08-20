<script setup lang="ts">
// API 连接页：配置项的增删改查 + 搜索 + 测试连通性
import {
  NButton,
  NIcon,
  NPopconfirm,
  NSpace,
  NTag,
  type DataTableColumns,
} from 'naive-ui'
import { AddOutline, SearchOutline } from '@vicons/ionicons5'
import type { ApiConfigDTO } from '@shared/types/api_config'

const message = useMessage()

/** 配置项列表 */
const configs = ref<ApiConfigDTO[]>([])
/** 列表加载中 */
const loading = ref(false)

/** 加载全部配置项 */
async function loadConfigs() {
  loading.value = true
  try {
    configs.value = await window.electronAPI.apiConfig.findAll()
  } catch (err) {
    message.error(`加载配置失败：${err}`)
  } finally {
    loading.value = false
  }
}

onMounted(loadConfigs)

/** ================= 搜索 ================= */

const searchKeyword = ref('')

/** 按名称 / 地址 / 模型 关键字过滤后的列表 */
const filteredConfigs = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return configs.value
  return configs.value.filter((c) =>
    [c.name, c.base_url, c.model].some((v) => v?.toLowerCase().includes(kw)),
  )
})

/** ================= 新增 / 编辑 ================= */

const showModal = ref(false)
const saving = ref(false)
/** 正在编辑的配置项 id；null 表示新增 */
const editingId = ref<number | null>(null)
const form = reactive({
  name: '',
  base_url: '',
  api_key: '',
  model: '',
})

/** 打开新增弹窗 */
function openCreate() {
  editingId.value = null
  Object.assign(form, { name: '', base_url: '', api_key: '', model: '' })
  showModal.value = true
}

/** 打开编辑弹窗 */
function openEdit(row: ApiConfigDTO) {
  editingId.value = row.id
  Object.assign(form, {
    name: row.name,
    base_url: row.base_url,
    api_key: row.api_key,
    model: row.model,
  })
  showModal.value = true
}

/** 关闭弹窗 */
function closeModal() {
  if (saving.value) return
  showModal.value = false
}

/** 保存（新增或编辑） */
async function save() {
  if (!form.name.trim()) return message.warning('请填写配置名称')
  if (!form.base_url.trim()) return message.warning('请填写 API 地址')

  saving.value = true
  try {
    const data = { ...form }
    if (editingId.value == null) {
      await window.electronAPI.apiConfig.create(data)
      message.success('新增配置成功')
    } else {
      await window.electronAPI.apiConfig.update(editingId.value, data)
      message.success('保存成功')
    }
    showModal.value = false
    await loadConfigs()
  } catch (err) {
    message.error(`保存失败：${err}`)
  } finally {
    saving.value = false
  }
}

/** ================= 删除 ================= */

async function remove(row: ApiConfigDTO) {
  try {
    await window.electronAPI.apiConfig.remove(row.id)
    message.success(`已删除「${row.name}」`)
    await loadConfigs()
  } catch (err) {
    message.error(`删除失败：${err}`)
  }
}

/** ================= 测试连接 ================= */

/** 正在测试的配置项 id */
const testingId = ref<number | null>(null)

async function testConnection(row: ApiConfigDTO) {
  testingId.value = row.id
  try {
    const res = await window.electronAPI.apiConfig.testConnection({
      base_url: row.base_url,
      api_key: row.api_key,
      model: row.model,
    })
    if (res.ok) message.success(res.message)
    else message.error(res.message)
  } catch (err) {
    message.error(`测试失败：${err}`)
  } finally {
    testingId.value = null
  }
}

/** ================= 表格 ================= */

/** 格式化创建时间 */
function formatTime(value: Date | string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** API Key 掩码展示（保留头尾，中间打码） */
function maskKey(key: string): string {
  if (!key) return '-'
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

const columns: DataTableColumns<ApiConfigDTO> = [
  { title: '名称', key: 'name', minWidth: 140 },
  { title: 'API 地址', key: 'base_url', minWidth: 220, ellipsis: { tooltip: true } },
  { title: '模型', key: 'model', minWidth: 110 },
  {
    title: 'API Key',
    key: 'api_key',
    width: 150,
    render: (row) =>
      h(NTag, { size: 'small', bordered: false }, { default: () => maskKey(row.api_key) }),
  },
  {
    title: '创建时间',
    key: 'created_at',
    width: 150,
    render: (row) => formatTime(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) =>
      h(
        NSpace,
        { size: 'small' },
        {
          default: () => [
            h(
              NButton,
              {
                size: 'small',
                tertiary: true,
                type: 'info',
                loading: testingId.value === row.id,
                onClick: () => testConnection(row),
              },
              { default: () => '测试' },
            ),
            h(
              NButton,
              { size: 'small', tertiary: true, onClick: () => openEdit(row) },
              { default: () => '编辑' },
            ),
            h(
              NPopconfirm,
              { onPositiveClick: () => remove(row) },
              {
                trigger: () =>
                  h(
                    NButton,
                    { size: 'small', tertiary: true, type: 'error' },
                    { default: () => '删除' },
                  ),
                default: () => `确定删除「${row.name}」吗？`,
              },
            ),
          ],
        },
      ),
  },
]
</script>

<template>
  <n-layout class="page">
    <n-layout-header bordered class="page-header">
      <div>
        <n-h2 class="page-title">API 连接</n-h2>
        <p class="page-desc">配置模型接口并测试连通性，连接成功即可开始角色扮演对话</p>
      </div>
    </n-layout-header>

    <n-layout-content class="page-content">
      <!-- 工具栏：搜索 + 新增 -->
      <div class="toolbar">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索配置名称 / API 地址 / 模型"
          clearable
          class="search-input"
        >
          <template #prefix>
            <NIcon :component="SearchOutline" />
          </template>
        </n-input>
        <n-button type="primary" @click="openCreate">
          <template #icon>
            <NIcon :component="AddOutline" />
          </template>
          新增配置
        </n-button>
      </div>

      <!-- 配置列表 -->
      <div class="table-card theme-bg-card theme-border theme-radius">
        <n-data-table
          :columns="columns"
          :data="filteredConfigs"
          :loading="loading"
          :row-key="(row) => row.id"
          :scroll-x="1000"
          :pagination="{ pageSize: 8 }"
        />
      </div>
    </n-layout-content>
  </n-layout>

  <!-- 新增 / 编辑弹窗 -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editingId == null ? '新增配置' : '编辑配置'"
    :style="{ width: '480px' }"
    :mask-closable="false"
  >
    <n-form label-placement="top" :show-feedback="false">
      <n-form-item label="配置名称" required>
        <n-input v-model:value="form.name" placeholder="例如：OpenAI 官方" />
      </n-form-item>
      <n-form-item label="API 地址" required>
        <n-input v-model:value="form.base_url" placeholder="https://api.openai.com/v1" />
      </n-form-item>
      <n-form-item label="API Key">
        <n-input
          v-model:value="form.api_key"
          type="password"
          show-password-on="click"
          placeholder="sk-..."
        />
      </n-form-item>
      <n-form-item label="模型">
        <n-input v-model:value="form.model" placeholder="gpt-4o-mini" />
      </n-form-item>
    </n-form>

    <template #footer>
      <n-space justify="end">
        <n-button :disabled="saving" @click="closeModal">取消</n-button>
        <n-button type="primary" :loading="saving" @click="save">保存</n-button>
      </n-space>
    </template>
  </n-modal>
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

.page-desc {
  margin: 2px 0 0;
  font-size: 13px;
  color: #999;
}

.page-content {
  flex: 1;
  overflow: auto;
  padding: 20px 24px;
}

.toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}

.search-input {
  max-width: 360px;
}

.table-card {
  padding: 8px;
}
</style>
