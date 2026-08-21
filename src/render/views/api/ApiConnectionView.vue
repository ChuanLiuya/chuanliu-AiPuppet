<script setup lang="ts">
/**
 * api连接页面。
 */
import { NIcon, NTag, useDialog, type DataTableColumns, type DataTableRowKey } from 'naive-ui'
import { h } from 'vue'
import { AddOutline, CheckmarkCircle, KeyOutline, SearchOutline, TrashOutline } from '@vicons/ionicons5'
import type { ApiConfigDTO } from '@shared/types/api_config'
import { AppSettingKey } from '@shared/constants/app_setting'
import { renderTableActions } from '@/utils/tableActions'
import { debugLog } from '@/composables/useDebugLog'
import { formatTime, maskKey } from '@/utils/format'

const message = useMessage()
const dialog = useDialog()
const router = useRouter()

type FormatedCfg = ApiConfigDTO & {
  created_at_text: string
  api_key_text: string
}

/** =============================================== 状态 ====================================================== */

/** 配置项列表 */
const configs = ref<ApiConfigDTO[]>([])

/** 当前选中的配置项 ID（从 app_setting 表读取） */
const selectedConfigId = ref<number | null>(null)

/** 当前选中的配置项对象 */
const selectedConfig = computed(() =>
  configs.value.find((c) => c.id === selectedConfigId.value) ?? null,
)

/** 格式化后的配置项列表（时间格式化、密钥掩码展示） */
const formatedCfgs = computed<FormatedCfg[]>(() =>
  configs.value.map((c) => ({
    ...c,
    created_at_text: formatTime(c.created_at),
    api_key_text: (() => {
      if (!c.api_key) return '未配置'
      const masked = maskKey(c.api_key.key)
      return masked ? `${c.api_key.name}(${masked})` : c.api_key.name
    })(),
  })),
)

/** 列表是否处于加载中 */
const isLoading = ref(false)
/** 搜索关键字 */
const searchKeyword = ref('')
/** 表格选中的行 key 列表，用于批量删除 */
const checkedRowKeys = ref<DataTableRowKey[]>([])

/** 按名称 / 地址 / 模型 关键字过滤后的列表 */
const filteredConfigs = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return formatedCfgs.value
  return formatedCfgs.value.filter((c) =>
    [c.name, c.base_url, c.model].some((v) => v?.toLowerCase().includes(kw)),
  )
})

/** 当前选中的配置项数量（用于按钮文案与禁用态） */
const checkedCount = computed(() => checkedRowKeys.value.length)

/** =============================================== 函数 ====================================================== */

/** 加载全部配置项 */
async function loadConfigs() {
  isLoading.value = true
  try {
    const cfgRes = await window.electronAPI.apiConfig.findAll()
    debugLog('apiConfig.findAll', cfgRes)
    if (!cfgRes.success) {
      message.error(cfgRes.message)
      return
    }
    configs.value = cfgRes.result
    // 加载用户选中的配置
    const settingRes = await window.electronAPI.appSetting.get(
      AppSettingKey.SELECTED_API_CONFIG_ID,
    )
    debugLog('appSetting.get', settingRes)
    if (settingRes.success && settingRes.result) {
      selectedConfigId.value = Number(settingRes.result)
    }
  } catch (err) {
    message.error(`加载配置失败：${err}`)
  } finally {
    isLoading.value = false
  }
}

/** 将某个配置设为当前使用 */
async function setSelected(row: ApiConfigDTO) {
  try {
    const res = await window.electronAPI.appSetting.set(
      AppSettingKey.SELECTED_API_CONFIG_ID,
      String(row.id),
    )
    debugLog('appSetting.set', res)
    if (!res.success) {
      message.error(res.message)
      return
    }
    selectedConfigId.value = row.id
    message.success(`已将「${row.name}」设为当前使用的 API 配置`)
  } catch (err) {
    message.error(`设置失败：${err}`)
  }
}

/** 跳转到新增配置页 */
function openCreate() {
  router.push('/api/edit')
}

/** 跳转到密钥管理页 */
function openKeyManager() {
  router.push('/api/keys')
}

/** 跳转到编辑配置页 */
function openEdit(row: ApiConfigDTO) {
  router.push({ path: '/api/edit', query: { id: row.id } })
}

/** 删除单个配置项 */
async function remove(row: ApiConfigDTO) {
  try {
    const res = await window.electronAPI.apiConfig.remove(row.id)
    debugLog('apiConfig.remove', res)
    if (!res.success) {
      message.error(res.message)
      return
    }
    if (res.message) message.success(res.message)
    await loadConfigs()
  } catch (err) {
    message.error(`删除失败：${err}`)
  }
}

