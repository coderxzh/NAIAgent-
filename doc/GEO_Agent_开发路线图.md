# GEO Agent 长期开发计划（基于 v1.3 开发文档）

## Context
当前项目已完成 **Phase 0：Electron + React + SQLite + sqlite-vec 工程骨架**（对应原 `electron-eager-lerdorf.md` 计划），包括主进程/preload 构建、IPC（contextBridge + Zod）、数据库迁移、向量扩展加载和打包验证。

`src/App.tsx` 目前是一个 1,570 行的单文件 UI 壳，内置了一个金融主题的 `WeeklyDashboard.tsx` 演示界面和 AI 聊天界面；所有功能数据都是写死的 mock。`doc/GEO_Agent_优化后开发文档_v1.3.md` 定义了完整的 GEO 工作流：知识库录入 → 结构化事实抽取 → 核心问题生成 → 信源推荐 → 文章生成 → 文章审核 → 发布计划与人工确认 → 发稿 → 可见性检测 → 反思规则沉淀。

用户明确要求：**先把仪表盘的 UI 界面写好**，再逐步推进功能。

## Goal
建立一套可支撑 GEO 完整工作流的桌面应用 UI 与功能实现路线。第一阶段聚焦仪表盘 UI 重构与设计系统搭建，为后续功能模块提供一致的组件、布局、主题和导航基础。

## Cross-Cutting Architectural Decisions

| 决策 | 选择 | 理由 |
|---|---|---|
| 路由 | React view-state（无 react-router） | 桌面应用视图有限，`activeView` 状态足够；后续若视图膨胀再引入路由 |
| 全局状态 | React Context + hooks | MVP 阶段足够；若性能或复杂度增长再迁移到 Zustand |
| 组件库 | **shadcn/ui** 作为基础 UI primitive；**ApexCharts**（`react-apexcharts`）作为仪表盘图表组件；**Vercel AI Elements** 作为 Chatbox 智能助手组件 | 减少从零写组件的工作量；shadcn/ui 与 Tailwind v4 风格一致；ApexCharts 视觉更现代、交互丰富；AI Elements 封装聊天 UI 模式 |
| 主题 | CSS 自定义属性 + Tailwind dark variant | 已有手动 dark 模式切换，需形式化为 ThemeProvider |
| 前后端数据层 | 前端 `src/services/` → IPC `dbApi` → 后端 handlers → SQLite | 现在前端直接调 `dbApi.query/exec`，需封装为按领域的服务层 |
| 类型安全 | 共享 `src/types/domain.ts` + Zod IPC 校验 | 保证前后端实体一致；`electron/ipc/schemas.ts` 继续扩展 |

## Phase Overview

| 阶段 | 名称 | 预估时间 | 目标 |
|:---|:---|:---|:---|
| Phase 0 | Electron + SQLite 骨架 | 已完成 | 桌面应用基础、数据库、IPC、打包 |
| **Phase 1** | **仪表盘 UI 与设计系统** | **1.5 周** | **替换金融演示仪表盘；引入 shadcn/ui + ApexCharts + AI Elements；拆分布局与视图** |
| Phase 2 | 架构与状态基础 | 1.5 周 | 全局 Context、视图路由、前端 service 层、类型整合 |
| Phase 3 | 企业知识库管理 | 2 周 | 项目/KB 创建、资料录入（文本/文件）、资产列表 |
| Phase 4 | 向量检索与知识库问答 | 1.5 周 | 文档解析、切片、embedding、sqlite-vec 检索、RAG 问答 |
| Phase 5 | 结构化事实抽取 | 1.5 周 | 抽取企业事实、人工确认/编辑、`enterprise_facts` 管理 |
| Phase 6 | GEO 工作流引擎 | 2 周 | `geo_runs/steps` 持久化、可恢复工作流、暂停/继续/重跑 |
| Phase 7 | 问题生成与信源推荐 | 1.5 周 | 核心 GEO 问题生成、发稿渠道推荐 |
| Phase 8 | 文章生成与审核 | 2 周 | 支撑类/排行榜文章生成、合规与事实审核、稿件编辑 |
| Phase 9 | 发布与可见性检测 | 1.5 周 | 发布计划、人工确认、发稿 API、AI 引用检测 |
| Phase 10 | 反思规则与收尾 | 1.5 周 | 候选规则生成、规则确认、规则库、IPC 加固、打包验证 |

