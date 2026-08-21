<script setup lang="ts">
/**
 * API 密钥管理页面。
 * 管理可复用的 API 密钥，供 API 配置项关联使用。
 * 新增 / 编辑使用弹窗（Modal），密钥字段较少无需独立页面。
 */
import {
  NIcon,
  NTag,
  useDialog,
  type DataTableColumns,
  type DataTableRowKey,
  type FormInst,
  type FormRules,
} from 'naive-ui'
import { AddOutline, ArrowBackOutline, SearchOutline, TrashOutline } from '@vicons/ionicons5'
import type { ApiKeyDTO } from '@shared/types/api_key'
import { renderTableActions } from '@/utils/tableActions'
import { debugLog } from '@/composables/useDebugLog'

const message = useMessage()
const dialog = useDialog()
const router = useRouter()

// ═════════════════════════════════════════════════════
// 函数
// ═════════════════════════════════════════════════════

/** 返回 API 连接页 */
function goBack() {
  router.push('/api')
}

// ═════════════════════════════════════════════════════
// 状态
// ═════════════════════════════════════════════════════

/** 密钥列表 */
const keys = ref<ApiKeyDTO[]>([])
/** 列表是否处于加载中 */
const isLoading = ref(false)
/** 搜索关键字 */
const searchKeyword = ref('')
/** 表格选中的行 key 列表，用于批量删除 */
const checkedRowKeys = ref<DataTableRowKey[]>([])

/** 弹窗是否显示 */
const showModal = ref(false)
/** 弹窗模式：新增 / 编辑 */
const editingId = ref<number | null>(null)
/** 是否正在保存 */
const isSaving = ref(false)
/** 表单引用 */
const formRef = ref<FormInst | null>(null)
/** 表单数据 */
const form = reactive<{
  name: string
  key: string
}>({
  name: '',
  key: '',
})

/** 弹窗标题 */
const modalTitle = computed(() => (editingId.value == null ? '新增密钥' : '编辑密钥'))

/** 按名称 / 密钥 关键字过滤后的列表 */
const filteredKeys = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return keys.value
  return keys.value.filter((k) =>
    [k.name, k.key].some((v) => v?.toLowerCase().includes(kw)),
  )
})

/** 当前选中的密钥数量（用于按钮文案与禁用态） */
const checkedCount = computed(() => checkedRowKeys.value.length)

/** 表单校验规则 */
const formRules: FormRules = {
  name: { required: true, message: '请填写密钥名称', trigger: 'blur' },
  key: { required: true, message: '请填写密钥', trigger: 'blur' },
}

// ═════════════════════════════════════════════════════
// 函数
// ═════════════════════════════════════════════════════

/** 加载全部密钥 */
async function loadKeys() {
  isLoading.value = true
  try {
    const res = await window.electronAPI.apiKey.findAll()
    debugLog('apiKey.findAll', res)
    if (!res.success) {
      message.error(res.message)
      return
    }
    keys.value = res.result
  } catch (err) {
    message.error(`加载密钥失败：${err}`)
  } finally {
    isLoading.value = false
  }
}

/** 打开新增弹窗 */
function openCreate() {
  editingId.value = null
  form.name = ''
  form.key = ''
  showModal.value = true
}

/** 打开编辑弹窗 */
async function openEdit(row: ApiKeyDTO) {
  editingId.value = row.id
  form.name = row.name
  form.key = row.key
  showModal.value = true
}

/** 保存（新增或编辑） */
async function save() {
  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  isSaving.value = true
  try {
    if (editingId.value == null) {
      const res = await window.electronAPI.apiKey.create({
        name: form.name,
        key: form.key,
      })
      debugLog('apiKey.create', res)
      if (!res.success) {
        message.error(res.message)
        return
      }
      if (res.message) message.success(res.message)
    } else {
      const res = await window.electronAPI.apiKey.update(editingId.value, {
        name: form.name,
        key: form.key,
      })
      debugLog('apiKey.update', res)
      if (!res.success) {
        message.error(res.message)
        return
      }
      if (res.message) message.success(res.message)
    }
    showModal.value = false
    await loadKeys()
  } catch (err) {
    message.error(`保存失败：${err}`)
  } finally {
    isSaving.value = false
  }
}

/** 删除单个密钥 */
async function remove(row: ApiKeyDTO) {
  try {
    const res = await window.electronAPI.apiKey.remove(row.id)
    debugLog('apiKey.remove', res)
    if (!res.success) {
      message.error(res.message)
      return
    }
    if (res.message) message.success(res.message)
    await loadKeys()
  } catch (err) {
    message.error(`删除失败：${err}`)
  }
}

