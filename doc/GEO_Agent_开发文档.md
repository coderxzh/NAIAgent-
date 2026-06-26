# GEO Agent 开发文档

## 1. 项目定位

GEO Agent 是一个本地优先的企业知识库与 GEO 内容优化桌面应用。它面向的不是传统 SEO，而是 AI 搜索、AI 助手、联网问答和生成式检索场景。

产品目标是帮助企业把真实资料沉淀为结构化知识，再基于这些知识生成更容易被豆包助手等 AI 系统发现、理解、引用和采纳的内容。

核心闭环：

```text
企业资料
↓
文本清洗、结构识别、语义切片
↓
企业事实抽取与人工确认
↓
豆包 Embedding + FTS5 + sqlite-vec
↓
Hybrid Retrieval / Evidence Pack
↓
目标问题生成、信源发现、文章生成
↓
人工审核与发布审批
↓
渠道发布
↓
豆包助手联网搜索可见性检查
↓
优化假设沉淀、验证与迭代
```

GEO Agent 的产品本质：

```text
Data → Knowledge → Retrieval → Content → Distribution → Visibility → Hypothesis → Optimization
```

---

## 2. 产品边界

### 2.1 当前版本能力（按阶段交付）

当前版本能力对应路线图 [GEO_Agent_长期开发路线图.md](GEO_Agent_长期开发路线图.md) 的 Phase 2–Phase 11，总工期约 19–20.5 周。以下按交付阶段组织，避免把全量能力误当成一个 Sprint 的目标。

#### Phase 2：架构、状态、模型路由与 Assistant 基础

```text
13. Assistant Runtime 基础骨架
14. 豆包 Responses stream
15. DeepSeek Chat Completions stream
29. 超时、重试、熔断、幂等（基础配置）
```

#### Phase 3：公司知识库与公共对话历史

```text
1.  本地项目 / 公司管理
11. 公共智能 Agent 对话
12. 公共对话历史
```

#### Phase 4：文件清洗、语义切片与豆包 Embedding

```text
2. 企业资料录入
3. 文本清洗与语义切片
4. 豆包 Embedding 向量化
```

#### Phase 5：Hybrid Retrieval 与 Evidence Pack

```text
5. SQLite + sqlite-vec 本地向量检索
6. SQLite FTS5 关键词检索
7. Hybrid Retrieval
8. Evidence Pack
```

#### Phase 6：企业事实抽取与确认

```text
9.  DeepSeek 企业事实抽取
10. 人工确认企业事实
```

#### Phase 7：Assistant Runtime、流式事件、工具审批与队列

```text
16. 工具调用、工具审批、任务队列
28. 全局错误记录
29. 超时、重试、熔断、幂等（完整实现）
```

#### Phase 8：Agent-first Task Runtime + Skill Package

```text
17. Agent-first Task Runtime
18. 目标问题生成
19. 信源发现
20. GEO 文章生成
21. Claim 初筛审核
22. GEO 风格复核
```

#### Phase 9：发布与豆包助手可见性检测

```text
23. 发布计划
24. 人工确认发布
25. 发布记录
26. 豆包助手可见性检查
```

#### Phase 10：优化假设、错误恢复与收尾

```text
27. 优化假设候选
```

### 2.2 当前版本不做的能力

```text
1. 云端多人协作
2. 团队权限系统
3. 自动付费发稿平台大规模接入
4. 无人工确认的自动发布
5. 多租户 SaaS 架构
6. 自训练模型
7. 云端向量数据库
8. 跨设备实时同步
```

---

## 3. 技术栈

### 3.1 桌面端

```text
Electron
Electron Main Process
Preload IPC Bridge
Renderer Process
```

### 3.2 前端

```text
React
TypeScript
Vite
Tailwind CSS
shadcn/ui
AI Elements
ApexCharts
React Context
custom hooks
```

### 3.3 本地数据层

```text
SQLite
better-sqlite3
sqlite-vec
FTS5
本地文件系统
```

### 3.4 模型与 AI 能力

```text
豆包 Responses API
豆包 Responses API stream
豆包 doubao_app tool
豆包 Embedding / Ark Embedding 接入点
DeepSeek Chat Completions API
DeepSeek Chat Completions stream
DeepSeek thinking mode
DeepSeek JSON Output
DeepSeek Tool Calls
```

---

## 4. 总体架构

```text
Renderer UI
├── Dashboard
├── Project Management
├── Intelligent Agent
├── Draft Management
├── Auto Learning
├── Enterprise Area
└── Settings

Preload
└── Safe IPC Bridge

Electron Main
├── IPC Handlers
├── Assistant Runtime
├── GeoAgentRuntime
├── AgentContextBuilder
├── AllowedActionPolicy
├── Dynamic Tool Registry
├── ToolGuard
├── ApprovalManager
├── ResultValidator
├── RetryManager
├── LoopGuard
├── RecoveryManager
├── ExecutionLedger
├── Model Router
├── Doubao Responses Client
├── Doubao Assistant Visibility Client
├── DeepSeek Chat Client
├── Embedding Provider
├── Retrieval Services
├── Skill Runtime
├── Tool Runtime
├── Error Service
└── SQLite Services

SQLite
├── projects
├── knowledge_entries
├── knowledge_chunks
├── knowledge_chunk_vectors
├── vector_store_meta
├── knowledge_chunk_fts
├── enterprise_facts
├── chat_sessions
├── chat_messages
├── assistant_runs
├── assistant_stream_events
├── assistant_reasoning_steps
├── assistant_tool_calls
├── tool_approvals
├── assistant_queue_items
├── agent_tasks
├── agent_task_steps
├── agent_artifacts
├── agent_locks
├── execution_ledger
├── publish_records
├── visibility_checks
├── reflection_hypotheses
├── reflection_hypothesis_evidence
├── model_call_logs
├── retrieval_logs
├── app_errors
└── app_settings
```