**总工期（Phase 1-10）**：约 14–15 周。

---

## Phase 1：仪表盘 UI 与设计系统（2 周）

### 目标
替换现有金融演示仪表盘，构建面向 GEO 业务的真实仪表盘；同时建立可复用的 UI primitive、主题系统和导航布局，让后续功能模块有统一的开发基础。

### 为什么先做这一步
- `App.tsx` 当前是 1,570 行单文件，混合了侧边栏、视图路由、AI 聊天、弹窗和演示数据，难以继续堆功能。
- `WeeklyDashboard.tsx` 是金融主题演示（钱包、交易、信用卡），与 GEO 业务无关，必须替换。
- 后续所有功能（知识库、工作流、稿件、发布、可见性）都需要在统一的仪表盘和导航中呈现。

### 任务拆解

#### 1.1 安装与配置第三方组件库
在写业务组件之前，先把三个库装好并配置到 Vite + Tailwind v4 + React 19 + Electron 环境里：
- **shadcn/ui**：通过 `pnpm dlx skills add shadcn/ui` 安装并按 skill 指引完成 Vite 适配（配置 `@/components` 路径别名、`tailwindcss-animate`、dark mode 类）。
- **ApexCharts**：`npm install apexcharts react-apexcharts`。ApexCharts 不是 Tailwind 原生，但视觉现代、交互丰富；需要在 `src/index.css` 中统一图表主题色（主色 `#F37021`、暗色背景等）。
- **Vercel AI Elements**：通过 `npx skills add vercel/ai-elements` 安装，按 skill 说明注册到聊天组件。
- 更新 `src/index.css`：统一品牌色 CSS 变量、dark variant、ApexCharts 主题变量。

#### 1.2 主题系统形式化
- 创建 `src/context/ThemeContext.tsx`，管理 `isDarkMode`、`lang`，并向根节点注入 `dark` class。
- 把 `App.tsx` 里的 `cls()` 辅助函数和明暗切换逻辑迁移到 context。
- 用 shadcn/ui 的 `ThemeProvider` 模式（如可用）或自定义 context 提供全局主题。

#### 1.3 布局组件拆分（基于 shadcn/ui）
- 创建 `src/components/layout/Sidebar.tsx`：从 `App.tsx` 拆出侧边栏。
  - 使用 shadcn `Button`、`Tooltip`、`Sheet`（移动端抽屉）。
  - 主菜单：Dashboard、AI Agent、Drafts、Auto Learning、AI Web Builder。
  - 企业区：把硬编码 team 列表改为 `projects` 数据驱动（Phase 3 填充真实数据，Phase 1 先做空状态/骨架）。
- 创建 `src/components/layout/Header.tsx`：顶部栏，包含语言切换、暗色切换、通知、设置、当前项目/KB 选择器占位。
- 创建 `src/components/layout/LayoutShell.tsx`：Sidebar + Header + Main Content 组合。

#### 1.4 GEO 仪表盘 `src/components/dashboard/`（基于 shadcn/ui + ApexCharts）
删除 `src/components/WeeklyDashboard.tsx`，替换为以下模块：
- `DashboardView.tsx` — 仪表盘总容器。
- `StatCards.tsx` — 使用 shadcn `Card` 展示项目总数、已索引知识库数、生成稿件数、已发布文章数、可见性命中率、待处理事项数。
- `ActivityChart.tsx` — 使用 ApexCharts 面积图/柱状图展示最近 7/30 天 GEO 运行次数或文章产出趋势。
- `ActionItemsPanel.tsx` — 使用 shadcn `Card` + `Badge` + `Button` 展示待处理任务（事实待确认、文章待审核、发布待确认等）。
- `RecentActivityFeed.tsx` — 最近 GEO 运行、发布记录、可见性检测的精简时间线。
- `QuickStartCards.tsx` — 快捷入口：创建知识库、开始 GEO 优化、查看稿件、检测可见性。
- `KbHealthPanel.tsx` — 知识库健康度：事实完整度、缺失字段、已索引资产（可用 shadcn `Progress` 或 ApexCharts radialBar）。

