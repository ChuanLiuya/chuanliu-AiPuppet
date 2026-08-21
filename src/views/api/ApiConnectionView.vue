<script setup lang="ts">
// API 连接页：配置项的增删改查 + 搜索 + 测试连通性
import {
  NIcon,
  NTag,
  useDialog,
  type DataTableColumns,
  type DataTableRowKey,
} from 'naive-ui'
import { AddOutline, SearchOutline, TrashOutline } from '@vicons/ionicons5'
import type { ApiConfigDTO } from '@shared/types/api_config'
import { renderTableActions } from '@/utils/tableActions'

const message = useMessage()
const dialog = useDialog()

/** 配置项列表 */
const configs = ref<ApiConfigDTO[]>([])
/** 列表加载中 */
const isLoading = ref(false)

/** 加载全部配置项 */
async function loadConfigs() {
  isLoading.value = true
  try {
    configs.value = await window.electronAPI.apiConfig.findAll()
  } catch (err) {
    message.error(`加载配置失败：${err}`)
  } finally {
    isLoading.value = false
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

const checkedRowKeysRef = ref<DataTableRowKey[]>([])

/** 当前选中的配置项数量（用于按钮文案与禁用态） */
const checkedCount = computed(() => checkedRowKeysRef.value.length)

async function remove(row: ApiConfigDTO) {
  try {
    await window.electronAPI.apiConfig.remove(row.id)
    message.success(`已删除「${row.name}」`)
    await loadConfigs()
  } catch (err) {
    message.error(`删除失败：${err}`)
  }
}

/** 批量删除选中的配置项 */
async function batchRemove() {
  const ids = [...checkedRowKeysRef.value]
  if (!ids.length) return

  // 取出选中行对应的名称，用于弹窗展示
  const names = configs.value
    .filter((c) => ids.includes(c.id))
    .map((c) => c.name)

  dialog.warning({
    title: '批量删除',
    content: `确定删除选中的 ${ids.length} 项配置吗？\n${names.map((n) => `• ${n}`).join('\n')}`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      let failed = 0
      for (const id of ids) {
        try {
          await window.electronAPI.apiConfig.remove(id as number)
        } catch {
          failed++
        }
      }
      checkedRowKeysRef.value = []
      await loadConfigs()
      if (failed) {
        message.warning(`删除完成，其中 ${failed} 项失败`)
      } else {
        message.success(`已删除 ${ids.length} 项配置`)
      }
    },
  })
}

/**
 * 处理改变表格选中状态
 * @param rowKeys 选中内容时，选择的内容的主键数组
 */
function handleCheckedChange(rowKeys: DataTableRowKey[]) {
  checkedRowKeysRef.value = rowKeys
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
  {
    type: 'selection',
  },
  { title: '名称', key: 'name', minWidth: 100, ellipsis: { tooltip: true }, resizable: true },
  {
    title: 'API 地址',
    key: 'base_url',
    minWidth: 100,
    ellipsis: { tooltip: true },
    resizable: true,
  },
  { title: '模型', key: 'model', minWidth: 80, resizable: true },
  {
    title: 'API Key',
    key: 'api_key',
    minWidth: 50,
    resizable: true,
    render: (row) =>
      h(NTag, { size: 'small', bordered: false }, { default: () => maskKey(row.api_key) }),
  },
  {
    title: '创建时间',
    key: 'created_at',
    minWidth: 80,
    ellipsis: { tooltip: true },
    resizable: true,
    render: (row) => formatTime(row.created_at),
  },
  {
    title: '操作',
    key: 'actions',
    width: 200,
    render: (row) =>
      renderTableActions([
        { label: '测试', type: 'info' },
        { label: '编辑', onClick: () => openEdit(row) },
        {
          label: '删除',
          type: 'error',
          confirmText: `确定删除「${row.name}」吗？`,
          onClick: () => remove(row),
        },
      ]),
  },
]
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <n-h2 class="page-title">API 连接</n-h2>
        <p class="page-desc">配置模型接口并测试连通性，连接成功即可开始角色扮演对话</p>
      </div>
    </div>

    <div class="page-content">
      <!-- 工具栏 -->
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
        <n-space :size="12">
          <n-button
            type="error"
            :disabled="checkedCount === 0"
            @click="batchRemove"
          >
            <template #icon>
              <NIcon :component="TrashOutline" />
            </template>
            {{ checkedCount > 0 ? `删除 ${checkedCount} 个选中配置项` : '删除' }}
          </n-button>
          <n-button type="primary" @click="openCreate">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            新增配置
          </n-button>
        </n-space>
      </div>

      <!-- 配置列表 -->
      <div class="table-card">
        <n-data-table
          @update:checked-row-keys="handleCheckedChange"
          :columns="columns"
          :data="filteredConfigs"
          :loading="isLoading"
          :row-key="(row) => row.id"
          :scroll-x="1000"
          :pagination="false"
          flex-height
          class="table"
        />
      </div>
    </div>
  </div>

  <!-- 新增 / 编辑弹窗 -->
  <n-modal
    v-model:show="showModal"
    preset="card"
    :title="editingId == null ? '新增配置' : '编辑配置'"
    :style="{ width: '480px' }"
    :mask-closable="false"
  >
    <n-form label-placement="top" :show-feedback="false" size="large" class="edit-form">
      <n-form-item label="配置名称" required>
        <n-input v-model:value="form.name" placeholder="例如：DS官方api-v4pro" />
      </n-form-item>
      <n-form-item label="API 地址" required>
        <n-input v-model:value="form.base_url" placeholder="https://api.deepseek.com" />
      </n-form-item>
      <n-form-item label="API Key" class="form-get-model">
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
  padding: 20px;
  overflow: hidden;

  .page-header {
    flex: 0;
    padding: 0 24px;

    .page-title {
      margin: 0;
      font-size: 18px;
    }

    .page-desc {
      margin: 2px 0 5px 0;
      font-size: 13px;
      color: #999;
    }
  }

  .page-content {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    padding: 20px 24px;
    overflow: hidden;

    .toolbar {
      flex: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 16px;

      .search-input {
        max-width: 360px;
      }
    }

    .table-card {
      flex: 1;
      min-height: 0;
      padding: 8px;
      overflow: hidden;

      .table {
        height: 100%;
      }
    }
  }
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