/** 批量删除选中的配置项 */
async function batchRemove() {
  const ids = [...checkedRowKeys.value]
  if (!ids.length) return

  // 取出选中行对应的名称，用于弹窗展示
  const names = formatedCfgs.value.filter((c) => ids.includes(c.id)).map((c) => c.name)

  dialog.warning({
    title: '批量删除',
    content: `确定删除选中的 ${ids.length} 项配置吗？\n${names.map((n) => `• ${n}`).join('\n')}`,
    positiveText: '确定删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      let failed = 0
      for (const id of ids) {
        try {
          const res = await window.electronAPI.apiConfig.remove(id as number)
          debugLog('apiConfig.remove', res)
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
      await loadConfigs()
      if (failed) {
        message.warning(`删除完成，其中 ${failed} 项失败`)
      }
    },
  })
}

/** 处理表格选中状态变化 */
function handleCheckedChange(rowKeys: DataTableRowKey[]) {
  checkedRowKeys.value = rowKeys
}

/** 测试单个配置项的连接是否正常 */
async function handleClickTestisApiConnected(row: ApiConfigDTO) {
  const msg = message.loading('正在测试连接…', { duration: 0 })
  try {
    const res = await window.electronAPI.apiConfig.testConnection(row.id)
    debugLog('apiConfig.testConnection', res)
    msg.destroy()
    if (res.success) {
      message.success(res.message)
    } else {
      message.error(`「${row.name}」连接失败：${res.message}`)
    }
  } catch (err) {
    msg.destroy()
    message.error(`测试连接失败：${err}`)
  }
}

/** ==================== 生命周期 ================ */

/** 页面挂载时加载配置列表 */
onMounted(loadConfigs)

/** =================== 表格列 ======================== */

const columns: DataTableColumns<(typeof formatedCfgs.value)[number]> = [
  {
    type: 'selection',
    fixed: 'left',
  },
  {
    title: '名称',
    key: 'name',
    minWidth: 100,
    ellipsis: { tooltip: true },
    resizable: true,
    fixed: 'left',
    render: (row) =>
      h('div', { style: 'display: flex; align-items: center; gap: 6px;' }, [
        h('span', null, row.name),
        row.id === selectedConfigId.value
          ? h(
              NTag,
              { size: 'small', type: 'success', round: true, bordered: false },
              { default: () => '当前使用' },
            )
          : null,
      ]),
  },
  {
    title: 'API 地址',
    key: 'base_url',
    minWidth: 100,
    ellipsis: { tooltip: true },
    resizable: true,
  },
  { title: '模型', key: 'model', minWidth: 80, resizable: true },
  {
    title: 'API 密钥',
    key: 'api_key_text',
    minWidth: 50,
    ellipsis: { tooltip: true },
    resizable: true,
  },
  {
    title: '创建时间',
    key: 'created_at_text',
    minWidth: 80,
    ellipsis: { tooltip: true },
    resizable: true,
  },
  {
    title: '操作',
    key: 'actions',
    fixed: 'right',
    width: 260,
    render: (row) =>
      renderTableActions([
        {
          label: row.id === selectedConfigId.value ? '当前使用' : '设为默认',
          type: row.id === selectedConfigId.value ? 'success' : 'primary',
          disabled: row.id === selectedConfigId.value,
          onClick: () => setSelected(row),
        },
        { label: '测试', type: 'info', onClick: () => handleClickTestisApiConnected(row) },
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
      <!-- 当前选中配置提示 -->
      <div v-if="selectedConfig" class="selected-banner">
        <NIcon :component="CheckmarkCircle" :size="18" />
        <span class="selected-text">
          当前使用：<strong>{{ selectedConfig.name }}</strong>
          （{{ selectedConfig.model }} · {{ selectedConfig.base_url }}）
        </span>
        <n-button
          size="small"
          type="success"
          secondary
          class="banner-test-btn"
          @click="handleClickTestisApiConnected(selectedConfig)"
        >
          测试连接
        </n-button>
      </div>

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
          <n-button type="error" :disabled="checkedCount === 0" @click="batchRemove">
            <template #icon>
              <NIcon :component="TrashOutline" />
            </template>
            {{ checkedCount > 0 ? `删除 ${checkedCount} 个选中配置项` : '删除' }}
          </n-button>
          <n-button @click="openKeyManager">
            <template #icon>
              <NIcon :component="KeyOutline" />
            </template>
            密钥管理
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

    .selected-banner {
      flex: 0;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      padding: 10px 16px;
      margin-bottom: 16px;
      border-radius: 8px;
      background: rgba(24, 160, 88, 0.08);
      border: 1px solid rgba(24, 160, 88, 0.3);

      .selected-text {
        flex: 1;
        font-size: 13px;

        strong {
          font-size: 14px;
        }
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