所有 widget 都必须具备：
- 加载骨架屏（shadcn `Skeleton`）。
- 零数据空状态（自定义 `EmptyState` 组件）。
- 暗色模式样式。

#### 1.5 Chatbox 智能助手接入 Vercel AI Elements
- 把 `App.tsx` 中的 AI 聊天逻辑拆到 `src/components/chat/ChatInterface.tsx`。
- 用 AI Elements 替换手写 message list、输入框、加载指示、文件 chips 等。
- 保持与现有 `window.electronAPI` 的调用方式，或按 AI Elements 要求接入自定义 fetch/invoke。

#### 1.6 `App.tsx` 瘦身
- 将 `App.tsx` 缩减到约 200 行：只保留 ThemeProvider、ViewProvider（Phase 2 引入，Phase 1 可先用 local state 占位）、LayoutShell、视图 switch。
- 删除写死的金融 mock 数据和与 GEO 无关的弹窗。

### 关键文件

| 文件 | 操作 |
|---|---|
| `src/App.tsx` | 大幅重构为布局壳 |
| `src/components/WeeklyDashboard.tsx` | 删除，替换为 GEO 仪表盘 |
| `src/components/ui/` | shadcn/ui 安装后自动/半自动生成的 primitive 组件目录 |
| `src/components/layout/Sidebar.tsx` | 新建 |
| `src/components/layout/Header.tsx` | 新建 |
| `src/components/layout/LayoutShell.tsx` | 新建 |
| `src/components/dashboard/*.tsx` | 新建仪表盘视图与 widget（基于 shadcn + ApexCharts） |
| `src/components/chat/ChatInterface.tsx` | 新建，从 App.tsx 迁出，接入 Vercel AI Elements |
| `src/context/ThemeContext.tsx` | 新建 |
| `src/hooks/use-theme.ts` | 新建 |
| `src/index.css` | 增加品牌/ApexCharts 主题变量、dark variant |

### 验收标准
- [ ] shadcn/ui、ApexCharts、Vercel AI Elements 安装完成且能在 Electron 中正常渲染。
- [ ] `App.tsx` 控制在 250 行以内，只负责布局 + 视图路由。
- [ ] 侧边栏、Header、仪表盘均为独立组件。
- [ ] 仪表盘展示 GEO 业务指标（可用 mock 数据），使用 ApexCharts 图表和 shadcn 组件，每个 widget 都有空状态。
- [ ] Chatbox 使用 Vercel AI Elements 组件渲染消息、输入和加载状态。
- [ ] 明暗模式、语言切换全局生效。
- [ ] `npm run dev` 正常启动，`npm run lint` 无 TypeScript 错误。

### 验证步骤
```bash
cd /Users/hurry/Documents/NAIAgent-
npm run lint
npm run dev
# 手动检查：侧边栏折叠、暗色切换、仪表盘渲染、空状态可见
```

---

## Phase 2：架构与状态基础（1.5 周）

### 目标
引入全局状态、视图路由上下文和前端 service 层，把目前直接调 `dbApi.query/exec` 的散状代码抽象为按领域的服务。

### 任务
- **ViewContext**：`src/context/ViewContext.tsx` 提供 `activeView`、`navigateTo(view)`、`viewParams`。
- **AppStateContext**：`src/context/AppStateContext.tsx` 保存 `currentProject`、`currentKnowledgeBase`、`currentRun`、`currentChatSession`。
- **领域服务层**：在 `src/services/` 下创建：
  - `projectService.ts`
  - `knowledgeBaseService.ts`
  - `chatService.ts`
  - `geoRunService.ts`
  - `draftService.ts`（对应 `geo_artifacts`）
  - `publishService.ts`
  - `visibilityService.ts`
  - `reflectionService.ts`
  - `factService.ts`
- **共享类型**：`src/types/domain.ts` 定义所有领域实体接口，与 SQL schema 对齐。
- **扩展 IPC wrapper**：在 `src/lib/electron-api.ts` 增加面向服务的 invoke 方法（或先复用 `dbApi.query/exec`，由 service 层拼 SQL）。

