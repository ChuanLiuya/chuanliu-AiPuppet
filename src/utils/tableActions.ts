/**
 * 表格操作列通用渲染工具
 * 将「按钮 + 二次确认弹窗」组合的操作列抽成配置式写法，避免每个页面重复手写大段 h()
 */
import { h } from 'vue'
import { NButton, NPopconfirm, NSpace, type ButtonProps } from 'naive-ui'

/** 操作列中单个按钮的配置 */
export interface TableAction {
  /** 按钮文字 */
  label: string
  /** 按钮类型（颜色），默认 default */
  type?: ButtonProps['type']
  /** 点击回调；设置了 confirmText 时，在确认弹窗点确定后才触发 */
  onClick?: () => void
  /** 确认弹窗文案；提供时按钮会被 NPopconfirm 包裹，需要二次确认 */
  confirmText?: string
  /** 是否禁用 */
  disabled?: boolean
}

/**
 * 渲染表格操作列（一组小按钮）
 *
 * @example
 * renderTableActions([
 *   { label: '测试', type: 'info' },
 *   { label: '编辑', onClick: () => openEdit(row) },
 *   { label: '删除', type: 'error', confirmText: `确定删除「${row.name}」吗？`, onClick: () => remove(row) },
 * ])
 */
export function renderTableActions(actions: TableAction[]) {
  return h(
    NSpace,
    { size: 'small' },
    {
      default: () =>
        actions.map((action) => {
          // 需要二次确认的按钮用 NPopconfirm 包裹
          if (action.confirmText) {
            return h(
              NPopconfirm,
              { onPositiveClick: action.onClick },
              {
                trigger: () =>
                  h(
                    NButton,
                    {
                      size: 'small',
                      tertiary: true,
                      type: action.type,
                      disabled: action.disabled,
                    },
                    { default: () => action.label },
                  ),
                default: () => action.confirmText,
              },
            )
          }
          return h(
            NButton,
            {
              size: 'small',
              tertiary: true,
              type: action.type,
              disabled: action.disabled,
              onClick: action.onClick,
            },
            { default: () => action.label },
          )
        }),
    },
  )
}
