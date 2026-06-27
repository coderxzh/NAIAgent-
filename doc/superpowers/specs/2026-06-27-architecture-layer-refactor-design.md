# 项目 1：架构分层整改设计文档

## 1. 背景与问题

当前代码库中，`electron/ipc/handlers.ts` 直接操作数据库 SQL 的情况非常普遍，同时 `electron/services/agent/` 和 `electron/services/assistant/` 中大量 Service 文件是空骨架（直接 `throw Error`）。这与 `CLAUDE.md` 中约定的分层架构严重不符：

> Main 端的 `electron/ipc/handlers.ts` 注册所有处理器，进行 Zod 校验后调用 `electron/services/*`。

具体问题：

1. `handlers.ts` 中 28 处 Handler 直接调用 `db.prepare()` / `db.exec()`，Controller 同时承担了 Service + Repository 职责。
2. `agent/` 和 `assistant/` 共 29 个文件中 19 个是空骨架，占比 66%。
3. `geoAgentFactory.ts` 中的 Agent 工具直接内联 SQL，绕过项目管理 Service。
4. 业务逻辑与 SQL 紧耦合，无法复用、无法单元测试、无法统一管理事务。

## 2. 目标

恢复并落实 `CLAUDE.md` 约定的分层架构：

```text
Renderer
  ↓ invoke IPC
electron/ipc/handlers.ts   ← 参数校验 → 调用 Service → 返回结果
  ↓
electron/services/*        ← 业务逻辑、事务编排
  ↓
electron/db/repositories/* ← 数据访问（可选，本次先以 Service 承载 Repository 职责）
```

整改后：

- Handler 不再写任何业务 SQL。
- 每个业务领域有对应的 Service 文件。
- Agent/Assistant Runtime 的核心 Service 至少达到"不抛 Error"的最小可用状态。
- `geoAgentRuntime.ts` 调用 Service 层，而不是直接内联 SQL。

## 3. 范围

### 3.1 在本次整改范围内

- `electron/ipc/handlers.ts` 中 28 处直接 SQL 调用下沉到 Service 层。
- 新建/完善以下 Service，使其至少达到可运行状态：
  - Project Service（承接 `project:*`）
  - KB Service（承接 `kb:*`）
  - Fact Service（承接 `fact:*`）
  - Agent Task State Manager / Execution Ledger / Artifact Manager
  - Assistant Runtime / Run Service / Tool Approval Service / Queue Service
- 修改 `geoAgentFactory.ts` 中的工具，改为调用 Project Service。
- 保持现有数据库 schema 和前端接口不变，不引入新表。

### 3.2 不在本次范围内

- 不实现完整流式 Assistant Runtime（流式解析、SSE 推送）—— 这是项目 3 的范围。
- 不实现 Agent 循环规划、ToolGuard、动态工具注册、Retry/Recovery 完整逻辑 —— 这些在本次只做到"不抛 Error"，完整逻辑留到后续项目。
- 不实现 Phase 7 文章生成业务逻辑 —— 这是项目 4 的范围。
- 不修改 `010_cleanup_legacy.sql` 等迁移文件 —— 这是项目 2 的范围。
- 不移除 `db:query` / `db:exec` —— 这是项目 2 的范围。

## 4. 架构设计

### 4.1 分层职责

| 层级 | 文件位置 | 职责 |
|------|----------|------|
| Handler | `electron/ipc/handlers.ts` | 参数校验、权限检查、调用 Service、返回结果 |
| Service | `electron/services/**/*.ts` | 业务逻辑、事务编排、跨表操作 |
| Repository（可选） | `electron/db/repositories/*.ts` | 单一表/领域的 CRUD SQL |
| DB | `electron/db/connection.ts` | 数据库连接、迁移 |

### 4.2 是否引入 Repository 层

本次**不强制新建 Repository 层**，先把 SQL 下沉到 Service 层。原因：

- 改动量已经很大，再抽 Repository 会进一步增加文件数。
- 现有 `facts/factRepository.ts` 已经存在，可作为后续拆分的参考。
- 后续项目 3–4 中，如果某个 Service 继续膨胀，再独立 Repository。

## 5. 文件变更计划

### 5.1 新建 Service 文件