### 关键文件
- `src/context/ViewContext.tsx`
- `src/context/AppStateContext.tsx`
- `src/services/*.ts`
- `src/types/domain.ts`
- `src/lib/electron-api.ts`

### 验收标准
- [ ] 所有数据库表都有对应 TypeScript 接口。
- [ ] 组件中不再直接调用 `dbApi.query/exec`，全部走 service。
- [ ] `App.tsx` 使用 context 管理全局视图和当前项目/KB。
- [ ] `npm run lint` 通过。

---

## Phase 3：企业知识库管理（2 周）

### 目标
实现项目和企业知识库的 CRUD，支持文本粘贴与文件上传录入。

### 任务
- 项目 CRUD UI：`src/components/projects/ProjectList.tsx`、`ProjectForm.tsx`。
- 知识库 CRUD UI：`src/components/knowledge-base/KbList.tsx`、`KbForm.tsx`。
- 录入 UI：`KbIngestPanel.tsx`（文本粘贴区、文件选择、进度提示）。
- 资产列表：`KbEntriesList.tsx` 展示 `knowledge_entries` 及其状态。
- 后端：扩展 `electron/ipc/handlers.ts` 增加 `kb:create`、`kb:list`、`kb:select`、`kb:ingest-text`、`kb:ingest-file`（或用 service 层直接走 `db:query/exec`）。

### 关键文件
- `src/components/projects/*.tsx`
- `src/components/knowledge-base/*.tsx`
- `src/services/projectService.ts`
- `src/services/knowledgeBaseService.ts`
- `electron/ipc/channels.ts`、`schemas.ts`、`handlers.ts`

### 验收标准
- [ ] 可创建项目、在项目下创建知识库。
- [ ] 可粘贴文本或选择文件录入知识库。
- [ ] 侧边栏企业区能显示真实项目列表并切换当前 KB。
- [ ] 录入记录写入 `knowledge_entries` 表。

---

## Phase 4：向量检索与知识库问答（1.5 周）

### 目标
完成文档解析、文本切片、embedding 生成、sqlite-vec 存储，并在公共聊天中提供基于知识库的 RAG 问答。

### 任务
- 文档解析服务：`electron/services/parser.ts`（支持 Word/PDF/Excel/纯文本）。
- 切片服务：`electron/services/chunker.ts`（固定长度 + 重叠）。
- Embedding 服务：`electron/services/embedding.ts`（调用豆包/Ark Embedding API）。
- VectorStore adapter：`electron/services/vectorStore.ts`，封装 sqlite-vec 写入与查询。
- RAG 聊天：在 `ChatInterface.tsx` 中新增知识库问答模式：query → embed → vector search → 取 chunk → LLM 回答并引用来源。

### 关键文件
- `electron/services/parser.ts`
- `electron/services/chunker.ts`
- `electron/services/embedding.ts`
- `electron/services/vectorStore.ts`
- `src/components/chat/ChatInterface.tsx`
- `src/services/chatService.ts`

### 验收标准
- [ ] 上传 PDF/Word 后能在 SQLite 中看到 chunks 和 vectors。
- [ ] 在聊天中提问可检索到相关原文片段并生成带引用的回答。
- [ ] 回答严格基于当前选择的知识库。

---

## Phase 5：结构化事实抽取（1.5 周）

### 目标
从知识库资料中抽取结构化企业事实，提供人工确认/编辑/驳回工作流。

### 任务
- 事实抽取触发：资料录入后调用 `knowledge-base-ingest` Skill（初期可用简单规则/mock，后续接 LLM）。
- 事实审阅 UI：`src/components/facts/FactReviewPanel.tsx`，按字段展示 `field_key`、`value_json`、`confidence`、`source_quote`、`status`。
- 用户操作：确认（`confirmed`）、驳回（`rejected`）、编辑后确认、标记需复核（`needs_review`）。
- 缺失字段提示：根据 schema 提示用户补充资料。
- 后端：`enterprise_facts` CRUD service。

