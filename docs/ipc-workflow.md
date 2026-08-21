# 前后端交互开发指南

> 本文档说明在项目中新增一个后端函数（如增删改查、调用外部 API 等）时，需要修改哪些文件、按什么顺序改。
>
> 项目的 IPC 交互链路为：
>
> ```mermaid
> graph LR
>   A["渲染进程 Vue"] -->|window.electronAPI.xxx.yyy| B["Preload 桥接层"]
>   B -->|ipcRenderer.invoke| C["IPC 通道定义"]
>   C -->|ipcMain.handle| D["主进程 Controller"]
>   D --> E["数据库 / 外部 API"]
> ```

## 一、文件总览

新增一个后端函数，最多涉及以下 **7 个文件**（按调用链路顺序）：

| 序号 | 文件 | 作用 | 必改 |
| --- | --- | --- | --- |
| 1 | `src/shared/types/xxx.ts` | 定义数据契约（DTO、参数类型、返回类型） | ✅ |
| 2 | `src/main/database/entities/xxx.ts` | 定义数据库实体（仅涉及数据库操作时） | 视情况 |
| 3 | `src/main/ipc/channels.ts` | 定义 IPC 通道名 | ✅ |
| 4 | `src/main/ipc/apis/xxx.ts` | 主进程 Controller，实现业务逻辑 | ✅ |
| 5 | `src/main/ipc/index.ts` | 注册 Controller（新增模块时才需要） | 新模块才改 |
| 6 | `src/main/preload/apis/xxx.ts` | Preload 桥接层，封装 `ipcRenderer.invoke` | ✅ |
| 7 | `src/render/views/xxx.vue` | 渲染进程调用 `window.electronAPI.xxx.yyy` | ✅ |

> `env.d.ts` **不需要手动改**——它通过 `typeof` 自动推导 preload API 的类型签名。

## 二、分步说明

### 1. 定义数据契约 — `src/shared/types/xxx.ts`

这是前后端共享的类型定义文件。所有 DTO、请求参数、返回类型都放在这里，前后端共同 import。

```ts
// 示例：src/shared/types/api_config.ts

/** 配置项 DTO（前端展示用） */
export interface ApiConfigDTO {
  id: number
  name: string
  base_url: string
  api_key: ApiKeyDTO
  model: string
  created_at: Date
}

/** 创建参数（前端传给后端） */
export type CreateApiConfigParams = Omit<ApiConfigDTO, 'id' | 'created_at' | 'api_key'> & {
  api_key_id: number
}

/** 返回类型 */
export type FindModelsResult = string[]
```

### 2. 定义数据库实体（可选） — `src/main/database/entities/xxx.ts`

仅当新增数据库表时才需要。使用 TypeORM 装饰器定义实体类，实现上一步的 DTO 接口。

```ts
@Entity('api_config')
export class ApiConfigEntity implements ApiConfigDTO {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  name!: string

  @ManyToOne(() => ApiKeyEntity)
  @JoinColumn({ name: 'api_key_id' })
  api_key!: ApiKeyEntity
}
```

### 3. 定义 IPC 通道名 — `src/main/ipc/channels.ts`

在 `IpcChannels` 对象中，对应模块下新增一个通道名。命名规范：`api:<模块>:<动作>`。

```ts
export const IpcChannels = {
  apiConfig: {
    // ...已有通道
    /** 测试连接 */
    testConnection: 'api:apiConfig:testConnection',  // ← 新增
  },
} as const
```

### 4. 实现主进程 Controller — `src/main/ipc/apis/xxx.ts`

在 Controller 类中做两件事：

**a) 在 `register()` 中注册 handler：**

```ts
register() {
  // ...已有通道
  ipcMain.handle(IpcChannels.apiConfig.testConnection, (_e, id: number) =>
    this.testConnection(id),  // ← 新增
  )
}
```

**b) 实现业务方法：**

```ts
async testConnection(id: number): Promise<ApiResponse<boolean>> {
  const cfg = await this.repo.findOne({ where: { id }, relations: { api_key: true } })
  if (!cfg) return error(`未找到配置项`, false)
  // ...业务逻辑
  return success(true, '连接测试成功')
}
```

> **注意**：返回值必须使用 `success()` / `error()` 包装为 `ApiResponse<T>`。不要直接返回 axios 响应对象等不可结构化克隆的内容，否则 IPC 会报 `An object could not be cloned`。

### 5. 注册 Controller（仅新模块） — `src/main/ipc/index.ts`

只有新增一个完整模块（如新增 `character` 模块）时才需要在此注册：

```ts
export function registerIpc() {
  new CharacterController().register()  // ← 新增
}
```

> 如果只是在已有模块（如 `apiConfig`）中新增一个函数，**跳过此步**。

### 6. 封装 Preload API — `src/main/preload/apis/xxx.ts`

在 preload 层新增对应的调用方法，方法签名与 Controller 一一对应：

```ts
export const apiConfigApi = {
  // ...已有方法

  /**
   * 测试连接是否正常
   *
   * 通道：api:apiConfig:testConnection
   */
  testConnection: (id: number): Promise<ApiResponse<boolean>> =>
    ipcRenderer.invoke(IpcChannels.apiConfig.testConnection, id),  // ← 新增
}
```

> 改完这里，`window.electronAPI.apiConfig.testConnection` 的类型会通过 `env.d.ts` 中的 `typeof` 自动推导，前端直接可用，无需手动声明。

### 7. 前端调用 — `src/render/views/xxx.vue`

在 Vue 组件中通过 `window.electronAPI.<模块>.<方法>()` 调用：

```ts
async function handleTestConnection(row: FormatedCfg) {
  const res = await window.electronAPI.apiConfig.testConnection(row.id)
  if (res.success) {
    message.success('连接测试成功')
  } else {
    message.error(res.message)
  }
}
```

## 三、完整示例：新增 `testConnection`

以从零新增 `testConnection` 函数为例，完整改动清单：

| 步骤 | 文件 | 改动内容 |
| --- | --- | --- |
| 1 | `src/shared/types/api_config.ts` | 如需新类型则定义（本次复用已有 `ApiResponse`） |
| 2 | `src/main/ipc/channels.ts` | `apiConfig` 下新增 `testConnection: 'api:apiConfig:testConnection'` |
| 3 | `src/main/ipc/apis/apiConfig.ts` | `register()` 中注册 handler + 实现 `testConnection()` 方法 |
| 4 | `src/main/preload/apis/apiConfig.ts` | 新增 `testConnection(id)` 方法 |
| 5 | `src/render/views/api/ApiConnectionView.vue` | 调用 `window.electronAPI.apiConfig.testConnection(id)` |

## 四、注意事项

### IPC 数据序列化

Electron IPC 使用 **结构化克隆算法**（Structured Clone Algorithm）序列化数据。以下内容**不可传递**：

- 函数 / Class 实例（如 axios 响应对象 `AxiosResponse`）
- DOM 节点
- 原生模块对象（如 Node.js `Stream`）

如果需要传递 API 响应，只传 `res.data`（纯 JSON 对象）：

```ts
// ❌ 会报错：An object could not be cloned
return success(res, '成功')

// ✅ 只传纯数据
return success(res.data, '成功')
```

### 统一响应结构

所有后端方法返回值必须用 `success()` / `error()` 包装：

```ts
import { success, error, type ApiResponse } from '@shared/types/api-response'

// 成功：success(result, message?)
return success(true, '操作成功')

// 失败：error(message, fallbackResult?)
return error('操作失败', false)
```

前端统一通过 `res.success` 判断成败，`res.result` 取数据，`res.message` 弹提示。