| 文件 | 整改内容 |
|------|----------|
| `electron/services/projectService.ts` | project CRUD，承接 `project:*` Handler |
| `electron/services/kbService.ts` | knowledge_entries / chunks / facts 查询，承接 `kb:*` Handler |
| `electron/services/facts/factService.ts` | fact CRUD + 审核操作，承接 `fact:*` Handler |
| `electron/services/chat/chatService.ts` | chat_sessions / chat_messages，承接 `assistant:history` 等 |
| `electron/services/agent/taskStateManager.ts` | agent_tasks / steps CRUD，替代 throw Error |
| `electron/services/agent/executionLedger.ts` | execution_ledger 只追加写入，替代 throw Error |
| `electron/services/agent/artifactManager.ts` | agent_artifacts CRUD，替代 throw Error |
| `electron/services/assistant/assistantRunService.ts` | assistant_runs CRUD，替代 throw Error |
| `electron/services/assistant/toolApprovalService.ts` | tool_approvals CRUD，替代 throw Error |
| `electron/services/assistant/assistantQueueService.ts` | assistant_queue_items CRUD，替代 throw Error |

### 5.2 修改现有文件

| 文件 | 整改内容 |
|------|----------|
| `electron/ipc/handlers.ts` | 28 处直接 SQL 改为调用 Service；保留 Zod 校验 |
| `electron/services/agent/geoAgentFactory.ts` | `projectListTool` / `projectCreateTool` 改为调用 `projectService.ts` |
| `electron/services/agent/geoAgentRuntime.ts` | 调用 `taskStateManager` / `executionLedger` / `artifactManager` 记录任务状态，不再直接 SQL |
| `electron/services/assistant/assistantRuntime.ts` | 实现最小运行骨架（至少不抛 Error），调用 Run/Queue/Approval Service |

### 5.3 不修改的文件

- 数据库 schema / 迁移文件
- 前端组件和 `src/lib/electron-api.ts`
- `electron/preload.ts`
- 模型路由、Embedding、RAG 等已实现 Service

## 6. 数据流变化

### 6.1 以 `project:update` 为例

**整改前：**

```text
Renderer → Handler → db.prepare(SQL) → 返回
```

**整改后：**

```text
Renderer → Handler → projectService.update() → db.prepare(SQL) → 返回
```

### 6.2 以 `agentTask:run` 为例

**整改前：**

```text
Renderer → Handler → geoAgentRuntime.runMinimalAgentTask() → 直接 SQL
```

**整改后：**

```text
Renderer → Handler → geoAgentRuntime.runMinimalAgentTask()
  → taskStateManager.createStep()
  → executionLedger.append()
  → artifactManager.createArtifact()
  → 返回
```

## 7. 错误处理

- Service 层统一抛出业务错误，使用现有错误类型或新增轻量错误类：
  - `NotFoundError`：记录不存在
  - `ValidationError`：参数校验失败
  - `ConflictError`：状态冲突（如重复运行）
- Handler 层捕获并转换为统一的 IPC 错误响应。
- 保持现有错误格式，不破坏 Renderer 侧的错误处理。
- 空骨架 Service 在整改后至少提供基本 CRUD，不再无条件 `throw Error`。

## 8. 验收标准

- [ ] `electron/ipc/handlers.ts` 中不再出现业务 SQL 的直接调用（`db.prepare()` / `db.exec()` 仅限初始化/迁移场景）。
- [ ] `electron/services/agent/` 和 `electron/services/assistant/` 中核心 Service 文件不再无条件 `throw Error`。
- [ ] `geoAgentFactory.ts` 中的工具不再直接写 SQL。
- [ ] `npm run lint` 通过。
- [ ] 以下现有功能手动回归正常：
  - 项目新建 / 编辑 / 删除 / 切换
  - 知识库文本/文件录入
  - 企业事实抽取与审核（确认/拒绝/修改）
  - AI 聊天中的 Agent 任务调用

## 9. 风险与回滚

| 风险 | 缓解措施 |
|------|----------|
| 下沉 SQL 时引入回归 bug | 每次改动后运行 `npm run lint`，并对受影响功能做手动回归。 |
| Service 层职责划分不清 | 先按领域简单拆分，避免过度设计；后续项目再细化。 |
| 空骨架 Service 实现过于简单 | 本次只要求"不抛 Error + 基本 CRUD"，完整业务逻辑在后续项目补齐。 |
| 改动量大，review 困难 | 按领域分批提交（project → kb → facts → agent → assistant），每个提交可独立验证。 |

## 10. 后续项目衔接

项目 1 完成后，后续项目顺序：

1. **项目 2：安全与数据稳定** —— 限制 `db:query` / `db:exec`，修复 `010_cleanup_legacy.sql`。
2. **项目 3：Assistant Runtime 完整实现** —— 流式运行、消息服务、队列、工具审批。
3. **项目 4：Phase 7 文章生成 MVP** —— 问题池、信源发现、标题/文章生成、Claim 校验、人工审核。