### 关键文件
- `src/components/facts/FactReviewPanel.tsx`
- `src/services/factService.ts`
- `electron/services/factExtractor.ts`

### 验收标准
- [ ] 知识库录入后可触发事实抽取。
- [ ] 用户能逐条审阅、编辑、确认/驳回事实。
- [ ] 确认后的事实写入 `enterprise_facts`。

---

## Phase 6：GEO 工作流引擎（2 周）

### 目标
实现可恢复、可暂停、可重跑的 GEO 工作流，支撑文档中的 12 个阶段。

### 任务
- 工作流编排器：`electron/services/workflowEngine.ts`，管理 `geo_runs` / `geo_run_steps` 状态机。
- 阶段实现：按文档 Stage 0–11 逐步落地。
- 暂停点：在需要人工确认/审核的阶段写入 `awaiting_*` 状态。
- UI：`src/components/workflow/WorkflowRunner.tsx`（当前运行视图）、`RunList.tsx`（历史列表）、`StepDetail.tsx`（阶段详情）。
- 操作：开始、暂停、继续、取消、从指定阶段重跑。

### 关键文件
- `electron/services/workflowEngine.ts`
- `src/services/geoRunService.ts`
- `src/components/workflow/*.tsx`

### 验收标准
- [ ] 用户可从知识库启动一个 GEO run。
- [ ] 每个阶段写入 `geo_run_steps`。
- [ ] 运行可在人工确认点暂停，用户确认后继续。
- [ ] 支持取消和阶段重跑。

---

## Phase 7：问题生成与信源推荐（1.5 周）

### 目标
基于企业事实和知识库生成 GEO 核心问题，并推荐发稿渠道。

### 任务
- 问题生成：`question-generation` Skill，输出支撑类/排行榜类问题。
- 问题审阅 UI：`src/components/questions/QuestionGenerator.tsx`，支持编辑、删除、重新生成。
- 渠道推荐：`source-recommendation` Skill，输出渠道列表（portal/vertical/social/local/self_media）及评分、理由、预估价格。
- 渠道推荐 UI：`src/components/channels/ChannelRecommender.tsx`。
- 产物保存：问题与推荐结果存为 `geo_artifacts`。

### 关键文件
- `src/components/questions/QuestionGenerator.tsx`
- `src/components/channels/ChannelRecommender.tsx`
- `src/services/questionService.ts`
- `src/services/channelService.ts`
- `electron/services/workflowEngine.ts`

### 验收标准
- [ ] 每个 run 可生成 5–10 个 GEO 问题。
- [ ] 用户可编辑、重新生成问题。
- [ ] 渠道推荐带评分、理由、价格，用户可选择。

---

## Phase 8：文章生成与审核（2 周）

### 目标
基于事实、RAG、问题、规则生成文章，并完成事实/合规/广告法/E-E-A-T 审核。

### 任务
- 文章生成：`article-generate` Skill，输出标题、摘要、正文 Markdown、FAQ、claims、风险词。
- 文章编辑器：`src/components/drafts/DraftEditor.tsx`（Markdown 编辑器）。
- 文章审核：`article-review` Skill，输出事实风险、合规风险、SEO/GEO 评分、修改建议。
- 审核面板：`src/components/drafts/ArticleReviewPanel.tsx`。
- claims 追踪：在编辑器中高亮显示每条 claim 的来源与置信度。

### 关键文件
- `src/components/drafts/*.tsx`
- `src/services/draftService.ts`
- `src/services/reviewService.ts`
- `electron/services/workflowEngine.ts`

### 验收标准
- [ ] 可生成支撑类/排行榜类文章。
- [ ] 审核结果能指出无证据 claim、绝对化用语、SEO/GEO 改进点。
- [ ] 用户可编辑文章并重新审核。
- [ ] 稿件保存为 `geo_artifacts`。

---

## Phase 9：发布与可见性检测（1.5 周）

### 目标
生成发布计划、用户确认后调用发稿平台 API、保存发布记录、检测 AI 是否引用已发布 URL。