---

## 5. 核心概念

### 5.1 project = 公司 = 知识库

当前产品不再使用多层级的 `project → knowledge_base` 模型。

统一定义：

```text
project = company = knowledge base
```

统一字段：

```text
project_id
currentProject
```

禁止继续使用：

```text
knowledge_base_id
currentKnowledgeBase
kbId
```

Schema 说明：

```text
001_init.sql 已按最终 schema 创建：knowledge_entries 直接持有 project_id，不再创建 knowledge_bases。
003_drop_kb.sql 仅用于已有数据库迁移，将旧 kb_id 结构迁到 project_id。
```

### 5.2 公共对话历史

智能 Agent 的对话历史是公共的，不绑定固定公司或知识库。

规则：

```text
chat_session 是公共对话
chat_message 可以记录当时关联 project_id
tool_call 必须记录实际操作 project_id
agent_task 必须绑定实际操作 project_id
```

---

## 6. 模型分工

| 任务 | Provider | API 模式 | 说明 |
| --- | --- | --- | --- |
| 信源发现 | 豆包 | Responses API | 面向豆包生态的信源判断 |
| 文章生成 | 豆包 | Responses API stream | 面向 GEO 内容生成 |
| GEO 风格复核 | 豆包 | Responses API | 判断是否更适合豆包理解和引用 |
| 豆包可见性检查 | 豆包助手 | Responses API + doubao_app | `ai_search` / `reasoning_search` |
| 反思验证 | 豆包 | Responses API | 检查优化假设是否符合豆包生态 |
| 向量化 | 豆包 Embedding | Embedding API | 企业知识库检索 |
| 企业事实抽取 | DeepSeek | Chat Completions API | JSON Output + thinking |
| 对话摘要 | DeepSeek | Chat Completions API | 快速摘要 |
| 上下文压缩 | DeepSeek | Chat Completions API | JSON Output |
| Agent 任务规划辅助 | DeepSeek | Chat Completions API stream | 内部规划 |
| Claim 初筛审核 | DeepSeek | Chat Completions API | 事实一致性初筛 |
| 反思候选生成 | DeepSeek | Chat Completions API | 提出候选假设 |

最终边界：

```text
豆包 = GEO Target Model
DeepSeek = Agent Runtime Utility Model
SQLite + Assistant Runtime = 权威状态源
```

详细的环境变量、路由表、调用示例和错误处理见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 7. ProviderApiMode

```typescript
type ProviderApiMode =
  | 'responses'          // 豆包文本生成、豆包助手 doubao_app
  | 'chat_completions'   // DeepSeek
  | 'embeddings';        // 豆包 Embedding
```

### 7.1 ModelRoute

```typescript
type ModelRoute = {
  role: ModelRole;
  provider: 'doubao' | 'deepseek';
  apiMode: ProviderApiMode;
  model: string;
  stream: boolean;
  skill?: string;
  promptVersion?: string;
  toolType?: 'none' | 'function' | 'doubao_app';
  doubaoAppFeature?: 'chat' | 'deep_chat' | 'ai_search' | 'reasoning_search';
  thinking?: boolean;
  reasoningEffort?: 'low' | 'medium' | 'high';
  responseFormat?: 'text' | 'json_object' | 'json_schema';
};
```

完整路由表和调用示例见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 8. 豆包 API 接入

豆包文本任务统一使用 Responses API。

适用任务：

```text
source_discovery
article_generation
geo_style_review
reflection_validation
普通智能助手回答中需要豆包目标能力的部分
```

Responses API 非流式/流式调用、结构化输出、Embedding、豆包助手可见性检查的详细接入方式见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 9. 豆包助手可见性检查

默认可见性检查：

```text
Responses API + doubao_app tool + ai_search
```

深度可见性检查：

```text
Responses API + doubao_app tool + reasoning_search
```

本地处理流程：

```text
doubao_app ai_search
  ↓
解析 search event / output text
  ↓
本地判断 cited / mentioned / citation_urls
  ↓
写入 visibility_checks
  ↓
写入 reflection_hypothesis_evidence
```

可见性检查不得通过 Function Calling 入库。详细请求示例、stream 事件映射和当前 API 限制见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 10. DeepSeek API 接入

DeepSeek 使用 Chat Completions API，不使用 Responses API。

DeepSeek 支持：

```text
stream=true
thinking mode
JSON Output
Tool Calls
Context Cache
```

DeepSeek thinking mode 可能返回 `reasoning_content` 和 `content`：

```text
reasoning_content 不直接展示给用户
reasoning_content 可用于内部调试、日志或生成步骤摘要
前端只展示可审计的 reasoning_step 摘要
```

详细调用示例、Thinking Mode、JSON Output、Tool Calls 和错误处理见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 11. Embedding 与向量库

### 11.1 配置

```env
ARK_EMBEDDING_PROVIDER=doubao
ARK_EMBEDDING_MODEL=ep-m-20260607131442-fs2xm
ARK_EMBEDDING_DIMENSIONS=2048
```

### 11.2 Query / Corpus instructions

如果接入点支持 instructions：

```env
ARK_EMBEDDING_QUERY_INSTRUCTIONS=Target_modality: text. Instruction: Represent the user query for retrieving relevant enterprise knowledge chunks.
ARK_EMBEDDING_CORPUS_INSTRUCTIONS=Target_modality: text. Instruction: Represent this enterprise knowledge chunk for retrieval by user questions.
```

如果不支持，代码自动降级为不传。

### 11.3 维度一致性

`vector_store_meta` 必须记录：

```text
embedding_provider
embedding_model
embedding_dim
index_status
last_reindex_at
```

如果模型或维度变化：

```text
禁止写入旧向量表
标记 needs_reindex
提示用户重新索引
```

---

## 12. 知识库录入、清洗与切片

### 12.1 录入链路