/** 批量删除选中的密钥 */
async function batchRemove() {
  const ids = [...checkedRowKeys.value]
  if (!ids.length) return

  const names = keys.value.filter((k) => ids.includes(k.id)).map((k) => k.name)

  dialog.warning({
    title: '批量删除',
    content: `确定删除选中的 ${ids.length} 个密钥吗？\n${names.map((n) => `• ${n}`).join('\n')}`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      let failed = 0
      for (const id of ids) {
        try {
          const res = await window.electronAPI.apiKey.remove(id as number)
          debugLog('apiKey.remove', res)
          if (!res.success) {
            message.error(res.message)
            failed++
          } else if (res.message) {
            message.success(res.message)
          }
        } catch {
          failed++
        }
      }
      checkedRowKeys.value = []
      await loadKeys()
      if (failed) {
        message.warning(`删除完成，其中 ${failed} 个失败`)
      }
    },
  })
}

/** 处理表格选中状态变化 */
function handleCheckedChange(rowKeys: DataTableRowKey[]) {
  checkedRowKeys.value = rowKeys
}

/** 格式化创建时间为 YYYY-MM-DD HH:mm */
function formatTime(value: Date | string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return String(value)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** 密钥掩码展示（保留头尾 4 位，中间打码） */
function maskKey(key: string): string {
  if (!key) return '-'
  if (key.length <= 8) return '****'
  return `${key.slice(0, 4)}****${key.slice(-4)}`
}

// ═════════════════════════════════════════════════════
// 生命周期
// ═════════════════════════════════════════════════════

/** 页面挂载时加载密钥列表 */
onMounted(loadKeys)

// ═════════════════════════════════════════════════════
// 表格列定义
// ═════════════════════════════════════════════════════

const columns: DataTableColumns<ApiKeyDTO> = [
  {
    type: 'selection',
  },
  { title: '名称', key: 'name', minWidth: 120, ellipsis: { tooltip: true }, resizable: true },
  {
    title: '密钥',
    key: 'key',
    minWidth: 100,
    ellipsis: { tooltip: true },
    resizable: true,
    render: (row) =>
      h(NTag, { size: 'small', bordered: false }, { default: () => maskKey(row.key) }),
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
      <n-button quaternary circle @click="goBack">
        <template #icon>
          <NIcon :component="ArrowBackOutline" />
        </template>
      </n-button>
      <div>
        <n-h2 class="page-title">API 密钥</n-h2>
        <p class="page-desc">管理可复用的 API 密钥，供 API 配置项关联使用</p>
      </div>
    </div>

    <div class="page-content">
      <!-- 工具栏 -->
      <div class="toolbar">
        <n-input
          v-model:value="searchKeyword"
          placeholder="搜索密钥名称 / 密钥"
          clearable
          class="search-input"
        >
          <template #prefix>
            <NIcon :component="SearchOutline" />
          </template>
        </n-input>
        <n-space :size="12">
          <n-button type="error" :disabled="checkedCount === 0" @click="batchRemove">
            <template #icon>
              <NIcon :component="TrashOutline" />
            </template>
            {{ checkedCount > 0 ? `删除 ${checkedCount} 个选中密钥` : '删除' }}
          </n-button>
          <n-button type="primary" @click="openCreate">
            <template #icon>
              <NIcon :component="AddOutline" />
            </template>
            新增密钥
          </n-button>
        </n-space>
      </div>

      <!-- 密钥列表 -->
      <div class="table-card">
        <n-data-table
          @update:checked-row-keys="handleCheckedChange"
          :columns="columns"
          :data="filteredKeys"
          :loading="isLoading"
          :row-key="(row) => row.id"
          :scroll-x="800"
          :pagination="false"
          flex-height
          class="table"
        />
      </div>
    </div>

    <!-- 新增 / 编辑弹窗 -->
    <n-modal
      v-model:show="showModal"
      preset="card"
      :title="modalTitle"
      style="width: 480px"
      :bordered="false"
    >
      <n-form ref="formRef" :model="form" :rules="formRules" label-placement="top" size="large">
        <n-form-item label="密钥名称" path="name">
          <n-input v-model:value="form.name" placeholder="例如：DeepSeek 官方密钥" />
        </n-form-item>
        <n-form-item label="密钥" path="key">
          <n-input
            v-model:value="form.key"
            type="password"
            show-password-on="click"
            placeholder="sk-..."
          />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button @click="showModal = false">取消</n-button>
          <n-button type="primary" :loading="isSaving" @click="save">保存</n-button>
        </n-space>
      </template>
    </n-modal>
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
</style>