### 任务
- 发布计划 UI：`src/components/publish/PublishPlan.tsx`，展示推荐渠道、标题、正文、价格。
- 发布确认 UI：`src/components/publish/PublishApproval.tsx`，用户确认/拒绝。
- 发稿 API：在 main process 中封装发布平台调用（初期可 mock），写入 `publish_records`。
- 可见性检测：`src/components/visibility/VisibilityChecker.tsx`，按核心问题调用 AI 接口，分析回答中是否出现已发布 URL。
- 可见性结果保存到 `visibility_checks`。

### 关键文件
- `src/components/publish/*.tsx`
- `src/components/visibility/*.tsx`
- `src/services/publishService.ts`
- `src/services/visibilityService.ts`
- `electron/services/publisher.ts`
- `electron/services/visibilityChecker.ts`

### 验收标准
- [ ] 用户可审阅并确认发布计划。
- [ ] 发布后生成 `publish_records` 并跟踪状态。
- [ ] 可见性检测能报告 URL 是否被 AI 引用及引用片段。

---

## Phase 10：反思规则与收尾（1.5 周）

### 目标
从可见性结果生成候选反思规则，经人工确认后进入规则库，并影响后续生成；同时完成 IPC 加固和打包验证。

### 任务
- 候选规则生成：`reflection-generate` Skill 分析 `visibility_checks` 输出规则候选。
- 规则审阅 UI：`src/components/reflection/RuleReview.tsx`。
- 规则库 UI：`src/components/reflection/RuleLibrary.tsx`，按 scope（global / industry）、target_stage、status 浏览。
- 规则应用：`reflection-apply` Skill 在文章生成/问题生成阶段注入已确认规则。
- IPC 加固：所有新增 channel 补充 Zod schema；文件上传改为 file token 机制。
- 打包验证：运行 `npm run dist` 或 `npm run pack`，确认 sqlite-vec 原生模块正确解压。

### 关键文件
- `src/components/reflection/*.tsx`
- `src/services/reflectionService.ts`
- `electron/ipc/channels.ts`、`schemas.ts`、`handlers.ts`
- `electron-builder.yml`

### 验收标准
- [ ] 可见性结果可生成候选规则。
- [ ] 用户可确认/驳回/归档规则。
- [ ] 已确认规则影响后续文章/问题生成。
- [ ] 所有 IPC channel 有 Zod 校验。
- [ ] `npm run dist` / `npm run pack` 成功。

---

## 依赖关系

```
Phase 1 仪表盘 UI
    │
    ▼
Phase 2 架构/状态/服务层
    │
    ▼
Phase 3 知识库管理 ──► Phase 4 向量检索/问答 ──► Phase 5 事实抽取
                                              │
                                              ▼
                                       Phase 6 GEO 工作流引擎
                                              │
        ┌─────────────────────────────────────┼─────────────────────────────────────┐
        ▼                                     ▼                                     ▼
   Phase 7 问题/渠道                    Phase 8 文章生成/审核                  Phase 9 发布/可见性
        │                                     │                                     │
        └─────────────────────────────────────┴─────────────────────────────────────┘
                                              │
                                              ▼
                                       Phase 10 反思规则/收尾
```

---

## 风险与应对

| 风险 | 应对 |
|---|---|
| `App.tsx` 重构引入回归 | 分步迁移，保留旧代码注释直到新组件稳定；每完成一个视图就 `npm run dev` 验证 |
| sqlite-vec / ApexCharts 打包兼容性 | Phase 1 就验证 `npm run pack`；保持 `asarUnpack` 和 sqlite-vec 解压路径回退；ApexCharts 为纯 JS 库，打包风险低 |
| LLM API 延迟/成本 | 所有调用写入 `model_call_logs`；embedding 结果可缓存 |
| 大文件解析阻塞 UI | 文档解析放在 main process，前端通过 IPC 事件展示进度 |
| 类型前后端漂移 | 统一 `src/types/domain.ts`；IPC 入参全部 Zod 校验 |
| 反思规则误学习 | 候选规则必须人工确认，不允许自动生效 |

---

## 下一步
按用户要求，立即进入 **Phase 1：仪表盘 UI 与设计系统**。先从 `src/App.tsx` 拆分和 `src/components/ui/` 基础组件开始，再替换 `WeeklyDashboard.tsx` 为 GEO 仪表盘。