```text
文件 / 文本输入
↓
fileParser
↓
textCleaner
↓
structureDetector
↓
semanticChunker
↓
chunkQualityScorer
↓
DoubaoEmbeddingProvider
↓
VectorStore Adapter
↓
sqlite-vec + FTS5
```

### 12.2 清洗内容

```text
页眉页脚
目录
重复版权信息
乱码
空行
重复段落
表格结构
标题层级
来源页码
```

### 12.3 切片策略

| 内容类型 | 策略 |
| --- | --- |
| 普通段落 | 500–800 中文字 |
| FAQ | 一问一答一个 chunk |
| 表格 | 整表一个 chunk |
| 案例 | 背景 + 需求 + 方案 + 结果不拆断 |
| 联系方式 | 独立 fact chunk |
| 资质 / 荣誉 | 独立 fact chunk |
| 产品 / 服务 | 按服务项切分 |

---

## 13. Hybrid Retrieval 与 Evidence Pack

检索链路：

```text
用户问题 / Agent 当前任务输入
↓
Query Understanding
↓
Fact Search
↓
FTS5 Keyword Search
↓
Vector Search
↓
Rerank
↓
Evidence Pack
```

Evidence Pack：

```typescript
type EvidencePack = {
  facts: EnterpriseFact[];
  chunks: KnowledgeChunk[];
  keywordHits: KeywordHit[];
  vectorHits: VectorHit[];
  missingFields: string[];
  riskWarnings: string[];
};
```

排序优先级：

```text
confirmed facts
> exact keyword match
> high-quality vector chunks
> low-confidence chunks
```

---

## 14. 企业事实抽取

模型：

```text
DeepSeek Chat Completions API
DeepSeek Pro Model
thinking enabled
JSON Output
```

抽取目标：

```text
企业名全称
├── 简称/品牌名
├── 详细经营地址
├── 服务区域
├── 行业分类
├── 产品与服务
├── 关联品牌
├── 目标客户
├── 核心优势
├── 信任背书
├── 用户痛点
├── 客户案例
├── 联系方式
└── 派生关键词
```

字段说明：

```text
派生关键词：不是从原文直接抽取的事实，而是由企业名、产品服务、核心优势等字段生成，用于 GEO 关键词扩展。
联系方式：fact_value 建议支持结构化子字段，如 phone、email、website、address。
```

映射到 `enterprise_facts.fact_type`：

```text
full_name          企业名全称
short_name         简称/品牌名
detailed_address   详细经营地址
service_area       服务区域
industry           行业分类
products_services  产品与服务
related_brands     关联品牌
target_customers   目标客户
core_advantages    核心优势
trust_backing      信任背书
pain_points        用户痛点
customer_cases     客户案例
contact            联系方式
derived_keywords   派生关键词
```

事实状态：

```text
candidate
confirmed
rejected
deprecated
```

每条事实必须保留：

```text
source_entry_id
source_chunk_id
source_quote
confidence
extraction_model
extraction_prompt_version
```

---

## 15. Assistant Runtime

核心服务：

```text
assistantRuntime.ts
streamManager.ts
assistantRunService.ts
assistantMessageService.ts
assistantEventStore.ts
reasoningStepService.ts
toolCallService.ts
toolApprovalService.ts
assistantQueueService.ts
```

核心表：

```text
assistant_runs
assistant_stream_events
assistant_reasoning_steps
assistant_tool_calls
tool_approvals
assistant_queue_items
```

统一事件：

```typescript
type AssistantStreamEvent =
  | { type: 'message_start'; messageId: number; runId?: number; requestId: string }
  | { type: 'text_delta'; messageId: number; delta: string }
  | { type: 'reasoning_step'; stepId: string; title: string; content: string; status: string }
  | { type: 'tool_call_requested'; toolCallId: number; toolName: string; argumentsPreview: unknown; approvalRequired: boolean }
  | { type: 'approval_requested'; approvalId: number; toolCallId: number; title: string; description?: string }
  | { type: 'tool_call_result'; toolCallId: number; resultSummary: string }
  | { type: 'queue_item_updated'; item: AssistantQueueItem }
  | { type: 'message_completed'; messageId: number }
  | { type: 'message_interrupted'; messageId: number; reason: string }
  | { type: 'error'; errorId?: number; message: string; recoverable: boolean; retryable: boolean };
```

---

## 16. 公共对话历史

表：

```text
chat_sessions
chat_messages（含 render_json TEXT，用于 Message Parts 恢复）
```

Message Parts：

```typescript
type MessagePart =
  | { type: 'text'; content: string }
  | { type: 'markdown'; content: string }
  | { type: 'attachment'; attachmentIds: number[] }
  | { type: 'tool_call'; toolCallId: number }
  | { type: 'approval_request'; approvalId: number }
  | { type: 'artifact'; artifactId: number; artifactType: string; title: string }
  | { type: 'sources'; evidencePackId: number }
  | { type: 'reasoning_steps'; stepIds: number[] }
  | { type: 'queue'; queueItemIds: number[] }
  | { type: 'error'; errorId: number };
```

恢复流程：

```text
读取 chat_messages
↓
解析 render_json
↓
根据 part.type 查询关联表
↓
映射到 AI Elements
↓
重新渲染历史消息
```

---

## 17. 工具调用与审批

高风险工具：

```text
publish.article
paid_api.call
project.delete
kb.reindex_all
draft.update
draft.overwrite
fact.batch_update
hypothesis.activate
hypothesis.archive_batch
```

高风险工具必须满足：

```text
1. 当前 action 属于 allowed_actions。
2. 当前工具属于 visible_tools。
3. ToolGuard 校验通过。
4. 如果 requiresApproval = true，必须写入 tool_approvals。
5. 用户批准后才能继续执行。
6. 工具执行前必须写入 execution_ledger。
7. 有外部副作用的工具必须使用 idempotency_key。
```

审批流程：

```text
model tool_call
↓
assistant_tool_calls
↓
ToolPolicy
↓
tool_approvals
↓
user approve / reject
↓
execute or cancel
```

豆包助手例外：

```text
启用 doubao_app 时不能同时使用 function tools
可见性检查结果由本地代码处理
```

---

## 18. Skill Package

每个 Skill 是一个目录：

```text
SKILL.md
prompt-contract.md
output.schema.json
tools.md
examples.json
index.ts
```

核心 Skill：

```text
source-discovery
article-generation
geo-review
visibility-check
reflection-validation
fact-extraction
claim-review
reflection-candidate
context-compression
```

`index.ts` 负责：

```text
读取 Prompt Contract
格式化输入
调用 Model Router
调用 Provider Client
校验 schema
normalize 输出
返回 SkillResult
```

不负责：

```text
全局任务状态推进
发布
审批
跨任务恢复
```

---


## 19. Agent-first Task Runtime

### 19.1 架构结论

GEO Agent 不再以传统固定 WorkflowEngine 作为主编排器，而采用 Agent-first Task Runtime。

用户通过智能 Agent 发起目标，DeepAgents.js 负责拆解任务、判断下一步、调用 Skills、调用 Tools、调度 Sub-agents，并根据工具结果继续推进。

系统不使用固定的 Stage 0 → Stage 1 → Stage 2 作为主流程控制，但必须保留状态、边界、审批、校验、恢复和审计能力。

核心原则：

```text
DeepAgents.js 负责智能编排。
AllowedActionPolicy 限制下一步动作空间。
Dynamic Tool Registry 动态暴露可用工具。
ToolGuard 阻止越权工具调用。
Human Approval 控制高风险动作。
ResultValidator 检查执行结果。
RetryManager 处理可恢复失败。
LoopGuard 防止死循环。
RecoveryManager 处理中断恢复。
ExecutionLedger 记录全过程。
SQLite 是产品权威状态源。
```

一句话：

```text
Agent 负责决定怎么做；
系统负责决定能不能做；
工具负责真正执行；
数据库负责记录一切。
```

实现前提：

```text
Agent-first Task Runtime 依赖 DeepAgents.js 与 LangGraph。
必须在 package.json 中安装：deepagents、@langchain/core、@langchain/langgraph。
Electron Main Process 封装入口：electron/services/agent/geoAgentFactory.ts。
主运行时入口：electron/services/agent/geoAgentRuntime.ts。
DeepAgents.js 只在 Electron Main Process 中运行；Renderer 通过 IPC 调用，不直接引入 deepagents。
```

### 19.2 默认路径不是固定流程

系统不再把 GEO 优化写成固定流程：

```text
knowledge_ingest → fact_extraction → question_generation → article_generation → publish
```

默认任务路径只作为 Agent 的推荐策略：

```text
资料录入 → 事实抽取 → 事实确认 → 问题生成 → 信源推荐 → 文章生成 → 文章审核 → 发布计划 → 用户确认 → 发布 → 可见性检测 → 优化假设
```

Agent 可以根据用户目标、当前状态和工具结果动态调整，例如只检查资料、只生成信源、继续上次任务、重新审核文章、分析未被引用原因。

### 19.3 总体链路

```text
User Intent
↓
GeoAgentRuntime
↓
AgentContextBuilder
↓
AllowedActionPolicy
↓
Dynamic Tool Registry
↓
DeepAgents.js
├── Main GeoAgent
├── Planner / Todo
├── Skills
├── Sub-agents
├── Memory
└── Human-in-the-loop
↓
ToolGuard
↓
Tools / Services
↓
ResultValidator
↓
ExecutionLedger
↓
SQLite
```

### 19.4 核心服务目录

```text
electron/services/agent/
├── geoAgentRuntime.ts
├── geoAgentFactory.ts
├── geoAgentSystemPrompt.ts
├── agentContextBuilder.ts
├── allowedActionPolicy.ts
├── dynamicToolRegistry.ts
├── toolGuard.ts
├── approvalManager.ts
├── taskStateManager.ts
├── executionLedger.ts
├── resultValidator.ts
├── retryManager.ts
├── recoveryManager.ts
├── loopGuard.ts
├── artifactManager.ts
├── agentLockManager.ts
└── agentErrorService.ts
```

### 19.5 DeepAgents checkpointer 与 SQLite 分工

DeepAgents / LangGraph checkpointer 用于恢复 Agent 内部执行状态。SQLite 是产品权威状态源，负责 UI 展示、任务列表、审批、产物、错误、工具调用和审计。

| 状态 | 存储位置 | 作用 |
| --- | --- | --- |
| Agent 内部 graph state | DeepAgents checkpointer | 恢复 Agent 执行 |
| 产品任务状态 | `agent_tasks` | 任务列表、继续执行、状态展示 |
| 执行动作历史 | `execution_ledger` | 审计、追踪、排错 |
| 工具调用记录 | `assistant_tool_calls` / `agent_task_steps` | 工具状态、失败重试 |
| 业务产物 | `agent_artifacts` | 草稿、报告、发布计划 |
| 审批状态 | `tool_approvals` | 人工确认 |
| 错误状态 | `app_errors` | 可观测性 |

恢复前必须做一致性检查：

```text
1. 检查 agent_tasks.status。
2. 检查 DeepAgents thread checkpoint 是否存在。
3. 检查 pending approval 是否存在。
4. 检查未完成 tool_call 是否存在。
5. 检查最后一个 execution_ledger 事件。
6. 如果 SQLite 与 checkpoint 不一致，以 SQLite 产品状态为准，重新构建上下文并让 Agent 重新规划。
```

### 19.6 数据库表

#### agent_tasks

```sql
CREATE TABLE agent_tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER,
  project_id INTEGER,
  title TEXT,
  user_goal TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'running',
  current_objective TEXT,
  last_action TEXT,
  risk_level TEXT DEFAULT 'low',
  allowed_actions_json TEXT,
  context_snapshot_json TEXT,
  budget_json TEXT,
  usage_json TEXT,
  failure_count INTEGER DEFAULT 0,
  loop_count INTEGER DEFAULT 0,
  max_loop_count INTEGER DEFAULT 12,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT
);
```

任务状态：

```text
created
planning
running
waiting_user_input
waiting_approval
waiting_external_result
paused
retrying
completed
failed
cancelled
```

#### agent_task_steps

```sql
CREATE TABLE agent_task_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER NOT NULL REFERENCES agent_tasks(id) ON DELETE CASCADE,
  parent_step_id INTEGER,
  step_type TEXT NOT NULL,
  action_name TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  input_json TEXT,
  output_json TEXT,
  validation_json TEXT,
  error_id INTEGER,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 2,
  started_at TEXT,
  completed_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

step_type：

```text
plan
tool_call
skill_call
subagent_call
validation
approval_request
artifact_write
retry
recovery
final_response
```

#### execution_ledger

```sql
CREATE TABLE execution_ledger (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  step_id INTEGER,
  project_id INTEGER,
  actor TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_name TEXT,
  payload_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

actor：

```text
user
agent
system
tool
model
approval
```

#### agent_artifacts

```sql
CREATE TABLE agent_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id INTEGER,
  project_id INTEGER,
  artifact_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  metadata_json TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

artifact_type：

```text
fact_extraction_result
question_set
source_recommendation
article_draft
article_review_report
publish_plan
visibility_report
reflection_candidate
task_summary
```

#### agent_locks

```sql
CREATE TABLE agent_locks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lock_key TEXT NOT NULL UNIQUE,
  task_id INTEGER NOT NULL,
  owner TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

锁粒度：

```text
project:{project_id}
draft:{artifact_id}
publish:{publish_record_id}
kb_reindex:{project_id}
fact_batch_update:{project_id}
```

### 19.7 AgentContextBuilder

每次 Agent 执行前，必须重新构建上下文，不能只依赖模型记忆。

```typescript
type GeoAgentContext = {
  project?: Project;
  task?: AgentTask;
  userGoal: string;
  knowledgeState: {
    hasEntries: boolean;
    entryCount: number;
    chunkCount: number;
    vectorIndexStatus: 'ready' | 'missing' | 'needs_reindex' | 'building' | 'failed';
  };
  factState: {
    confirmedFactsCount: number;
    candidateFactsCount: number;
    missingFields: string[];
    needsReviewCount: number;
  };
  articleState: {
    hasDraft: boolean;
    draftStatus?: 'draft' | 'reviewing' | 'approved' | 'rejected';
    reviewPassed?: boolean;
    unsupportedClaimCount?: number;
  };
  publishState: {
    hasPublishPlan: boolean;
    publishApproved: boolean;
    published: boolean;
    publishRecordId?: number;
  };
  visibilityState: {
    checked: boolean;
    cited?: boolean;
    mentioned?: boolean;
    inconclusive?: boolean;
    lastCheckedAt?: string;
  };
  reflectionState: {
    candidateCount: number;
    activeCount: number;
    pendingReviewCount: number;
  };
  recentFailures: AgentFailure[];
  allowedActions: GeoNextAction[];
};
```

### 19.8 AgentDecision 结构化输出

GeoAgent 每轮必须输出结构化决策，不能只输出自然语言。

```typescript
type AgentDecision = {
  intent: string;
  current_objective: string;
  selected_action: GeoNextAction;
  reason: string;
  required_tools: string[];
  expected_artifacts: string[];
  risk_level: 'low' | 'medium' | 'high';
  requires_user_input: boolean;
  user_question?: string;
  completion_criteria: string[];
};
```

校验规则：

```text
selected_action 必须属于 allowed_actions。
required_tools 必须属于 visible_tools。
risk_level = high 时必须走审批或用户确认。
completion_criteria 必须可以被 ResultValidator 验证。
```

如果 Agent 输出非法动作：不执行，写入 validation_failed，把 allowed_actions 重新发给 Agent，最多允许修正 1 次，再失败则暂停任务。

### 19.9 AllowedActionPolicy

Agent 可以自主决定下一步，但只能在 allowed actions 内选择。

```typescript
type GeoNextAction =
  | 'create_project'
  | 'ingest_knowledge'
  | 'search_knowledge'
  | 'extract_facts'
  | 'request_fact_review'
  | 'generate_questions'
  | 'recommend_sources'
  | 'generate_article'
  | 'review_article'
  | 'revise_article'
  | 'create_publish_plan'
  | 'request_publish_approval'
  | 'publish_article'
  | 'check_visibility'
  | 'generate_reflection_candidates'
  | 'request_hypothesis_review'
  | 'answer_user'
  | 'ask_user_for_missing_info'
  | 'summarize_task'
  | 'recover_from_error';
```

策略示例：

```typescript
function getAllowedActions(ctx: GeoAgentContext): GeoNextAction[] {
  if (!ctx.project) return ['create_project', 'ingest_knowledge', 'answer_user'];
  if (!ctx.knowledgeState.hasEntries) return ['ingest_knowledge', 'ask_user_for_missing_info', 'answer_user'];
  if (ctx.knowledgeState.vectorIndexStatus === 'needs_reindex') return ['search_knowledge', 'ask_user_for_missing_info', 'answer_user'];
  if (ctx.factState.confirmedFactsCount === 0) return ['extract_facts', 'request_fact_review', 'search_knowledge', 'answer_user'];
  if (!ctx.articleState.hasDraft) return ['generate_questions', 'recommend_sources', 'generate_article', 'search_knowledge', 'answer_user'];
  if (!ctx.articleState.reviewPassed) return ['review_article', 'revise_article', 'answer_user'];
  if (!ctx.publishState.hasPublishPlan) return ['create_publish_plan', 'answer_user'];
  if (!ctx.publishState.publishApproved) return ['request_publish_approval', 'answer_user'];
  if (!ctx.publishState.published) return ['publish_article', 'answer_user'];
  if (!ctx.visibilityState.checked) return ['check_visibility', 'answer_user'];
  return ['generate_reflection_candidates', 'request_hypothesis_review', 'answer_user'];
}
```

AllowedActionPolicy 不是传统流程。它不决定 Agent 必须做什么，只决定 Agent 现在最多能做什么。

### 19.10 Dynamic Tool Registry

不要把所有工具一次性暴露给 Agent。必须根据 allowed actions 动态暴露工具。

```text
没有项目：project.create、kb.ingest_text、kb.ingest_file、answer_user
有资料但没有 confirmed facts：kb.search、fact.extract、fact.request_review、answer_user
有 confirmed facts：question.generate、source.recommend、article.generate、kb.search、fact.search、answer_user
有草稿但未审核：article.review、article.revise、answer_user
审核通过但未确认发布：publish.plan、approval.request、answer_user
用户确认发布后：publish.article、visibility.check、answer_user
发布后：visibility.check、reflection.generate_candidate、reflection.request_review、answer_user
```

### 19.11 ToolGuard 与 Human Approval

每个工具执行前都必须经过 ToolGuard。

```typescript
type ToolGuardResult =
  | { allowed: true; requiresApproval: false }
  | { allowed: true; requiresApproval: true; approvalReason: string }
  | { allowed: false; reason: string };
```

必须审批的工具：

```text
publish.article
paid_api.call
project.delete
kb.reindex_all
draft.overwrite
fact.batch_update
hypothesis.activate
hypothesis.archive_batch
```

审批流程：

```text
Agent 请求调用高风险工具
↓
ToolGuard 判定 requiresApproval
↓
写入 tool_approvals
↓
DeepAgents interrupt_on 暂停
↓
前端展示审批卡片
↓
用户批准或拒绝
↓
批准：恢复执行
↓
拒绝：工具调用返回 rejected，Agent 根据拒绝原因重新规划
```

### 19.12 ResultValidator

Agent 调用工具或 Skill 后，不能默认认为成功。必须校验结果是否符合预期。

校验类型：

```text
Schema Validation
业务规则校验
证据校验
状态校验
幂等校验
质量评分
安全检查
```

每个产物都要有 validator：

| 产物 | Validator |
| --- | --- |
| 企业事实 | FactExtractionValidator |
| 核心问题 | QuestionSetValidator |
| 信源推荐 | SourceRecommendationValidator |
| 文章草稿 | ArticleDraftValidator |
| 审核报告 | ArticleReviewValidator |
| 发布计划 | PublishPlanValidator |
| 可见性报告 | VisibilityReportValidator |
| 优化假设 | ReflectionCandidateValidator |

失败后不能直接绕过校验，只能有限重试、重新规划、请求用户输入或失败退出。

### 19.13 RetryManager 与错误分类

错误类型：

```text
TransientError：临时错误，可重试
PermanentError：永久错误，不重试
ValidationError：结果不符合预期，可有限修复
PermissionError：权限问题，不重试，提示用户
ApprovalRejected：用户拒绝，不重试，重新规划
ExternalUnknownState：外部状态未知，不立即重试，先查询状态
```

默认重试：

| 场景 | 重试次数 | 策略 |
| --- | ---: | --- |
| DeepSeek 普通调用 | 1 | 指数退避 |
| DeepSeek Thinking | 1 | 更长 timeout |
| 豆包 Responses | 1 | 指数退避 |
| 豆包 stream 首 token 超时 | 1 | 重新发起 |
| Embedding | 2 | 指数退避 + 分批降级 |
| SQLite 写入 | 0 | 直接失败 |
| Vector Search | 0 | 直接失败 |
| 文件解析 | 0 | 提示用户 |
| 发布 API | 2 | 必须 idempotency |
| 可见性检测 | 1 | 失败则标记 inconclusive |
| JSON repair | 1 | 修复失败则失败 |
| 文章自动修订 | 2 | 超过则请求人工处理 |

### 19.14 LoopGuard

必须防止 Agent 陷入循环。

防循环机制：

```text
task.max_loop_count
step.max_attempts
same_action_repeat_limit
same_error_repeat_limit
artifact_diff_check
no_progress_detection
cost_budget_limit
time_budget_limit
```

无进展判断：是否新增 confirmed facts、是否新增有效 Evidence Pack、是否生成新 artifact、文章质量分是否提升、unsupported claims 是否减少、是否获得用户输入、是否成功完成一个工具调用。

连续失败、无进展或超预算时，任务必须暂停，请求用户处理，不能无限自动执行。

### 19.15 中断与恢复

中断类型：用户主动暂停、关闭应用、网络中断、模型流式中断、高风险工具等待审批、系统崩溃、外部 API 状态未知。

恢复流程：

```text
用户点击继续
↓
RecoveryManager 读取 agent_task
↓
读取最近成功 step
↓
读取 pending approval
↓
读取 unfinished tool call
↓
读取 latest checkpoint
↓
重建 GeoAgentContext
↓
重新计算 allowed_actions
↓
恢复 DeepAgents 执行
```

不同状态恢复策略：

| 中断状态 | 恢复策略 |
| --- | --- |
| waiting_approval | 展示审批卡片，用户处理后 resume |
| running + 有 checkpoint | 从 checkpoint 恢复 |
| running + 无 checkpoint | 从最后成功 step 后重新规划 |
| stream interrupted | 保留已输出内容，允许继续生成或重新生成 |
| external unknown | 先查询外部状态，不直接重试 |
| validation failed | 带 validation result 重新规划 |
| failed | 显示失败报告，可手动重试 |
| cancelled | 不自动恢复，只允许复制任务重新开始 |

恢复时禁止重复提交发布、重复扣费、重复写入相同 artifact、把 pending approval 当 approved、跳过上次失败校验。

### 19.16 幂等设计

所有外部副作用工具必须支持幂等。

副作用工具：

```text
publish.article
paid_api.call
kb.reindex_all
fact.batch_update
draft.overwrite
hypothesis.activate
```

idempotency key：

```typescript
function createIdempotencyKey(input: {
  taskId: number;
  toolName: string;
  targetId: string;
  payloadHash: string;
}) {
  return `${input.taskId}:${input.toolName}:${input.targetId}:${input.payloadHash}`;
}
```

网络超时不能立即再次提交，必须先用 external_id 或 idempotency_key 查询状态，查询不到再提示人工确认。

### 19.17 AgentLock 并发控制

必须避免多个 Agent 同时修改同一资源。

锁粒度：

```text
project:{project_id}
draft:{artifact_id}
publish:{publish_record_id}
kb_reindex:{project_id}
fact_batch_update:{project_id}
```

低风险只读工具不加锁。写项目、写草稿、发布、重建索引、批量事实修改必须加锁。锁必须有 expires_at，防止崩溃后永久锁死。

### 19.18 预算控制

每个任务必须设置预算：

```json
{
  "max_model_calls": 20,
  "max_tool_calls": 40,
  "max_runtime_ms": 900000,
  "max_cost_estimate": 5.0,
  "max_loop_count": 12,
  "max_revisions_per_artifact": 2
}
```

达到 80% 时前端提醒，达到 100% 时自动暂停，等待用户确认是否继续。

### 19.19 前端任务体验

智能 Agent 页面需要展示：Agent 当前目标、执行计划、当前步骤、工具调用状态、审批请求、错误卡片、可恢复任务、产物卡片、任务时间线。

错误卡片提供：重试、换一种方式继续、跳过这一步、查看错误详情、补充资料、取消任务。

| 状态 | 按钮 |
| --- | --- |
| waiting_approval | 批准、拒绝、修改 |
| waiting_user_input | 提交补充信息、取消 |
| paused | 继续、取消 |
| failed | 查看错误、从失败点重试、复制任务重新开始 |
| unknown external state | 查询外部状态、人工标记成功、人工标记失败 |
| completed | 查看报告、继续追问、基于结果新建任务 |

### 19.20 DeepAgents 配置示例

```typescript
const geoAgent = createDeepAgent({
  model,
  systemPrompt: buildGeoAgentSystemPrompt({
    project,
    allowedActions,
    riskRules,
  }),
  tools: visibleTools,
  subagents: [
    knowledgeAgent,
    factAgent,
    questionAgent,
    sourceAgent,
    contentAgent,
    reviewAgent,
    visibilityAgent,
    reflectionAgent,
  ],
  skills,
  interrupt_on: {
    'publish.article': true,
    'paid_api.call': true,
    'project.delete': true,
    'kb.reindex_all': true,
    'fact.batch_update': true,
    'draft.overwrite': true,
    'hypothesis.activate': true,
  },
  checkpointer,
});
```

系统提示词核心规则：

```text
你是 GEO Agent。
你可以自主拆解任务、规划下一步、调用 Skills 和 Tools。
你必须只从 allowed_actions 中选择下一步。
你不能调用未暴露的工具。
你不能绕过 ToolGuard。
没有 confirmed facts，不得生成正式文章。
文章未通过审核，不得请求发布。
用户未确认发布，不得调用 publish.article。
可见性检测结果只能作为优化假设证据，不能直接激活规则。
如果连续失败，必须停止自动循环并请求用户处理。
```

### 19.21 主运行流程伪代码

```typescript
async function runGeoAgent(input: {
  sessionId: number;
  projectId?: number;
  userMessage: string;
  taskId?: number;
}) {
  const task = await taskStateManager.getOrCreateTask(input);

  await executionLedger.record(task.id, {
    actor: 'user',
    event_type: 'user_message',
    payload: { message: input.userMessage },
  });

  const ctx = await agentContextBuilder.build({
    taskId: task.id,
    sessionId: input.sessionId,
    projectId: input.projectId,
    userMessage: input.userMessage,
  });

  const allowedActions = allowedActionPolicy.getAllowedActions(ctx);
  const visibleTools = dynamicToolRegistry.getTools(allowedActions, ctx);

  await taskStateManager.update(task.id, {
    status: 'running',
    allowed_actions_json: JSON.stringify(allowedActions),
    context_snapshot_json: JSON.stringify(ctx),
  });

  const loopDecision = await loopGuard.check(task.id);
  if (loopDecision.action === 'fail_task') {
    return failTask(task.id, loopDecision.reason);
  }

  const agent = geoAgentFactory.create({ ctx, allowedActions, visibleTools });

  try {
    const result = await agent.invoke({
      messages: [{ role: 'user', content: input.userMessage }],
      configurable: { thread_id: `agent_task_${task.id}` },
    });

    await resultValidator.validateAgentResult(result, ctx);
    await taskStateManager.markProgress(task.id, result);
    return result;
  } catch (error) {
    return agentErrorService.handle(error, { taskId: task.id, ctx, allowedActions });
  }
}
```

### 19.22 任务完成条件

Agent 不能自己随便说“完成”。完成必须满足 CompletionValidator。

GEO 优化任务完成条件：至少有一个 article_draft；文章通过审核；如果用户要求发布，则 publish_records 存在；如果已发布，则 visibility_check 已执行或明确失败为 inconclusive；如果生成优化假设，则状态为 candidate / pending_review，不得自动 active；任务总结已生成。

知识库诊断任务完成条件：知识库资料状态已检查；缺失字段已列出；风险提示已生成；下一步建议已生成。

可见性分析任务完成条件：visibility_checks 已写入；原始 response_text 已保存；mentioned / cited / inconclusive 已判断；不确定情况明确标记；不生成过度结论。

### 19.23 Agent 不能做的事

```text
Agent 不能自己降低安全标准。
Agent 不能自己跳过 ResultValidator。
Agent 不能自己批准高风险工具。
Agent 不能自己把 hypothesis 激活为 active。
Agent 不能自己修改 ToolGuard 规则。
Agent 不能自己扩大 allowed_actions。
Agent 不能自己删除 execution_ledger。
Agent 不能自己覆盖用户已确认的事实。
```


## 20. 文章生成与审核

输入：

```text
confirmed facts
Evidence Pack
target question
source recommendation
platform constraints
active hypotheses
compliance rules
```

输出：

```text
article_markdown
claims
claim_source_map
risk_warnings
geo_notes
human_review_required
```

审核：

```text
JSON schema 校验
Claim-source 校验
DeepSeek claim 初筛
豆包 GEO 风格复核
人工审核
```

---

## 21. 发布与可见性检测

发布前必须：

```text
人工确认
工具审批
幂等 key
```

发布后：

```text
visibility_check
↓
doubao_app ai_search
↓
visibility_checks
↓
reflection_hypothesis_evidence
```

---

## 22. 优化假设系统

不要把“被引用”直接等同于规则有效。

正确流程：

```text
visibility evidence
↓
reflection_candidate by DeepSeek
↓
reflection_validation by Doubao
↓
human review
↓
hypothesis status update
```

状态：

```text
candidate
active
degraded
archived
rejected
```

需要记录：

```text
sample_size
positive_examples
negative_examples
effect_score
confidence
target_engine
target_channel
```

---

## 23. 数据库总览

核心表：

```text
projects
knowledge_entries
knowledge_chunks
knowledge_chunk_vectors
vector_store_meta
knowledge_chunk_fts
enterprise_facts
chat_sessions
chat_messages
assistant_runs
assistant_stream_events
assistant_reasoning_steps
assistant_tool_calls
tool_approvals
assistant_queue_items
agent_tasks
agent_task_steps
agent_artifacts
agent_locks
execution_ledger
publish_records
visibility_checks
reflection_hypotheses
reflection_hypothesis_evidence
model_call_logs
retrieval_logs
app_errors
app_settings
```

---

## 24. IPC 总览

```text
project:create
project:list
project:get
project:update
project:delete

kb:ingestText
kb:ingestFile
kb:entries
kb:query
kb:facts
kb:factsUpdate

assistant:streamStart
assistant:streamCancel
assistant:history
assistant:queueList
assistant:queueUpdate

toolApproval:respond
toolApproval:listPending

agentTask:create
agentTask:get
agentTask:list
agentTask:resume
agentTask:pause
agentTask:cancel
agentTask:retry
agentTask:timeline
agentTask:artifacts

draft:list
draft:get
draft:update
draft:review

publish:plan
publish:approve
publish:status

visibility:check

reflection:list
reflection:approve
reflection:reject
reflection:archive
```

---


## 25. Agent-first Runtime 测试与验收

### 25.1 单元测试

```text
AllowedActionPolicy 单元测试
DynamicToolRegistry 单元测试
ToolGuard 单元测试
ResultValidator 单元测试
RetryManager 单元测试
LoopGuard 单元测试
AgentLockManager 单元测试
RecoveryManager 单元测试
```

### 25.2 必测用例

```text
没有 confirmed facts 时不能 article.generate。
文章未审核通过不能 publish.plan。
发布未审批不能 publish.article。
用户拒绝发布后 Agent 不再调用 publish.article。
同一 publish idempotency_key 不重复提交。
文章审核连续失败后停止自动修订。
模型 JSON 输出错误时只 repair 一次。
DeepSeek API 429 后指数退避。
豆包 stream 中断后可恢复或重试。
应用关闭后 waiting_approval 任务可恢复。
外部发布 unknown 状态不会重复发布。
同一项目上的高风险写操作不能并发执行。
Agent 输出 selected_action 不属于 allowed_actions 时必须被拦截。
```

### 25.3 验收标准

```text
用户可以用自然语言创建长期 Agent 任务。
Agent 可以根据当前项目状态自主判断下一步。
Agent 只能调用当前 allowed_actions 对应的工具。
高风险工具会触发审批卡片。
执行过程会写入 execution_ledger。
中断后可以从审批点或最近成功步骤继续。
执行失败后可以有限重试或重新规划。
连续失败、无进展或超预算时会暂停，不会无限循环。
发布、付费 API、重建索引等副作用动作具备幂等保护。
前端可以展示任务时间线、错误卡片、审批卡片和产物卡片。
```


## 26. Timeout / Retry / 幂等

| 调用 | timeout | retry |
| --- | ---: | ---: |
| Doubao Responses | 60s | 1 |
| Doubao Responses stream | 首 token 30s，总 180s | 1 |
| DeepSeek Chat | 90s | 1 |
| DeepSeek Thinking | 180s | 1 |
| Embedding | 30s | 2 |
| Visibility Check | 90s | 1 |
| SQLite / Vector | 10s | 0 |
| Publish API | 60s | 2，但必须幂等 |

详细错误分类、错误码对照和日志写入目标见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 27. 最终架构闭环

```text
企业资料
↓
清洗 / 切片
↓
豆包 Embedding
↓
Hybrid Retrieval / Evidence Pack
↓
DeepSeek 事实抽取
↓
人工确认事实
↓
GeoAgent / SourceAgent + 豆包 Responses API
↓
GeoAgent / ContentAgent + 豆包 Responses stream
↓
DeepSeek Claim Review
↓
豆包 GEO Review
↓
人工审批发布
↓
doubao_app ai_search 可见性检查
↓
DeepSeek 反思候选
↓
豆包反思验证
↓
人工确认优化假设
```