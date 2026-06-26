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

> **MVP 边界**：Phase 2–7 为当前 MVP 范围。Phase 7（文章生成 MVP）完成后，即可形成「知识库 → 事实 → 文章 → 人工审核」的最小闭环；Phase 8 及以后的能力在本次 Sprint 后冻结，不进入 MVP。

#### Phase 7：文章生成 MVP（支持类文章与综合排行榜）

```text
20. GEO 文章生成
21. Claim 初筛审核
22. GEO 风格复核
23. Draft Management UI
24. Human Review UI
```

> 本 Phase 详细任务与验收标准以路线图 [Phase 7：文章生成 MVP](GEO_Agent_长期开发路线图.md) 为准。

#### Phase 8：Assistant Runtime、流式事件、工具审批与队列

```text
16. 工具调用、工具审批、任务队列
28. 全局错误记录
29. 超时、重试、熔断、幂等（完整实现）
```

#### Phase 9：Agent-first Task Runtime + Skill Package

```text
17. Agent-first Task Runtime
18. 目标问题生成
19. 信源发现
```

#### Phase 10：发布与豆包助手可见性检测

```text
23. 发布计划
24. 人工确认发布
25. 发布记录
26. 豆包助手可见性检查
```

#### Phase 11：优化假设、错误恢复与收尾

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
├── MemoryContextBuilder
├── ConversationMemoryService
├── ProjectKnowledgeMemoryService
├── TaskExecutionMemoryService
├── ContextCompressionService
├── MemoryRetrievalPolicy
├── MemoryEventService
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
├── conversation_summaries
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
├── memory_events
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

| 任务               | Provider       | API 模式                    | 说明                             |
| ------------------ | -------------- | --------------------------- | -------------------------------- |
| 信源发现           | 豆包           | Responses API               | 面向豆包生态的信源判断           |
| 文章生成           | 豆包           | Responses API stream        | 面向 GEO 内容生成                |
| GEO 风格复核       | 豆包           | Responses API               | 判断是否更适合豆包理解和引用     |
| 豆包可见性检查     | 豆包助手       | Responses API + doubao_app  | `ai_search` / `reasoning_search` |
| 反思验证           | 豆包           | Responses API               | 检查优化假设是否符合豆包生态     |
| 向量化             | 豆包 Embedding | Embedding API               | 企业知识库检索                   |
| 企业事实抽取       | DeepSeek       | Chat Completions API        | JSON Output + thinking           |
| 对话摘要           | DeepSeek       | Chat Completions API        | 快速摘要                         |
| 上下文压缩         | DeepSeek       | Chat Completions API        | JSON Output                      |
| Agent 任务规划辅助 | DeepSeek       | Chat Completions API stream | 内部规划                         |
| Claim 初筛审核     | DeepSeek       | Chat Completions API        | 事实一致性初筛                   |
| 反思候选生成       | DeepSeek       | Chat Completions API        | 提出候选假设                     |

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

| 内容类型    | 策略                            |
| ----------- | ------------------------------- |
| 普通段落    | 500–800 中文字                  |
| FAQ         | 一问一答一个 chunk              |
| 表格        | 整表一个 chunk                  |
| 案例        | 背景 + 需求 + 方案 + 结果不拆断 |
| 联系方式    | 独立 fact chunk                 |
| 资质 / 荣誉 | 独立 fact chunk                 |
| 产品 / 服务 | 按服务项切分                    |

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
memory.delete_permanent
memory.rebuild_index
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
support-article-planning
support-article-generation
ranking-theme-selection
ranking-criteria-generation
ranking-reason-generation
ranking-article-planning
ranking-article-generation
title-generation
geo-review
visibility-check
reflection-feature-extraction
reflection-candidate
reflection-validation
hypothesis-injection
rule-export
fact-extraction
claim-review
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



## 19. Memory System 记忆系统

### 19.1 设计目标

GEO Agent 的记忆系统不是简单的聊天历史，也不是完全依赖 DeepAgents.js / LangGraph checkpointer。

记忆系统的目标是让 Agent 在长期任务、跨会话追问、知识库检索、任务恢复、审批恢复和错误排查中，都能稳定知道：

```text
用户之前说过什么
当前公司真实资料是什么
哪些事实已经确认
Agent 已经做过什么
任务现在做到哪一步
哪些产物可以继续使用
哪些审批还在等待
哪些信息已经过期或被废弃
```

核心原则：

```text
长期记忆不是“什么都记”。
长期记忆只保存可验证、可追踪、可更新、对未来任务有复用价值的信息。
```

一句话：

```text
DeepAgents checkpoint = Agent 工作记忆
SQLite = 产品权威记忆
Hybrid Retrieval = 项目知识召回
Summary = 上下文压缩记忆
```

### 19.2 三层记忆架构

第一版采用三层记忆架构，避免过度设计：

```text
GEO Agent Memory System
├── Conversation Memory       对话记忆
├── Project Knowledge Memory  项目知识记忆
└── Task Execution Memory     任务执行记忆
```

三层分别回答三个问题：

```text
Conversation Memory      用户说过什么
Project Knowledge Memory 这个公司真实资料是什么
Task Execution Memory    Agent 做过什么、做到哪一步
```

### 19.3 Conversation Memory：对话记忆

对话记忆负责保存聊天体验和上下文连续性。

对应表：

```text
chat_sessions
chat_messages
conversation_summaries
```

保存内容：

```text
用户消息
Assistant 回复
附件引用
工具调用展示
审批卡片展示
产物卡片展示
错误卡片展示
消息摘要
用户在当前会话中确认的约束
引用过的 artifact
```

对话记忆主要用于处理：

```text
继续刚刚那个
把上面那篇文章改一下
按照刚才的要求再生成一次
这个任务为什么失败了
刚刚那个审批我同意
```

注意：

```text
普通聊天不得直接写入企业知识库。
普通聊天可以进入 chat_messages。
只有被用户明确确认、并且与企业资料有关的信息，才可以进入企业事实候选。
```

### 19.4 Project Knowledge Memory：项目知识记忆

项目知识记忆是 GEO Agent 最核心的长期记忆。

对应表：

```text
projects
knowledge_entries
knowledge_chunks
knowledge_chunk_vectors
knowledge_chunk_fts
vector_store_meta
enterprise_facts
```

保存内容：

```text
企业原始资料
清洗后的文本
语义切片
向量索引
关键词索引
企业事实候选
人工确认事实
被废弃事实
资料来源与引用片段
```

结构关系：

```text
knowledge_entries       原始资料与录入记录
knowledge_chunks        可检索语义片段
knowledge_chunk_vectors 向量记忆
knowledge_chunk_fts     关键词记忆
enterprise_facts        结构化企业事实
```

项目知识记忆回答：

```text
这个公司是谁
它有哪些产品和服务
服务区域在哪里
联系方式是什么
核心优势是什么
哪些事实已经确认
哪些资料可以作为证据
哪些字段还缺失
```

事实状态：

```text
candidate   AI 抽取候选，不能直接作为权威事实
confirmed   用户确认后的权威事实
rejected    用户拒绝的事实
stale       长时间未确认或可能过期
deprecated  被新资料替代的旧事实
deleted     用户删除或级联删除后的软删除状态
```

规则：

```text
AI 抽取结果默认只能进入 candidate。
confirmed facts 必须来自用户确认或可信资料确认。
文章生成优先使用 confirmed facts。
没有 confirmed facts，不得生成正式文章。
普通聊天不得直接产生 confirmed facts。
```

### 19.5 Task Execution Memory：任务执行记忆

任务执行记忆负责记录 Agent 任务状态、执行过程、审批、产物、错误和恢复点。

对应表：

```text
agent_tasks
agent_task_steps
execution_ledger
agent_artifacts
tool_approvals
assistant_tool_calls
assistant_queue_items
app_errors
model_call_logs
retrieval_logs
DeepAgents / LangGraph checkpoint
```

保存内容：

```text
任务目标
当前任务状态
当前目标
执行步骤
Agent 决策
工具调用
工具结果
模型调用
审批请求
审批结果
生成产物
错误记录
重试记录
恢复点
```

DeepAgents / LangGraph checkpoint 只属于 Task Execution Memory 中的工作记忆，不是产品权威记忆。

分工：

```text
DeepAgents checkpoint 用于恢复 Agent 内部 graph state。
agent_tasks 用于恢复产品任务状态。
agent_task_steps 用于恢复执行步骤。
execution_ledger 用于审计全过程。
agent_artifacts 用于恢复产物。
tool_approvals 用于恢复审批状态。
```

如果 checkpoint 与 SQLite 不一致：

```text
以 SQLite 产品状态为准。
重新构建 Memory Context。
让 Agent 基于当前 allowed_actions 重新规划。
不得盲目相信 checkpoint。
```

### 19.6 上下文管理策略

GEO Agent 不使用单一滑动窗口，也不只使用消息摘要，而是采用混合上下文策略：

```text
Recent Window + Summary + Retrieval + Task State
```

每次 Agent 运行前，组装以下上下文：

```text
System Prompt
↓
当前项目状态
↓
当前任务状态
↓
长期会话摘要
↓
最近 8–12 条消息
↓
相关企业事实
↓
相关知识库 chunks
↓
最近关键执行记录
↓
当前用户输入
```

各部分作用：

```text
滑动上下文：解决“刚刚说了什么”
消息摘要：解决“之前聊过什么”
RAG 检索：解决“公司真实资料是什么”
任务状态：解决“Agent 做到哪一步”
执行日志：解决“为什么这么做、哪里失败了”
```

第一版默认参数：

```text
最近消息：12 条
会话摘要：超过 20 条消息后生成
知识 chunks：8–12 个
confirmed facts：20–30 条
candidate facts：最多 10 条
任务步骤：最近 10 步
执行日志：最近 20 个关键事件
相关产物摘要：最多 5 个
```

禁止：

```text
把完整 chat_history 全部塞进模型
把所有 knowledge_chunks 全部塞进模型
把完整 execution_ledger 全部塞进模型
把未确认事实当作权威事实注入
把 DeepAgents checkpoint 当作唯一上下文来源
```

### 19.7 MemoryContextBuilder

新增核心模块：

```text
electron/services/memory/
├── memoryContextBuilder.ts
├── conversationMemoryService.ts
├── projectKnowledgeMemoryService.ts
├── taskExecutionMemoryService.ts
├── contextCompressionService.ts
├── memoryRetrievalPolicy.ts
├── memoryEventService.ts
└── memoryCleanupService.ts
```

`MemoryContextBuilder` 每次 Agent 执行前重新构建上下文，不能只依赖模型记忆或 checkpoint。

```typescript
type AgentMemoryContext = {
  conversation: {
    sessionId: number;
    recentMessages: ChatMessage[];
    summary?: ConversationSummary;
    referencedArtifactIds: number[];
  };

  project?: {
    projectId: number;
    projectName: string;
    confirmedFacts: EnterpriseFact[];
    candidateFacts: EnterpriseFact[];
    relevantChunks: KnowledgeChunk[];
    missingFields: string[];
    vectorIndexStatus: 'ready' | 'missing' | 'needs_reindex' | 'building' | 'failed';
  };

  task?: {
    taskId: number;
    status: AgentTaskStatus;
    currentObjective?: string;
    recentSteps: AgentTaskStep[];
    pendingApprovals: ToolApproval[];
    recentArtifacts: AgentArtifact[];
    recentFailures: AppError[];
  };

  execution: {
    recentLedgerEvents: ExecutionLedgerEvent[];
  };

  retrieval: {
    evidencePack?: EvidencePack;
    riskWarnings: string[];
  };
};
```

构建流程：

```text
读取 session 与最近消息
↓
读取 conversation_summaries
↓
识别当前 project / task / artifact 引用
↓
读取 agent_task 当前状态
↓
读取最近 task steps / approvals / artifacts / errors
↓
根据用户输入和当前目标执行 Hybrid Retrieval
↓
读取 confirmed facts / candidate facts / missing fields
↓
读取 execution_ledger 最近关键事件
↓
按 token budget 裁剪
↓
生成 AgentMemoryContext
```

### 19.8 Memory Retrieval Policy

长期记忆必须按场景检索，不允许混在一起盲目召回。

#### 用户问项目事实

```text
confirmed enterprise_facts
↓
FTS5 exact keyword match
↓
Vector Search
↓
candidate facts
```

#### 用户要求继续任务

```text
chat_messages 最近消息
↓
agent_tasks 当前任务
↓
agent_task_steps 最近步骤
↓
agent_artifacts 最近产物
↓
pending approvals
↓
execution_ledger 最近关键事件
```

#### 用户要求生成文章

```text
confirmed facts
↓
Evidence Pack
↓
target question
↓
source recommendation
↓
platform constraints
↓
active hypotheses
```

#### 用户询问失败原因

```text
agent_task_steps
↓
execution_ledger
↓
app_errors
↓
model_call_logs
↓
assistant_tool_calls
```

#### 用户要求审核文章

```text
article artifact
↓
claim_source_map
↓
confirmed facts
↓
Evidence Pack
↓
previous review report
```

### 19.9 会话摘要设计

当会话消息过长时，使用 DeepSeek Chat Completions 生成结构化摘要。

触发规则：

```text
同一 session 超过 20 条消息后触发第一次摘要
之后每新增 10 条旧消息触发一次增量摘要
始终保留最近 12 条原文消息
摘要失败不阻塞主流程，只记录 app_errors
```

摘要不保存模型推理过程，只保存可复用上下文。

```typescript
type ConversationSummaryJson = {
  user_goals: string[];
  confirmed_decisions: string[];
  open_questions: string[];
  referenced_projects: number[];
  referenced_tasks: number[];
  referenced_artifacts: number[];
  important_constraints: string[];
  user_preferences_in_session: string[];
  unresolved_risks: string[];
};
```

数据库：

```sql
CREATE TABLE conversation_summaries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  summary_type TEXT NOT NULL,
  message_start_id INTEGER,
  message_end_id INTEGER,
  summary_json TEXT NOT NULL,
  token_estimate INTEGER DEFAULT 0,
  model_provider TEXT,
  model_name TEXT,
  prompt_version TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

summary_type：

```text
rolling_session_summary
project_scoped_summary
task_scoped_summary
```

### 19.10 长期记忆写入规则

#### 写入 Conversation Memory

写入场景：

```text
用户发送消息
Assistant 回复
生成 UI Message Parts
展示审批卡片
展示错误卡片
展示产物卡片
生成或更新 conversation summary
```

写入方式：

```text
chat_messages 只追加
conversation_summaries 可增量更新
不得把普通闲聊直接写入 enterprise_facts
```

#### 写入 Project Knowledge Memory

写入场景：

```text
用户上传资料
用户粘贴企业资料
文件解析完成
文本清洗完成
语义切片完成
Embedding 完成
事实抽取完成
用户确认事实
用户拒绝事实
用户废弃旧事实
知识库重新索引
```

写入规则：

```text
AI 抽取事实默认 candidate
用户确认后才变为 confirmed
新资料与旧事实冲突时，旧事实标记 stale 或 deprecated
Embedding 模型或维度变化时，vector_store_meta 标记 needs_reindex
```

#### 写入 Task Execution Memory

写入场景：

```text
任务创建
Agent 决策
工具调用请求
工具执行结果
模型调用记录
审批请求
审批结果
产物生成
校验结果
错误记录
重试记录
任务暂停
任务恢复
任务完成
```

写入规则：

```text
execution_ledger 只追加，不覆盖
agent_task_steps 记录状态流转
agent_artifacts 重要产物版本化
tool_approvals 不允许被 Agent 自行批准
app_errors 保留错误上下文
```

### 19.11 长期记忆更新方式

长期记忆更新分为四类。

#### Append：只追加

适用：

```text
chat_messages
execution_ledger
model_call_logs
retrieval_logs
app_errors
```

规则：

```text
历史不可覆盖。
新事件只能追加。
用于审计、回放、排错。
```

#### Version：版本化

适用：

```text
article_draft
publish_plan
source_recommendation
review_report
conversation_summary
```

规则：

```text
重要产物修改不直接覆盖旧内容。
生成新 artifact 或保留 revision metadata。
最新版本用于默认展示。
历史版本可追溯。
```

#### State Transition：状态流转

适用：

```text
enterprise_facts
reflection_hypotheses
tool_approvals
agent_tasks
agent_task_steps
publish_records
visibility_checks
```

规则：

```text
通过状态变化表达更新。
保留 updated_at、deprecated_at、reason。
关键状态变化写入 memory_events。
```

#### Rebuild：重建

适用：

```text
knowledge_chunks
knowledge_chunk_vectors
knowledge_chunk_fts
vector_store_meta
```

规则：

```text
原始资料变化后可重新清洗、切片、索引。
Embedding 维度变化时禁止写入旧向量索引。
重建过程必须记录 retrieval_logs / memory_events。
重建失败时保持旧索引可用或标记 failed。
```

### 19.12 过期策略

第一版采用软过期，不做复杂自动遗忘。

通用字段建议：

```sql
memory_status TEXT DEFAULT 'active',
expires_at TEXT,
stale_at TEXT,
deprecated_at TEXT,
deprecated_reason TEXT,
deleted_at TEXT,
deleted_by TEXT,
delete_reason TEXT
```

统一状态：

```text
active      当前有效
stale       可能过期，需要复核
deprecated  已被替代，不再默认使用
archived    归档保留，不参与默认上下文
deleted     软删除，不参与检索
```

默认过期规则：

| 记忆类型                   | 默认策略                                       |
| -------------------------- | ---------------------------------------------- |
| confirmed enterprise_facts | 不自动过期，除非资料更新或用户修改             |
| candidate enterprise_facts | 30–90 天未确认标记 stale                       |
| rejected facts             | 保留但不参与检索                               |
| knowledge_chunks           | 随原始资料更新而重建或废弃                     |
| article_draft              | 保留历史版本，默认只取最新 draft / approved    |
| publish_plan               | 发布后或超过计划时间标记 archived              |
| visibility_check           | 保留历史，默认只取最近一次                     |
| reflection_hypothesis      | 按状态参与检索，archived / rejected 不默认注入 |
| completed agent_tasks      | 保留完整记录，长期默认只注入 summary           |
| chat_messages              | 原文保留，但上下文只取 summary + 最近消息      |
| execution_ledger           | 长期保留，只按任务查询，不默认全部注入         |

### 19.13 删除策略

删除分为软删除和物理删除。

#### 软删除

适用默认删除操作：

```text
事实删除
草稿删除
任务删除
会话删除
发布计划删除
优化假设删除
```

处理方式：

```text
memory_status = deleted
deleted_at = 当前时间
deleted_by = user / system
delete_reason = 用户原因或系统原因
```

软删除内容默认：

```text
不参与检索
不注入上下文
不显示在普通列表
可在回收站或审计视图中恢复
```

#### 物理删除

仅用于：

```text
用户明确要求彻底删除
隐私数据清理
错误上传文件
法规要求删除
数据库清理工具
```

物理删除必须级联处理：

```text
原始文件
knowledge_entries
knowledge_chunks
knowledge_chunk_vectors
knowledge_chunk_fts
enterprise_facts
相关 artifacts
相关 retrieval_logs
相关 summary 引用
```

物理删除前必须：

```text
检查是否存在运行中的 agent_task
检查是否存在 pending approval
检查是否存在发布记录依赖
写入 memory_events 删除记录
必要时提示用户确认
```

### 19.14 Memory Events

新增 `memory_events` 表，用于记录关键记忆变化。

```sql
CREATE TABLE memory_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  memory_type TEXT NOT NULL,
  memory_table TEXT NOT NULL,
  memory_id INTEGER NOT NULL,
  event_type TEXT NOT NULL,
  old_value_json TEXT,
  new_value_json TEXT,
  reason TEXT,
  actor TEXT NOT NULL,
  task_id INTEGER,
  project_id INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

memory_type：

```text
conversation
project_knowledge
task_execution
summary
artifact
fact
index
```

event_type 示例：

```text
fact_created
fact_confirmed
fact_rejected
fact_deprecated
summary_created
summary_updated
artifact_revised
knowledge_reindexed
memory_soft_deleted
memory_physical_deleted
checkpoint_recovered
context_built
```

规则：

```text
关键状态变化必须写入 memory_events。
memory_events 是记忆系统审计日志，不替代 execution_ledger。
execution_ledger 记录 Agent 执行过程。
memory_events 记录长期记忆自身变化。
```

### 19.15 DeepAgents Checkpoint 分工

DeepAgents / LangGraph checkpoint 只负责 Agent 内部工作状态。

可以保存：

```text
当前 graph state
当前 thread state
中断点
Human-in-the-loop 暂停点
Sub-agent 临时状态
```

不作为权威来源：

```text
企业事实
用户审批结果
发布状态
任务完成状态
文章最终版本
可见性检查结果
优化假设状态
```

恢复时：

```text
先读取 SQLite 产品状态
再读取 checkpoint
检查两者是否一致
若一致，从 checkpoint 恢复
若不一致，以 SQLite 为准重新构建上下文
让 Agent 重新规划下一步
```

### 19.16 Token Budget 与裁剪

每次组装上下文前必须计算 token budget。

推荐预算比例：

```text
System / Policy：15%
Task State：15%
Conversation Recent Window：20%
Conversation Summary：10%
Project Facts：15%
Evidence Pack / Chunks：20%
Execution Events / Errors：5%
```

裁剪优先级：

```text
必须保留：system prompt、allowed_actions、pending approvals、当前用户输入
优先保留：confirmed facts、当前任务状态、最近消息、相关 chunks
可裁剪：旧 execution events、低分 chunks、candidate facts、较旧 artifact 摘要
禁止注入：deleted、deprecated、rejected 且无特殊查询需求的记忆
```

当上下文超限：

```text
减少 knowledge chunks 数量
减少 candidate facts
减少最近消息数量
压缩 artifact 内容为摘要
只保留 execution_ledger 关键事件
仍超限则请求用户缩小任务范围或拆分任务
```

### 19.17 记忆系统 IPC

新增 IPC：

```text
memory:contextPreview
memory:summaries
memory:summaryRegenerate
memory:events
memory:deleteSoft
memory:deletePermanent
memory:cleanupStale
memory:rebuildIndex
```

用途：

```text
memory:contextPreview      查看某次 Agent 运行将注入哪些上下文
memory:summaries           查看会话 / 任务摘要
memory:summaryRegenerate   手动重新生成摘要
memory:events              查看记忆变更记录
memory:deleteSoft          软删除某条记忆
memory:deletePermanent     物理删除某条记忆及相关索引
memory:cleanupStale        清理或标记过期记忆
memory:rebuildIndex        重建知识库索引
```

高风险：

```text
memory:deletePermanent
memory:rebuildIndex
```

必须经过 ToolGuard 与用户确认。

### 19.18 测试与验收

单元测试：

```text
MemoryContextBuilder 单元测试
ConversationSummaryService 单元测试
MemoryRetrievalPolicy 单元测试
MemoryEventService 单元测试
MemoryCleanupService 单元测试
CheckpointConsistencyChecker 单元测试
```

必测用例：

```text
最近消息只保留 12 条。
超过 20 条消息后生成 conversation summary。
普通聊天不会写入 enterprise_facts。
AI 抽取事实默认 candidate。
confirmed facts 优先于 vector chunks 注入上下文。
deleted / deprecated facts 不默认参与检索。
用户要求继续任务时能恢复 task state。
checkpoint 丢失时可通过 SQLite 重新规划。
checkpoint 与 SQLite 不一致时以 SQLite 为准。
pending approval 必须注入上下文。
物理删除资料时 vectors 和 FTS 记录被级联删除。
Embedding 维度变化时标记 needs_reindex。
上下文超限时按裁剪优先级降级。
contextPreview 能展示注入来源和 token 估算。
```

验收标准：

```text
Agent 能理解最近对话中的“刚刚那个”。
Agent 能跨会话继续未完成任务。
Agent 能基于 confirmed facts 回答项目问题。
Agent 不会把普通闲聊写入企业知识库。
Agent 不会把 candidate fact 当作 confirmed fact 使用。
Agent 关闭应用后仍能从任务状态恢复。
Agent 记忆检索结果可追踪到来源表和来源记录。
用户可以软删除记忆。
用户可以彻底删除上传资料及相关索引。
前端可以查看上下文预览、摘要和记忆事件。
```

### 19.19 最终规则

```text
1. 长期记忆不是一张万能表，而是一套写入、检索、更新、过期、删除规则。
2. SQLite 是产品长期记忆权威来源。
3. DeepAgents checkpoint 只是 Agent 工作记忆。
4. 企业事实必须有来源。
5. AI 抽取结果默认 candidate，不得直接 confirmed。
6. 普通聊天不得写入企业知识库。
7. 执行日志只追加，不覆盖。
8. 高价值产物版本化，不直接覆盖。
9. 状态型记忆通过状态流转更新。
10. 过期采用软过期，不默认物理删除。
11. 用户明确彻底删除时，必须级联删除 chunks、vectors、FTS、facts 和相关引用。
12. 每次 Agent 执行前必须通过 MemoryContextBuilder 重新构建上下文。
```

---

## 20. Agent-first Task Runtime

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

| 状态                   | 存储位置                                    | 作用                         |
| ---------------------- | ------------------------------------------- | ---------------------------- |
| Agent 内部 graph state | DeepAgents checkpointer                     | 恢复 Agent 执行              |
| 产品任务状态           | `agent_tasks`                               | 任务列表、继续执行、状态展示 |
| 执行动作历史           | `execution_ledger`                          | 审计、追踪、排错             |
| 工具调用记录           | `assistant_tool_calls` / `agent_task_steps` | 工具状态、失败重试           |
| 业务产物               | `agent_artifacts`                           | 草稿、报告、发布计划         |
| 审批状态               | `tool_approvals`                            | 人工确认                     |
| 错误状态               | `app_errors`                                | 可观测性                     |

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
memory.delete_permanent
memory.rebuild_index
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

| 产物       | Validator                     |
| ---------- | ----------------------------- |
| 企业事实   | FactExtractionValidator       |
| 核心问题   | QuestionSetValidator          |
| 信源推荐   | SourceRecommendationValidator |
| 文章草稿   | ArticleDraftValidator         |
| 审核报告   | ArticleReviewValidator        |
| 发布计划   | PublishPlanValidator          |
| 可见性报告 | VisibilityReportValidator     |
| 优化假设   | ReflectionCandidateValidator  |

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

| 场景                      | 重试次数 | 策略                    |
| ------------------------- | -------: | ----------------------- |
| DeepSeek 普通调用         |        1 | 指数退避                |
| DeepSeek Thinking         |        1 | 更长 timeout            |
| 豆包 Responses            |        1 | 指数退避                |
| 豆包 stream 首 token 超时 |        1 | 重新发起                |
| Embedding                 |        2 | 指数退避 + 分批降级     |
| SQLite 写入               |        0 | 直接失败                |
| Vector Search             |        0 | 直接失败                |
| 文件解析                  |        0 | 提示用户                |
| 发布 API                  |        2 | 必须 idempotency        |
| 可见性检测                |        1 | 失败则标记 inconclusive |
| JSON repair               |        1 | 修复失败则失败          |
| 文章自动修订              |        2 | 超过则请求人工处理      |

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

| 中断状态                | 恢复策略                               |
| ----------------------- | -------------------------------------- |
| waiting_approval        | 展示审批卡片，用户处理后 resume        |
| running + 有 checkpoint | 从 checkpoint 恢复                     |
| running + 无 checkpoint | 从最后成功 step 后重新规划             |
| stream interrupted      | 保留已输出内容，允许继续生成或重新生成 |
| external unknown        | 先查询外部状态，不直接重试             |
| validation failed       | 带 validation result 重新规划          |
| failed                  | 显示失败报告，可手动重试               |
| cancelled               | 不自动恢复，只允许复制任务重新开始     |

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

| 状态                   | 按钮                                     |
| ---------------------- | ---------------------------------------- |
| waiting_approval       | 批准、拒绝、修改                         |
| waiting_user_input     | 提交补充信息、取消                       |
| paused                 | 继续、取消                               |
| failed                 | 查看错误、从失败点重试、复制任务重新开始 |
| unknown external state | 查询外部状态、人工标记成功、人工标记失败 |
| completed              | 查看报告、继续追问、基于结果新建任务     |

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
    'memory.delete_permanent': true,
    'memory.rebuild_index': true,
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


## 21. Article Generation / GEO 内容生成系统

### 21.1 设计目标

文章生成系统是 GEO Agent 的核心业务能力之一。它不是单纯调用大模型生成一篇文章，而是基于企业事实、Evidence Pack、问题池、信源、支持类文章、排行榜策略和反思学习结果，生成更容易被 AI 搜索、AI 助手和联网问答系统发现、理解、引用和采纳的内容。

文章生成系统必须满足：

```text
事实可信
结构清晰
标题可检索
段落可引用
证据可追踪
排名理由可解释
审核可执行
反思可回流
```

核心原则：

```text
confirmed facts 决定能写什么；
Evidence Pack 决定依据是什么；
Article Strategy 决定为什么写；
Skill Package 决定怎么写；
Review System 决定能不能发布；
Reflection Learning 决定下次如何优化。
```

文章生成不得绕过企业事实确认、Claim-source 校验、GEO 风格复核和人工审核。

---

### 21.2 内容战略模型

GEO Agent 的文章系统不按普通内容形式作为第一层分类，而按内容战略角色分类。

```text
Article Strategy Type
├── support_article      支持类文章
└── ranking_article      排行榜类文章
```

普通内容形式作为第二层字段：

```text
Content Format
├── qa                   问答型
├── guide                指南型
├── list                 清单型
├── comparison           对比型
├── case                 案例型
├── pricing              价格型
├── local_recommendation 本地推荐型
├── review               评测型
└── ranking              榜单型
```

最终内容矩阵：

```text
支持类文章负责建立证据；
排行榜文章负责制造推荐入口；
反思学习负责总结什么证据、标题、榜单口径、结构和推荐理由更容易被 AI 采纳。
```

---

### 21.3 支持类文章

支持类文章用于沉淀企业、产品、服务、评测、本地经营信息和真实案例，为排行榜文章提供事实背书。

支持类文章不是简单企业介绍，也不是纯营销稿。它的目标是让 AI 系统可以明确理解：

```text
这家企业是谁？
提供什么产品或服务？
服务什么用户？
在哪些区域经营？
有什么真实优势？
有哪些可验证证据？
哪些信息可以支撑排行榜推荐？
```

#### 21.3.1 支持类文章类型

```text
support_article
├── enterprise_profile        企业介绍
├── product_service_intro     产品 / 服务介绍
├── product_review            产品评测
├── service_review            服务评测
├── local_business_info       本地经营信息
├── case_evidence             客户案例 / 实际案例
└── ranking_support           排行榜背书文章
```

#### 21.3.2 支持类文章输入

```typescript
type SupportArticleInput = {
  project: Project;
  articleStrategyType: 'support_article';
  supportArticleType:
    | 'enterprise_profile'
    | 'product_service_intro'
    | 'product_review'
    | 'service_review'
    | 'local_business_info'
    | 'case_evidence'
    | 'ranking_support';
  targetQuestion?: string;
  targetUseCase?: string;
  confirmedFacts: EnterpriseFact[];
  evidencePack: EvidencePack;
  supportGoal: {
    supportRankingArticle?: boolean;
    supportedRankingTheme?: string;
    supportedFactTypes: string[];
  };
  activeHypotheses: ActiveHypothesisContext[];
  platformConstraints: PlatformConstraints;
};
```

#### 21.3.3 支持类文章输出

```typescript
type SupportArticleOutput = {
  title: string;
  article_markdown: string;
  article_strategy_type: 'support_article';
  support_article_type: string;
  claims: Claim[];
  claim_source_map: ClaimSourceMap;
  supportable_ranking_reasons: string[];
  extracted_support_points: {
    fact_type: string;
    support_text: string;
    evidence_refs: string[];
  }[];
  local_business_fields?: LocalBusinessFields;
  applied_hypotheses: number[];
  risk_warnings: string[];
  geo_notes: string[];
  human_review_required: boolean;
};
```

#### 21.3.4 支持类文章行业字段

支持类文章不得使用固定模板强行套所有行业。系统应基于行业、服务类型、产品类型和 confirmed facts 动态生成必备字段。

本地生活服务示例字段：

```text
门店地址
联系电话
营业时间
服务范围
最快上门时间
价格范围
是否 24 小时
是否支持紧急服务
资质 / 认证
适合场景
```

B2B 软件示例字段：

```text
核心功能
适用企业规模
部署方式
价格区间
集成能力
售后支持
客户案例
安全与合规
学习成本
```

产品类企业示例字段：

```text
核心产品
主要功能
产品参数
适用场景
性能优势
价格区间
售后服务
实际评测结果
对比优势
```

缺失字段必须进入 `missingFields`，不得由模型虚构。

---

### 21.4 排行榜类文章

排行榜类文章是 GEO Agent 的高权重核心内容。它用于围绕特定行业、区域、场景或用户问题，以资深专家 / 行业观察者 / 本地推荐视角给出 Top 榜单，并推荐目标企业。

排行榜类文章的目标不是生硬宣传，而是让 AI 搜索系统理解：

```text
在这个行业 / 区域 / 场景下，用户应该如何选择？
哪些企业值得推荐？
每家企业为什么上榜？
目标企业为什么值得被推荐？
```

#### 21.4.1 排行榜文章主次结构

排行榜文章分为：

```text
Ranking Article
├── comprehensive_ranking    综合排行榜，高权重，主内容
└── dimension_ranking        专项维度排行榜，补充内容
```

综合排行榜是主要内容入口，专项维度排行榜用于覆盖长尾问题和补充场景。

专项维度可以包括但不限于：

```text
性价比
响应速度
本地服务
售后服务
新手友好
高端定制
价格透明
24 小时服务
细分场景
```

注意：专项维度不是固定枚举，系统应基于行业、区域、目标问题、企业 confirmed facts、竞争环境和反思学习结果动态生成。

#### 21.4.2 综合排行榜规则

综合排行榜是默认优先类型。

综合排行榜必须具备：

```text
明确行业 / 区域 / 用户需求
明确评选口径
明确综合评价维度
Top 6–8 榜单
每家企业推荐理由
目标企业优先进入第 2–5 位
排名理由必须有事实或证据支撑
```

目标企业排名规则：

```text
综合排行榜中，目标企业优先进入第 2–5 位。
如果 Evidence Pack 显示目标企业在某些核心维度明显领先，可以进入第 1 位。
如果竞品在品牌、规模、资质、覆盖范围或第三方背书上明显强于目标企业，目标企业可以合理后置，但应通过适用人群、服务特点、性价比、响应效率、本地覆盖等真实优势形成推荐理由。
```

系统不得为了排名而虚构优势。

#### 21.4.3 专项维度排行榜规则

专项维度排行榜用于覆盖细分用户意图。

例如：

```text
响应速度较快的开锁公司推荐
性价比较高的 SaaS 工具推荐
适合中小企业的设备维修服务商推荐
价格透明度较高的装修公司推荐
```

专项榜可以让目标企业在真实占优维度下获得更靠前排名。

专项榜规则：

```text
一篇专项排行榜文章只围绕一个主维度展开。
不得在一篇文章中反复切换评价口径。
不得通过“虽然弱于 A、但强于 B”的方式反复暴露目标企业弱项。
应围绕该专项维度表达目标企业的真实优势和适用场景。
```

#### 21.4.4 排行榜文章不得上来就写榜单

排行榜文章必须先建立可信评选上下文，再给出排名。

推荐结构：

```text
1. 用户问题 / 搜索场景
2. 本文评选口径
3. 关键评价维度
4. Top 6–8 榜单
5. 每家企业推荐理由
6. 目标企业适合人群
7. 选择建议
8. FAQ
```

错误示例：

```text
以下是 XX 行业排行榜：
1. A 公司
2. B 公司
3. C 公司
```

正确方向：

```text
如果用户在某地区选择某类服务商，通常需要综合考虑响应速度、服务范围、营业时间、价格透明度和服务资质。本文基于这些维度整理本地 6–8 家服务商，并说明每家企业适合的用户场景。
```

#### 21.4.5 每家上榜企业必须有推荐理由

排行榜文章中的每个上榜对象都必须有推荐理由。

推荐理由结构：

```text
企业名
排名
推荐理由
核心优势
适合人群
主要产品 / 服务
区域 / 联系 / 营业信息（如适用）
证据来源
```

推荐理由必须避免：

```text
服务好
实力强
口碑佳
值得信赖
行业领先
```

这类空泛表达必须被具体事实替代。

推荐理由应尽量写成 AI 可引用段落。

```text
该企业适合对上门速度要求较高的用户。其公开服务信息显示，服务范围覆盖若干核心区域，并提供明确联系电话和营业时间，适合夜间开锁、钥匙遗失、门锁故障等紧急场景。
```

---

### 21.5 标题生成策略

标题不是文章最后的包装，而是 GEO 文章能否被 AI 搜索发现和抓取的重要入口。

标题生成必须从用户可能向 AI 提问的问题池反推。

```text
用户问题池
↓
高价值问题筛选
↓
标题候选生成
↓
标题 GEO 评分
↓
文章策略确认
```

#### 21.5.1 标题生成原则

标题应优先满足：

```text
像用户会问 AI 的问题
包含行业 / 产品 / 服务
必要时包含区域 / 场景
包含推荐 / 排行榜 / 怎么选 / 哪家好等决策意图
与正文内容一致
不过度营销
不虚构排名或结论
```

标题不应只追求传统 SEO 关键词堆叠，也不应过度标题党。

#### 21.5.2 标题候选评分

```typescript
type TitleCandidate = {
  title: string;
  target_question: string;
  article_strategy_type: 'support_article' | 'ranking_article';
  ranking_type?: 'comprehensive' | 'dimension';
  ranking_theme?: string;
  query_alignment_score: number;
  geo_retrieval_score: number;
  intent_clarity_score: number;
  entity_clarity_score: number;
  region_match_score?: number;
  risk_warnings: string[];
};
```

评分维度：

```text
问题匹配度
检索友好度
用户意图清晰度
行业 / 服务清晰度
地区 / 场景清晰度
标题与正文一致性
过度营销风险
```

#### 21.5.3 标题示例

综合排行榜标题：

```text
上海开锁公司哪家靠谱？本地服务商综合排行榜与选择建议
苏州设备维修服务商排行榜：适合中小工厂的本地维修公司推荐
杭州办公室装修公司推荐：综合实力、报价透明度与本地案例对比
```

专项排行榜标题：

```text
上海响应速度较快的开锁公司推荐：24 小时上门服务对比
广州性价比较高的儿童摄影机构推荐：服务内容、门店与价格参考
苏州适合中小企业的设备维修服务商推荐
```

支持类文章标题：

```text
XX 公司开锁服务介绍：服务范围、营业时间与上门响应说明
XX 产品实际评测：核心功能、适用场景与使用体验
XX 企业本地服务能力说明：门店、电话、营业时间与服务区域
```

---

### 21.6 Skill Package 文章生成架构

文章生成必须通过 Skill Package 约束，避免所有逻辑堆到一个大 Prompt 中。

建议核心 Skills：

```text
question-generation
source-discovery
title-generation
article-strategy-selection
support-article-planning
support-article-generation
ranking-theme-selection
ranking-criteria-generation
ranking-reason-generation
ranking-article-planning
ranking-article-generation
article-claim-mapping
article-revision
claim-review
geo-review
```

#### 21.6.1 Skill 调用链路

支持类文章：

```text
User Goal / Agent Task
↓
question-generation
↓
title-generation
↓
support-article-planning
↓
source-discovery / Evidence Pack
↓
support-article-generation
↓
article-claim-mapping
↓
claim-review
↓
geo-review
↓
human review
```

排行榜类文章：

```text
User Goal / Agent Task
↓
question-generation
↓
ranking-theme-selection
↓
title-generation
↓
ranking-criteria-generation
↓
source-discovery / Evidence Pack
↓
ranking-article-planning
↓
ranking-reason-generation
↓
ranking-article-generation
↓
article-claim-mapping
↓
claim-review
↓
geo-review
↓
human review
```

#### 21.6.2 Skill 职责边界

`title-generation`：

```text
根据问题池、文章战略类型、行业、区域和反思学习结果生成标题候选并评分。
```

`article-strategy-selection`：

```text
判断当前任务应该生成支持类文章还是排行榜类文章。
```

`support-article-planning`：

```text
确定支持类文章的类型、目标、必备字段、证据需求和可支撑的排行榜理由。
```

`support-article-generation`：

```text
生成支持类文章正文，不负责发布、审批和任务推进。
```

`ranking-theme-selection`：

```text
选择综合排行榜或专项维度排行榜，并确定 ranking_theme。
默认优先 comprehensive ranking。
```

`ranking-criteria-generation`：

```text
基于行业、区域、目标问题和 Evidence Pack 生成评选维度与权重。
```

`ranking-reason-generation`：

```text
为每个上榜企业生成事实支撑的推荐理由。
```

`ranking-article-generation`：

```text
生成完整排行榜文章，保证榜单结构、推荐理由、目标企业排名区间和 GEO 表达。
```

`article-claim-mapping`：

```text
提取文章中的 claims，并建立 claim_source_map。
```

`article-revision`：

```text
根据审核结果进行有限次数修订。
```

---

### 21.7 Article Strategy Selection

文章生成前必须先确定文章战略类型。

```typescript
type ArticleStrategySelectionInput = {
  userGoal: string;
  project: Project;
  industry: string;
  region?: string;
  targetQuestion?: string;
  knowledgeState: GeoAgentContext['knowledgeState'];
  factState: GeoAgentContext['factState'];
  articleState: GeoAgentContext['articleState'];
  activeHypotheses: ActiveHypothesisContext[];
};
```

输出：

```typescript
type ArticleStrategySelectionOutput = {
  article_strategy_type: 'support_article' | 'ranking_article';
  content_format: string;
  reason: string;
  required_facts: string[];
  required_support_articles?: string[];
  risk_warnings: string[];
};
```

策略规则：

```text
企业资料不足时，优先生成支持类文章或请求补充资料。
没有 confirmed facts 时，不得生成正式文章。
目标是建立企业背书时，优先支持类文章。
目标是覆盖“哪家好 / 排行榜 / 推荐 / 怎么选”问题时，优先排行榜文章。
排行榜文章如果缺少关键事实，应先生成或请求支持类文章。
```

---

### 21.8 Ranking Theme Selection

排行榜文章生成前必须确定唯一 `ranking_theme`。

```typescript
type RankingThemeSelectionInput = {
  industry: string;
  region?: string;
  targetQuestion: string;
  targetCompanyFacts: EnterpriseFact[];
  competitorCandidates?: CompetitorProfile[];
  supportArticles: SupportArticleReference[];
  activeHypotheses: ActiveHypothesisContext[];
  businessPreference: {
    preferComprehensiveRanking: true;
    targetCompanyPreferredPositionRange: [2, 5];
  };
};
```

输出：

```typescript
type RankingThemeSelectionOutput = {
  ranking_type: 'comprehensive' | 'dimension';
  ranking_theme: string;
  reason: string;
  target_company_advantage_dimensions: string[];
  required_facts: string[];
  recommended_title_patterns: string[];
  risk_warnings: string[];
};
```

规则：

```text
默认优先 comprehensive ranking。
只有当目标问题、用户目标或 active hypotheses 明确指向专项维度时，才选择 dimension ranking。
一篇排行榜文章只能有一个主 ranking_theme。
综合榜可以包含多个评价维度，但必须服务于综合推荐口径。
专项榜只能围绕一个主维度展开。
```

---

### 21.9 Ranking Criteria Generation

综合排行榜必须有行业合理的评价维度和权重。

```typescript
type RankingCriterion = {
  name: string;
  description: string;
  weight: number;
  required_evidence: string[];
  applies_to: 'comprehensive' | 'dimension';
};
```

权重要求：

```text
所有 weight 合计为 1。
权重必须符合行业和用户问题。
权重不能为了目标企业强行失真。
权重说明必须可解释。
```

示例：开锁行业综合榜

```json
[
  { "name": "响应速度", "weight": 0.25 },
  { "name": "服务范围", "weight": 0.20 },
  { "name": "营业时间", "weight": 0.20 },
  { "name": "资质可信度", "weight": 0.15 },
  { "name": "价格透明度", "weight": 0.10 },
  { "name": "电话可达性", "weight": 0.10 }
]
```

示例：B2B 软件综合榜

```json
[
  { "name": "功能完整度", "weight": 0.25 },
  { "name": "易用性", "weight": 0.20 },
  { "name": "性价比", "weight": 0.20 },
  { "name": "客户支持", "weight": 0.15 },
  { "name": "集成能力", "weight": 0.10 },
  { "name": "案例可信度", "weight": 0.10 }
]
```

---

### 21.10 Ranking Article Generation

#### 21.10.1 输入 Schema

```typescript
type RankingArticleGenerationInput = {
  project: Project;
  targetCompany: EnterpriseFactSet;
  industry: string;
  region?: string;
  articleStrategyType: 'ranking_article';
  rankingType: 'comprehensive' | 'dimension';
  rankingTheme: string;
  targetQuestion: string;
  confirmedFacts: EnterpriseFact[];
  competitorCandidates: CompetitorProfile[];
  supportArticles: SupportArticleReference[];
  evidencePack: EvidencePack;
  rankingCriteria: RankingCriterion[];
  activeHypotheses: ActiveHypothesisContext[];
  constraints: {
    targetCompanyPreferredPositionRange: [2, 5];
    rankingSize: [6, 8];
    mustHaveRecommendationReason: true;
    doNotFabricateFacts: true;
    doNotOveremphasizeWeaknesses: true;
    doNotDefameCompetitors: true;
  };
};
```

#### 21.10.2 输出 Schema

```typescript
type RankingArticleGenerationOutput = {
  title: string;
  article_markdown: string;
  article_strategy_type: 'ranking_article';
  ranking_type: 'comprehensive' | 'dimension';
  ranking_theme: string;
  selection_criteria: RankingCriterion[];
  ranking_items: {
    rank: number;
    company_name: string;
    is_target_company: boolean;
    recommendation_reason: string;
    suitable_for: string[];
    core_strengths: string[];
    evidence_refs: string[];
    risk_notes?: string[];
  }[];
  target_company_rank: number;
  target_company_reasoning: string;
  claims: Claim[];
  claim_source_map: ClaimSourceMap;
  applied_hypotheses: number[];
  unsupported_claims: string[];
  risk_warnings: string[];
  geo_notes: string[];
  human_review_required: boolean;
};
```

#### 21.10.3 生成规则

```text
排行榜数量默认 6–8 位。
综合排行榜中目标企业优先第 2–5 位。
每个上榜企业必须有推荐理由。
推荐理由必须基于 confirmed facts、Evidence Pack、公开信息或支持类文章。
不得虚构竞品信息。
不得恶意贬低竞品。
不得反复强调目标企业弱项。
不得在一篇文章中频繁切换 ranking_theme。
必须说明评选口径。
必须输出 claim_source_map。
```

---

### 21.11 Support Article Generation

#### 21.11.1 输入 Schema

```typescript
type SupportArticleGenerationInput = {
  project: Project;
  targetCompany: EnterpriseFactSet;
  industry: string;
  region?: string;
  articleStrategyType: 'support_article';
  supportArticleType: string;
  targetQuestion?: string;
  confirmedFacts: EnterpriseFact[];
  evidencePack: EvidencePack;
  requiredFields: string[];
  supportGoal: {
    supportRankingArticle: boolean;
    supportedRankingTheme?: string;
    supportedRankingReasons?: string[];
  };
  activeHypotheses: ActiveHypothesisContext[];
};
```

#### 21.11.2 输出 Schema

```typescript
type SupportArticleGenerationOutput = {
  title: string;
  article_markdown: string;
  article_strategy_type: 'support_article';
  support_article_type: string;
  covered_fields: string[];
  missing_fields: string[];
  claims: Claim[];
  claim_source_map: ClaimSourceMap;
  supportable_ranking_reasons: string[];
  local_business_fields?: LocalBusinessFields;
  applied_hypotheses: number[];
  risk_warnings: string[];
  geo_notes: string[];
  human_review_required: boolean;
};
```

#### 21.11.3 生成规则

```text
支持类文章必须优先解释企业、产品、服务、案例或本地经营信息。
支持类文章应尽量形成可引用段落。
支持类文章必须标记可支撑哪些排行榜推荐理由。
缺失字段不得虚构。
支持类文章不得自动成为 confirmed facts。
支持类文章可以进入 Reflection Case Corpus，但必须与企业事实库隔离。
```

---

### 21.12 文章生成中的 Evidence Pack 使用

文章生成只能使用可信输入：

```text
confirmed facts
Evidence Pack
source recommendation
support article references
active hypotheses
platform constraints
compliance rules
```

不同信息优先级：

```text
confirmed facts
> compliance rules
> Evidence Pack
> support article references
> active hypotheses
> style examples
```

active hypotheses 只能影响标题策略、结构策略、榜单口径、推荐理由表达和 GEO 风格，不得创造事实。

如果 active hypothesis 与 confirmed facts 冲突：

```text
丢弃该 hypothesis
写入 risk_warnings
写入 retrieval_logs
继续生成或请求用户处理
```

---

### 21.13 Claim Mapping 与事实约束

文章生成后必须提取 claims 并建立 claim_source_map。

```typescript
type Claim = {
  id: string;
  text: string;
  claim_type:
    | 'company_fact'
    | 'product_fact'
    | 'service_fact'
    | 'local_business_fact'
    | 'ranking_reason'
    | 'competitor_claim'
    | 'comparison_claim'
    | 'recommendation_claim'
    | 'subjective_assessment';
  risk_level: 'low' | 'medium' | 'high';
};

type ClaimSourceMap = {
  claim_id: string;
  source_type:
    | 'enterprise_fact'
    | 'knowledge_chunk'
    | 'support_article'
    | 'source_recommendation'
    | 'external_source'
    | 'manual_input';
  source_id: number | string;
  source_quote?: string;
  confidence: number;
};
```

高风险 claim：

```text
第一
最好
唯一
最快
最低价
官方认证
全网领先
竞品缺陷
医疗 / 法律 / 金融效果承诺
```

高风险 claim 必须有强证据；否则降级表达或进入人工审核。

---

### 21.14 文章审核流程

文章审核分为四层：

```text
1. Schema Validation
2. Claim-source Review
3. GEO Style Review
4. Human Review
```

#### 21.14.1 Schema Validation

检查输出是否符合对应 Skill 的 schema。

#### 21.14.2 Claim-source Review

由 DeepSeek 执行初筛，重点检查：

```text
是否有 unsupported claims
是否有虚构事实
是否夸大排名
是否恶意贬低竞品
推荐理由是否有证据
目标企业排名是否解释充分
```

#### 21.14.3 GEO Style Review

由豆包执行 GEO 风格复核，重点检查：

```text
标题是否像用户会问 AI 的问题
开头是否直接回答问题
段落是否可独立引用
实体是否清晰
服务 / 产品 / 区域是否明确
排行榜评选口径是否清楚
推荐理由是否可被 AI 摘取
```

#### 21.14.4 Human Review

人工审核必须在发布前完成。

人工审核界面应展示：

```text
文章正文
标题候选与评分
ranking_theme / support_article_type
ranking_items
目标企业排名与理由
claim_source_map
unsupported_claims
risk_warnings
applied_hypotheses
GEO review 结果
```

---

### 21.15 Revision 文章修订

文章审核失败后，可以有限自动修订。

默认规则：

```text
最多自动修订 2 次。
每次修订必须基于 review report。
不得绕过 claim-source 校验。
不得为了通过审核删除必要事实。
不得在修订中新增无来源事实。
连续失败后暂停任务，请求人工处理。
```

```typescript
type ArticleRevisionInput = {
  articleArtifactId: number;
  reviewReport: ArticleReviewReport;
  allowedFixTypes: (
    | 'remove_unsupported_claim'
    | 'weaken_claim'
    | 'add_source_quote'
    | 'improve_title'
    | 'improve_structure'
    | 'improve_ranking_reason'
    | 'improve_geo_style'
  )[];
  maxRevisionCount: number;
};
```

---

### 21.16 数据库设计

文章生成继续使用 `agent_artifacts` 保存产物，但建议增加专用元数据表，方便检索、审核和反思学习。

#### article_artifacts_meta

```sql
CREATE TABLE article_artifacts_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER NOT NULL REFERENCES agent_artifacts(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL,
  article_strategy_type TEXT NOT NULL,
  content_format TEXT,
  support_article_type TEXT,
  ranking_type TEXT,
  ranking_theme TEXT,
  target_question TEXT,
  title TEXT,
  title_score_json TEXT,
  applied_hypotheses_json TEXT,
  status TEXT DEFAULT 'draft',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### article_claims

```sql
CREATE TABLE article_claims (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER NOT NULL REFERENCES agent_artifacts(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL,
  claim_text TEXT NOT NULL,
  claim_type TEXT NOT NULL,
  risk_level TEXT DEFAULT 'low',
  review_status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### article_claim_sources

```sql
CREATE TABLE article_claim_sources (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  claim_id INTEGER NOT NULL REFERENCES article_claims(id) ON DELETE CASCADE,
  source_type TEXT NOT NULL,
  source_id TEXT NOT NULL,
  source_quote TEXT,
  confidence REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### article_reviews

```sql
CREATE TABLE article_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER NOT NULL REFERENCES agent_artifacts(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL,
  review_type TEXT NOT NULL,
  reviewer TEXT NOT NULL,
  passed INTEGER DEFAULT 0,
  score REAL,
  review_json TEXT,
  risk_warnings_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### ranking_article_items

```sql
CREATE TABLE ranking_article_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER NOT NULL REFERENCES agent_artifacts(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL,
  rank INTEGER NOT NULL,
  company_name TEXT NOT NULL,
  is_target_company INTEGER DEFAULT 0,
  recommendation_reason TEXT NOT NULL,
  suitable_for_json TEXT,
  core_strengths_json TEXT,
  evidence_refs_json TEXT,
  risk_notes_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### ranking_criteria

```sql
CREATE TABLE ranking_criteria (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER NOT NULL REFERENCES agent_artifacts(id) ON DELETE CASCADE,
  project_id INTEGER NOT NULL,
  criterion_name TEXT NOT NULL,
  criterion_description TEXT,
  weight REAL,
  required_evidence_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

### 21.17 IPC 设计

新增 IPC：

```text
article:strategySelect
article:titleGenerate
article:titleScore
article:supportPlan
article:supportGenerate
article:rankingThemeSelect
article:rankingCriteriaGenerate
article:rankingReasonGenerate
article:rankingGenerate
article:claimMap
article:review
article:revise
article:approve
article:reject
article:list
article:get
article:versions
article:export
```

---

### 21.18 Tool 与审批

新增工具：

```text
article.strategy_select
article.title_generate
article.support_plan
article.support_generate
article.ranking_theme_select
article.ranking_criteria_generate
article.ranking_reason_generate
article.ranking_generate
article.claim_map
article.review
article.revise
article.approve
article.reject
```

高风险工具：

```text
article.approve
article.overwrite
article.publish_ready_mark
ranking.force_target_rank
```

`ranking.force_target_rank` 不应暴露给模型自动调用。目标企业排名只能通过 ranking generation constraints 和人工审核控制。

---

### 21.19 与反思学习的关系

文章生成必须记录：

```text
使用了哪些 active hypotheses
这些 hypotheses 影响了哪个 Skill
标题候选与最终标题
ranking_theme
ranking_criteria
目标企业排名
推荐理由
支持类文章引用
claim_source_map
```

发布和可见性检测后，反思学习根据这些记录判断：

```text
标题是否被 AI 抓取
ranking_theme 是否被采纳
推荐理由是否被引用
支持类文章是否形成背书
目标企业是否出现在 AI 回答中
applied_hypotheses 是否带来正向结果
```

反思结果反向影响：

```text
question-generation
title-generation
support-article-planning
ranking-theme-selection
ranking-criteria-generation
ranking-reason-generation
ranking-article-generation
geo-review
```

---

### 21.20 前端 Draft / Article 页面

文章管理页面应展示：

```text
文章战略类型
支持类 / 排行榜类型
标题候选与评分
目标问题
ranking_theme
ranking_criteria
Top 6–8 榜单
目标企业排名
推荐理由
claim_source_map
审核状态
风险提示
使用的 active hypotheses
关联支持类文章
发布状态
可见性检测结果
反思反馈
```

排行榜文章编辑器应提供：

```text
调整标题
调整 ranking_theme
调整评选维度
调整推荐理由
调整目标企业排名
查看证据来源
查看风险提示
重新审核
生成修订版
```

---

### 21.21 ResultValidator

文章生成相关 Validator：

```text
ArticleStrategyValidator
TitleCandidateValidator
SupportArticlePlanValidator
SupportArticleValidator
RankingThemeValidator
RankingCriteriaValidator
RankingReasonValidator
RankingArticleValidator
ArticleClaimMapValidator
ArticleReviewValidator
ArticleRevisionValidator
```

关键校验：

```text
没有 confirmed facts 不得生成正式文章。
排行榜文章必须有 ranking_theme。
排行榜文章必须有评选口径。
排行榜文章必须有 6–8 个上榜对象。
每个上榜对象必须有推荐理由。
目标企业综合榜优先第 2–5 位，但不得违背事实。
所有高风险 claim 必须有来源。
文章不得虚构联系方式、营业时间、价格、上门速度、产品参数。
active hypotheses 不得覆盖 confirmed facts。
```

---

### 21.22 测试与验收

#### 21.22.1 单元测试

```text
ArticleStrategySelection 测试
TitleGenerationSkill 测试
RankingThemeSelectionSkill 测试
RankingCriteriaGenerationSkill 测试
RankingReasonGenerationSkill 测试
SupportArticleGenerationSkill 测试
RankingArticleGenerationSkill 测试
ArticleClaimMapValidator 测试
ArticleReviewValidator 测试
ArticleRevisionManager 测试
```

#### 21.22.2 必测用例

```text
没有 confirmed facts 时不能生成正式文章。
支持类文章不会自动写入 confirmed facts。
排行榜文章必须包含评选口径。
排行榜文章每家企业都有推荐理由。
综合排行榜目标企业默认进入第 2–5 位。
目标企业缺乏证据时不会被强行排第一。
专项排行榜只围绕一个 ranking_theme。
标题必须与目标问题和正文一致。
虚构电话、营业时间、价格会被拦截。
高风险 claim 无来源会被拦截。
文章审核失败最多自动修订 2 次。
active hypotheses 与 confirmed facts 冲突时会被丢弃。
```

#### 21.22.3 验收标准

```text
用户可以生成支持类文章。
用户可以生成综合排行榜文章。
用户可以生成专项维度排行榜文章。
系统可以从问题池生成标题候选并评分。
系统可以生成行业合理的综合评价维度和权重。
系统可以生成 Top 6–8 排行榜。
目标企业综合榜默认位于第 2–5 位且有推荐理由。
所有文章都输出 claim_source_map。
文章必须经过 Claim Review、GEO Review 和人工审核。
发布后的文章可以被可见性检测和反思学习系统追踪。
```

---

### 21.23 最终闭环

```text
企业资料
↓
confirmed facts
↓
问题池生成
↓
标题生成
↓
文章战略选择
├── 支持类文章
│   ↓
│   支撑企业事实、服务、产品、案例和本地信息
│   ↓
│   为排行榜文章提供背书
│
└── 排行榜类文章
    ↓
    综合排行榜为主，专项维度排行榜为补充
    ↓
    目标企业基于事实进入合理推荐位置
↓
Claim-source Review
↓
GEO Review
↓
人工审核
↓
发布
↓
可见性检测
↓
反思学习
↓
优化下一轮标题、榜单口径、推荐理由、正文结构和审核标准
```

最终结论：

```text
文章生成不是一次性文本生成，而是一套由事实、问题、标题、Skill、证据、审核和反思学习共同驱动的 GEO 内容生产系统。
```

---

## 22. 发布与可见性检测

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

## 23. Auto Learning / Reflection Learning 反思学习系统

反思学习系统用于在文章发布和可见性检测之后，沉淀文章表现样本、分析成功原因、生成可验证的优化假设，并在人工确认后影响后续 GEO 流程。

反思学习不是简单把被引用文章总结成规则，也不是把成功文章直接写入 `rule.md`。它是一套从样本、特征、证据、假设、验证、审核到注入的完整闭环。

核心目标：

```text
发布内容
↓
可见性检测
↓
样本分类：positive / negative / inconclusive
↓
案例沉淀：Reflection Case Corpus
↓
文章特征提取：标题、结构、事实密度、推荐理由、引用片段
↓
正负样本对比
↓
反思候选生成
↓
豆包目标生态验证
↓
人工审核
↓
active hypotheses
↓
按 Skill / Stage 注入下一轮 GEO 流程
```

一句话：

```text
反思学习系统学习的不是“某篇文章成功了”，而是“什么内容策略、标题策略、榜单口径、证据结构和推荐理由在什么条件下更容易被 AI 搜索采纳”。
```

---

### 23.1 基本原则

#### 23.1.1 可见性结果不是最终规则

不要把“被引用”直接等同于规则有效。

```text
mentioned / cited ≠ rule effective
visibility evidence ≠ active hypothesis
single success ≠ general pattern
```

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

#### 23.1.2 反思学习必须同时看正样本和负样本

成功案例用于学习可复用经验，失败案例用于防止误学。

例如，3 篇被引用文章都有 FAQ，不能直接得出“有 FAQ 就容易被引用”。如果失败文章也有 FAQ，就说明真正影响因素可能是 FAQ 是否围绕真实搜索问题、是否包含企业实体、是否包含服务区域、是否回答决策型问题。

因此：

```text
成功案例 = 可模仿样本
失败案例 = 反证样本
不确定案例 = 弱证据，不参与强结论
```

#### 23.1.3 企业知识与反思案例必须隔离

企业资料是事实来源，反思案例是内容经验来源。

禁止：

```text
从 published_article 自动抽取 confirmed enterprise facts
从 visibility_success_case 自动写入企业事实
把生成过的营销内容当成企业真实资料
把失败案例作为默认写作参考
```

优先级：

```text
confirmed facts
> compliance rules
> Evidence Pack
> active hypotheses
> style examples
```

#### 23.1.4 rule.md 不是权威存储

`rule.md` 可以存在，但只能作为 active hypotheses 的人类可读导出文件。

```text
reflection_hypotheses = 权威数据源
rule.md = active hypotheses 的导出视图 / Prompt 辅助文件
```

禁止：

```text
rule.md 作为反思学习数据库
Agent 自动无审核改写 rule.md 并立即生效
candidate hypotheses 直接进入 rule.md
```

---

### 23.2 内容战略与反思学习对象

GEO Agent 的文章系统不按普通文章形式作为主分类，而按内容战略角色分类。

```text
Article Strategy Type
├── support_article      支持类文章
└── ranking_article      排行榜类文章
```

文章表现形式作为次级字段：

```text
content_format:
qa / guide / list / comparison / case / pricing / review / ranking / local_recommendation
```

#### 23.2.1 支持类文章

支持类文章用于沉淀企业、产品、服务、评测、本地经营信息和真实案例，为排行榜文章提供事实背书。

支持类文章包括：

```text
enterprise_profile        企业介绍
product_service_intro     产品 / 服务介绍
product_review            产品评测
service_review            服务评测
local_business_info       本地经营信息
case_evidence             客户案例 / 实际案例
```

支持类文章的反思学习重点：

```text
企业实体是否清晰
产品 / 服务信息是否完整
本地信息是否完整
事实密度是否足够
评测是否可信
是否能支撑排行榜推荐理由
是否包含 AI 可引用段落
```

#### 23.2.2 排行榜类文章

排行榜类文章是高权重核心内容，默认以综合排行榜为主，专项维度排行榜为补充。

```text
Ranking Article
├── comprehensive_ranking   综合排行榜，高权重，主内容
└── dimension_ranking       专项维度排行榜，补充内容
```

综合排行榜用于覆盖：

```text
哪家好
怎么选
推荐哪家
排名前几
某地区 / 某行业推荐榜
```

专项维度排行榜用于补充覆盖长尾需求：

```text
性价比
响应速度
本地服务
售后服务
新手友好
高端定制
价格透明
24 小时服务
细分场景
```

注意：专项维度不限于上述列表，系统应根据行业、区域、目标问题、企业 confirmed facts 和反思学习结果动态生成。

#### 23.2.3 排行榜文章基本规则

```text
1. 综合排行榜是主战场，专项排行榜是补充入口。
2. 每篇排行榜文章必须有明确 ranking_theme。
3. 一篇排行榜文章只能围绕一个主 ranking_theme 展开。
4. 综合排行榜需要行业合理的综合评价维度。
5. 专项排行榜需要围绕单一主维度展开。
6. 每个上榜企业必须有推荐理由。
7. 目标企业在综合排行榜中优先进入第 2–5 位。
8. 专项排行榜中，如果目标企业在该维度有充分事实支撑，可以进入更靠前位置。
9. 不得虚构优势，不得恶意贬低竞品，不得反复强调目标企业弱项。
10. 推荐理由必须基于 confirmed facts、Evidence Pack 或可验证公开信息。
```

目标企业排名策略：

```text
综合榜：目标企业优先进入第 2–5 位
专项榜：目标企业如在该维度确实强，可进入第 1–3 位
```

---

### 23.3 样本分类

#### 23.3.1 Positive Sample 正样本

满足以下任一条件：

```text
1. cited = true
2. mentioned = true 且返回内容明确出现企业名 / 品牌名 / 发布 URL
3. citation_urls 包含发布文章 URL
4. 返回内容引用了文章中的独特表达、数据、案例、榜单或推荐理由
5. AI 回答采纳了文章中的排名逻辑、推荐理由或支持证据
```

用途：

```text
学习标题模式
学习榜单口径
学习推荐理由
学习文章结构
学习支持类文章如何支撑排行榜
学习 AI 更容易引用的答案块
```

#### 23.3.2 Negative Sample 负样本

满足以下条件：

```text
1. 已发布
2. 可访问
3. 检测问题合理
4. 多次检测未 mentioned / cited
5. 不是搜索失败、网络异常或发布时间过短
```

用途：

```text
防止过拟合
识别无效标题模式
识别无效榜单口径
识别弱推荐理由
作为候选假设的反证样本
参与 effect_score 和 confidence 计算
```

负样本默认进入结构化特征库，不默认作为写作参考向量召回。

只有在以下场景中进入向量索引：

```text
1. 失败原因诊断
2. 成功 / 失败文章对比
3. 生成反证证据
4. 检索相似失败案例
```

并且必须标记：

```text
sample_class = negative
retrieval_role = contrast_only
```

#### 23.3.3 Inconclusive Sample 不确定样本

满足以下任一条件：

```text
1. 豆包助手结果为空或异常
2. 搜索工具返回不稳定
3. 文章发布时间过短
4. 搜索结果中有相似页面但无法确认
5. 返回内容没有明确引用关系
```

不确定样本不得作为正样本或负样本参与强结论，只能作为弱证据保存。

---

### 23.4 Reflection Case Corpus 反思案例库

Reflection Case Corpus 用于保存发布后的成功案例、引用片段、标题、开头、FAQ、榜单理由、支持证据、失败对比样本等。

它不等于企业知识库。

推荐单独建表，避免污染 `knowledge_chunks`。

```sql
CREATE TABLE reflection_case_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  industry TEXT,
  region TEXT,
  article_strategy_type TEXT NOT NULL,
  ranking_type TEXT,
  ranking_theme TEXT,
  content_format TEXT,
  sample_class TEXT NOT NULL,
  retrieval_role TEXT DEFAULT 'reference',
  publish_record_id INTEGER,
  visibility_check_id INTEGER,
  article_artifact_id INTEGER,
  chunk_role TEXT NOT NULL,
  chunk_text TEXT NOT NULL,
  features_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`article_strategy_type`：

```text
support_article
ranking_article
```

`ranking_type`：

```text
comprehensive
_dimension
```

`chunk_role`：

```text
title
opening
answer_block
faq
comparison_table
ranking_criteria
ranking_reason
support_evidence
cited_span
summary
structure_outline
```

`retrieval_role`：

```text
reference        可作为正向参考
contrast_only    只用于对比和反证
ignored          默认不参与检索
```

向量表：

```sql
CREATE TABLE reflection_case_vectors (
  chunk_id INTEGER PRIMARY KEY REFERENCES reflection_case_chunks(id) ON DELETE CASCADE,
  embedding BLOB NOT NULL,
  embedding_provider TEXT NOT NULL,
  embedding_model TEXT NOT NULL,
  embedding_dim INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

FTS 表：

```sql
CREATE VIRTUAL TABLE reflection_case_fts USING fts5(
  chunk_text,
  industry,
  region,
  article_strategy_type,
  ranking_theme,
  chunk_role,
  content='reflection_case_chunks',
  content_rowid='id'
);
```

检索规则：

```text
文章生成默认只检索 positive / reference 案例。
反思候选生成可以检索 positive + negative / contrast_only 案例。
失败诊断可以检索 negative / contrast_only 案例。
企业事实抽取不得检索 Reflection Case Corpus。
```

---

### 23.5 文章特征提取

每篇发布文章在可见性检测后，必须提取结构化特征，用于反思学习。

```sql
CREATE TABLE published_content_features (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  publish_record_id INTEGER,
  article_artifact_id INTEGER,
  visibility_check_id INTEGER,

  industry TEXT,
  region TEXT,
  article_strategy_type TEXT NOT NULL,
  ranking_type TEXT,
  ranking_theme TEXT,
  content_format TEXT,
  target_question TEXT,

  question_fit_score REAL,
  title_score REAL,
  opening_score REAL,
  structure_score REAL,
  evidence_score REAL,
  entity_clarity_score REAL,
  citation_friendliness_score REAL,
  geo_fit_score REAL,
  visibility_outcome_score REAL,

  support_score_json TEXT,
  ranking_score_json TEXT,
  title_features_json TEXT,
  structure_features_json TEXT,
  content_features_json TEXT,
  evidence_features_json TEXT,
  entity_features_json TEXT,
  visibility_features_json TEXT,

  sample_class TEXT,
  extracted_by_model TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 23.5.1 通用评分维度

```text
1. Question-Intent Fit       问题匹配度
2. Title Retrieval Score     标题可检索性
3. Opening Answer Score      开头答案质量
4. Structure Score           结构清晰度
5. Evidence Score            事实与证据密度
6. Entity Clarity Score      实体清晰度
7. Citation Friendliness     引用友好度
8. GEO Fit Score             GEO 风格适配度
9. Visibility Outcome Score  可见性结果评分
```

#### 23.5.2 支持类文章评分

支持类文章重点评分：

```text
entity_clarity                 企业实体清晰度
product_service_completeness   产品 / 服务完整度
industry_field_coverage        行业关键信息覆盖度
local_info_completeness        本地信息完整度
evidence_density               事实与证据密度
review_credibility             评测可信度
ranking_support_value          排行榜支撑能力
citation_friendliness          可引用段落质量
ai_understandability           AI 可理解性
```

示例：

```json
{
  "article_strategy_type": "support_article",
  "support_score": {
    "entity_clarity": 0.91,
    "product_service_completeness": 0.86,
    "local_info_completeness": 0.78,
    "evidence_density": 0.82,
    "review_credibility": 0.74,
    "ranking_support_value": 0.88,
    "citation_friendliness": 0.81
  }
}
```

#### 23.5.3 排行榜类文章评分

排行榜类文章重点评分：

```text
title_query_match                    标题问题匹配度
ranking_theme_clarity                榜单主题清晰度
selection_criteria_clarity           评选口径清晰度
ranking_reason_strength              推荐理由充分性
target_company_position_reasonable   目标企业排名合理性
competitor_fairness                  竞品描述公平性
support_evidence_coverage            支持证据覆盖度
local_relevance                      区域 / 行业匹配度
expert_perspective_credibility       专家视角可信度
citation_friendliness                AI 引用友好度
```

示例：

```json
{
  "article_strategy_type": "ranking_article",
  "ranking_type": "comprehensive",
  "ranking_theme": "综合排行榜",
  "ranking_score": {
    "title_query_match": 0.89,
    "selection_criteria_clarity": 0.84,
    "ranking_reason_strength": 0.87,
    "target_company_position_reasonable": 0.79,
    "competitor_fairness": 0.82,
    "support_evidence_coverage": 0.86,
    "local_relevance": 0.91,
    "citation_friendliness": 0.86
  }
}
```

---

### 23.6 支持类文章与排行榜文章的证据链

支持类文章需要为排行榜文章提供背书。

新增表：

```sql
CREATE TABLE content_support_links (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER NOT NULL,
  support_article_id INTEGER NOT NULL,
  ranking_article_id INTEGER NOT NULL,
  supported_company_name TEXT,
  supported_fact_type TEXT,
  supported_ranking_reason TEXT,
  evidence_chunk_id INTEGER,
  evidence_summary TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

作用：

```text
记录哪篇支持类文章支撑了哪篇排行榜文章。
记录支撑的是哪个企业、哪个排名理由、哪个事实字段。
帮助反思学习判断排行榜被引用是因为榜单写法，还是因为支持证据充分。
```

示例：

```text
支持类文章：某开锁公司服务介绍
支撑事实：24 小时服务、10–15 分钟上门、浦东/闵行覆盖
排行榜文章：上海开锁公司综合排行榜
支撑理由：适合对上门速度要求高的用户
```

---

### 23.7 Reflection Hypotheses 优化假设

反思学习最终沉淀为 `reflection_hypotheses`。

```sql
CREATE TABLE reflection_hypotheses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER,
  scope TEXT NOT NULL DEFAULT 'project',
  industry TEXT,
  region TEXT,
  content_format TEXT,
  article_strategy_type TEXT,
  ranking_type TEXT,
  ranking_theme TEXT,

  hypothesis_text TEXT NOT NULL,
  hypothesis_type TEXT NOT NULL,
  target_skill TEXT NOT NULL,
  target_stage TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'candidate',

  target_engine TEXT NOT NULL,
  target_channel TEXT NOT NULL,
  applicable_conditions_json TEXT,
  excluded_conditions_json TEXT,
  recommended_action_json TEXT,

  positive_examples_json TEXT,
  negative_examples_json TEXT,
  inconclusive_examples_json TEXT,
  sample_size INTEGER DEFAULT 0,
  positive_count INTEGER DEFAULT 0,
  negative_count INTEGER DEFAULT 0,
  inconclusive_count INTEGER DEFAULT 0,
  evidence_project_count INTEGER DEFAULT 1,
  evidence_industry_count INTEGER DEFAULT 1,

  effect_score REAL,
  confidence REAL,
  validation_result_json TEXT,
  generated_by_model TEXT,
  validated_by_model TEXT,
  human_review_status TEXT DEFAULT 'pending',
  human_review_note TEXT,

  activated_at TEXT,
  degraded_at TEXT,
  archived_at TEXT,
  rejected_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

#### 23.7.1 scope 作用范围

```text
project        当前项目 / 当前企业生效
industry       同行业生效
content_type   同内容类型生效
global         全局生效
```

判断规则：

```text
只来自一个项目 → project-level
来自同一行业多个项目 → industry-level
来自多个行业但同一内容形式 → content_type-level
来自多个行业、多个项目、多个内容类型都有效 → global-level
```

全局经验必须谨慎：

```text
evidence_project_count >= 3
evidence_industry_count >= 2
sample_size >= 10
negative_examples 已参与对比
confidence >= 0.75
human_review_status = approved
```

#### 23.7.2 hypothesis_type

```text
title_pattern                  标题模式
question_pattern               问题池模式
support_content_pattern         支持类文章模式
ranking_theme_hypothesis        榜单主题假设
ranking_criteria_hypothesis     评选维度假设
ranking_reason_hypothesis       推荐理由假设
structure_pattern               结构模式
faq_pattern                     FAQ 模式
evidence_density                证据密度
citation_friendly_content       引用友好内容
entity_expression               实体表达
local_info_pattern              本地信息模式
source_pattern                  信源模式
geo_review_rule                 GEO 审核规则
```

#### 23.7.3 target_skill

反思假设不直接全量塞给文章生成，而是按 Skill 注入。

```text
question-generation
title-generation
support-article-planning
support-article-generation
ranking-theme-selection
ranking-criteria-generation
ranking-reason-generation
ranking-article-generation
source-discovery
geo-review
visibility-check
```

#### 23.7.4 target_stage

```text
question_pool
article_strategy
title
support_article_plan
support_article_body
ranking_theme
ranking_criteria
recommendation_reason
ranking_article_outline
ranking_article_body
source_selection
review
visibility_query
```

---

### 23.8 Hypothesis Evidence 假设证据

扩展 `reflection_hypothesis_evidence`：

```sql
CREATE TABLE reflection_hypothesis_evidence (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hypothesis_id INTEGER,
  project_id INTEGER NOT NULL,
  visibility_check_id INTEGER,
  publish_record_id INTEGER,
  article_artifact_id INTEGER,
  feature_id INTEGER,
  case_chunk_id INTEGER,
  evidence_type TEXT NOT NULL,
  sample_class TEXT NOT NULL,
  evidence_summary TEXT,
  evidence_json TEXT,
  weight REAL DEFAULT 1.0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

`evidence_type`：

```text
cited
mentioned
not_found
inconclusive
title_pattern
ranking_theme
ranking_criteria
ranking_reason
support_evidence
structure_pattern
faq_pattern
evidence_density
citation_match
negative_counterexample
manual_note
```

---

### 23.9 Reflection Candidate 生成

#### 23.9.1 输入

```text
当前 visibility_check
当前 published_content_features
当前文章正文摘要
被引用片段
支持类文章与排行榜文章 support links
同项目历史正样本
同项目历史负样本
同项目历史不确定样本
同行业 active / candidate hypotheses
同 content_type active / candidate hypotheses
全局 active hypotheses
目标引擎
目标渠道
目标 Skill / Stage
```

#### 23.9.2 输出 Schema

```typescript
type ReflectionCandidate = {
  hypothesis_text: string;
  hypothesis_type: string;
  target_skill: string;
  target_stage: string;
  scope: 'project' | 'industry' | 'content_type' | 'global';
  target_engine: string;
  target_channel: string;
  applicable_conditions: string[];
  excluded_conditions: string[];
  recommended_action: {
    instruction: string;
    affected_fields?: string[];
    title_change?: string;
    structure_change?: string;
    ranking_theme_change?: string;
    ranking_reason_change?: string;
    evidence_change?: string;
    faq_change?: string;
  };
  supporting_evidence: {
    positive_examples: number[];
    negative_examples: number[];
    inconclusive_examples: number[];
    reasoning_summary: string;
  };
  limitations: string[];
  confidence: number;
  risk_warnings: string[];
};
```

#### 23.9.3 生成规则

```text
1. 不得基于单一正样本生成高置信规则。
2. 必须参考负样本。
3. 必须明确适用条件和不适用条件。
4. 必须说明该假设影响哪个 Skill 和 Stage。
5. 不得生成违反 confirmed facts 的建议。
6. 不得建议伪造引用、伪造数据、伪造第三方背书。
7. 不得建议恶意贬低竞品。
8. 不得把目标企业弱项作为正文反复强调。
9. 排行榜相关假设必须说明 ranking_type / ranking_theme。
```

---

### 23.10 Reflection Validation 反思验证

模型分工：

```text
反思候选生成：DeepSeek
反思验证：豆包
```

豆包验证用于判断该候选是否可能符合豆包生态下 AI 搜索的理解、抓取和引用习惯。

验证内容：

```text
1. 假设是否与 evidence 一致。
2. 是否过度归因。
3. 是否只适用于特定行业 / 内容类型 / 排行榜主题。
4. 是否可能提高 AI 可理解性。
5. 是否可能提高引用友好度。
6. 是否有误导、夸大或伪造风险。
7. 是否应该进入人工审核。
```

输出：

```typescript
type ReflectionValidationResult = {
  valid: boolean;
  validation_status: 'validated' | 'weak' | 'overfit' | 'unsafe' | 'insufficient_evidence';
  confidence_adjustment: number;
  recommended_status: 'candidate' | 'needs_more_evidence' | 'rejected';
  reasons: string[];
  required_more_evidence?: string[];
  safety_warnings: string[];
};
```

---

### 23.11 假设评分机制

#### 23.11.1 sample_size

```text
sample_size = positive_count + negative_count
```

不建议把 inconclusive 计入 sample_size。

#### 23.11.2 effect_score

第一版：

```text
effect_score = positive_rate - baseline_positive_rate
```

如果没有 baseline：

```text
effect_score = positive_count / max(sample_size, 1)
```

但必须标记为低置信。

#### 23.11.3 confidence

第一版简化：

```text
confidence =
0.30 * sample_score
+ 0.25 * evidence_quality
+ 0.25 * validation_score
+ 0.20 * human_review_score
```

#### 23.11.4 激活门槛

```text
sample_size >= 3
positive_count >= 2
confidence >= 0.65
validation_status = validated
human_review_status = approved
```

global scope 需要更高门槛：

```text
evidence_project_count >= 3
evidence_industry_count >= 2
sample_size >= 10
confidence >= 0.75
human_review_status = approved
```

---

### 23.12 Human Review 人工审核

人工审核界面展示：

```text
假设内容
作用范围 scope
目标 Skill / Stage
适用条件
不适用条件
推荐动作
正样本
负样本
不确定样本
被引用片段
失败对比证据
模型验证结果
置信度
风险提示
```

用户操作：

```text
approve
reject
archive
request_more_evidence
edit_hypothesis_text
edit_applicable_conditions
edit_excluded_conditions
edit_recommended_action
```

禁止 Agent 自动执行：

```text
candidate → active
validated → active
active → archived
active → degraded
hypothesis.delete
```

---

### 23.13 Active Hypotheses 注入策略

Active hypotheses 不是全部进入文章生成，而是按 Skill / Stage 检索注入。

检索顺序：

```text
1. 当前项目 project-level hypotheses
2. 当前行业 industry-level hypotheses
3. 当前内容类型 content-type hypotheses
4. 全局 global hypotheses
```

权重：

```text
project:      1.00
industry:     0.80
content_type: 0.65
global:       0.50
```

每个 Skill 注入上限：

```text
project-level: 最多 2 条
industry-level: 最多 2 条
content-type-level: 最多 1 条
global-level: 最多 2 条
总数不超过 5–7 条
```

冲突处理：

```text
confirmed facts
> compliance rules
> platform constraints
> active hypotheses
> style examples
```

如果 active hypothesis 与 confirmed facts 冲突：

```text
丢弃该 hypothesis
写入 risk_warning
记录 retrieval_logs
```

注入格式：

```typescript
type ActiveHypothesisContext = {
  hypothesis_id: number;
  hypothesis_text: string;
  hypothesis_type: string;
  target_skill: string;
  target_stage: string;
  scope: string;
  applicable_conditions: string[];
  excluded_conditions: string[];
  recommended_action: string;
  confidence: number;
  positive_examples_count: number;
  negative_examples_count: number;
  risk_warnings: string[];
};
```

---

### 23.14 与 Skill Package 的关系

文章生成与反思学习必须通过 Skill Package 约束，避免所有逻辑堆到一个大 Prompt 中。

新增或强化 Skills：

```text
support-article-planning
support-article-generation
ranking-theme-selection
ranking-criteria-generation
ranking-reason-generation
ranking-article-planning
ranking-article-generation
title-generation
reflection-feature-extraction
reflection-candidate
reflection-validation
hypothesis-injection
rule-export
```

反思学习按 target_skill 反向影响：

```text
标题被抓取率高
→ title-generation

综合榜被引用
→ ranking-article-generation

推荐理由被引用
→ ranking-reason-generation

评选维度有效
→ ranking-criteria-generation

某类榜单主题有效
→ ranking-theme-selection

支持类文章支撑力强
→ support-article-planning / support-article-generation
```

---

### 23.15 与排行榜文章生成的关系

排行榜文章生成前必须确定：

```text
ranking_type
ranking_theme
selection_criteria
target_company_preferred_position_range
support_evidence
competitor_fairness_constraints
```

综合排行榜默认约束：

```text
ranking_type = comprehensive
target_company_preferred_position_range = [2, 5]
ranking_size = 6–8
must_have_recommendation_reason = true
```

专项排行榜默认约束：

```text
ranking_type = dimension
ranking_theme = dynamically selected
target_company_preferred_position_range = [1, 3] when evidence supports
ranking_size = 6–8
must_have_recommendation_reason = true
```

排行榜文章输出必须包含：

```typescript
type RankingArticleGenerationOutput = {
  title: string;
  ranking_type: 'comprehensive' | 'dimension';
  ranking_theme: string;
  selection_criteria: RankingCriterion[];
  article_markdown: string;
  ranking_items: {
    rank: number;
    company_name: string;
    recommendation_reason: string;
    suitable_for: string[];
    core_strengths: string[];
    evidence_refs: string[];
    risk_notes?: string[];
  }[];
  target_company_rank: number;
  target_company_reasoning: string;
  applied_hypotheses: number[];
  unsupported_claims: string[];
  geo_notes: string[];
};
```

---

### 23.16 rule.md 导出

`rule.md` 只从 active hypotheses 导出。

流程：

```text
reflection_hypotheses(status = active)
↓
ruleExportService
↓
生成 rule.md
↓
用户查看 / 导出 / 调试 Prompt
```

导出内容按 target_skill 分组：

```markdown
# GEO Active Reflection Rules

#### title-generation

#### ranking-theme-selection

#### ranking-criteria-generation

#### ranking-reason-generation

#### support-article-generation

#### ranking-article-generation

#### geo-review
```

禁止导出：

```text
candidate hypotheses
rejected hypotheses
degraded hypotheses
未通过人工审核的 hypotheses
```

---

### 23.17 Tool 与权限

新增工具：

```text
reflection.extract_features
reflection.index_case
reflection.search_cases
reflection.generate_candidate
reflection.validate_candidate
reflection.request_review
reflection.approve
reflection.reject
reflection.archive
reflection.activate
reflection.degrade
reflection.export_rules
reflection.search_hypotheses
```

高风险工具：

```text
reflection.activate
reflection.archive_batch
reflection.delete
reflection.export_rules_overwrite
hypothesis.activate
hypothesis.archive_batch
```

ToolGuard 规则：

```text
1. Agent 不得自动激活 hypothesis。
2. Agent 不得删除 evidence。
3. Agent 不得修改 visibility_checks 原始结果。
4. Agent 不得把 candidate hypothesis 注入正式文章生成。
5. Agent 不得将 reflection_case 当作 company_material。
6. Agent 不得把失败样本从统计中移除。
7. Agent 不得把一个项目的私有成功案例默认应用到另一个项目。
```

---

### 23.18 IPC

```text
reflection:list
reflection:get
reflection:evidence
reflection:extractFeatures
reflection:indexCase
reflection:searchCases
reflection:generateCandidate
reflection:validate
reflection:requestReview
reflection:approve
reflection:reject
reflection:archive
reflection:activate
reflection:degrade
reflection:searchHypotheses
reflection:exportRules

visibility:list
visibility:get
visibility:rerun
visibility:classifySample

reflectionCase:list
reflectionCase:get
reflectionCase:search
reflectionCase:reindex
```

---

### 23.19 前端 Auto Learning 页面

Auto Learning 页面包含：

```text
1. 学习总览 Dashboard
2. 可见性检测记录
3. 正负样本库
4. 支持类文章表现分析
5. 排行榜文章表现分析
6. 反思候选列表
7. Active Hypotheses
8. rule.md 导出视图
9. 假设详情页
10. 样本对比页
```

学习总览展示：

```text
总检测次数
cited 数量
mentioned 数量
not_found 数量
inconclusive 数量
positive samples 数量
negative samples 数量
candidate hypotheses 数量
active hypotheses 数量
degraded hypotheses 数量
```

假设详情页展示：

```text
假设文本
目标 Skill / Stage
作用范围 scope
适用条件
不适用条件
推荐动作
置信度
effect_score
正样本
负样本
不确定样本
模型验证结果
人工审核记录
状态流转记录
```

样本对比页展示：

```text
成功文章 vs 失败文章
支持类文章支撑力对比
综合排行榜 vs 专项排行榜表现对比
标题模式对比
推荐理由对比
评选维度对比
被引用片段对比
```

---

### 23.20 状态流转

hypothesis 状态：

```text
candidate
↓
validated
↓
active
↓
degraded
↓
archived
```

也可以：

```text
candidate → rejected
validated → rejected
active → archived
active → degraded
degraded → archived
```

说明：

```text
candidate:
  DeepSeek 生成的候选假设，尚未通过验证和人工确认。

validated:
  豆包验证通过，但尚未人工激活。

active:
  人工确认后可参与对应 Skill / Stage。

degraded:
  后续样本显示效果下降，不再默认注入。

archived:
  人工归档，不再使用。

rejected:
  被人工或验证流程拒绝。
```

---

### 23.21 过期与降级

自动降级条件：

```text
1. 最近 N 次使用后没有产生 positive sample。
2. negative_count 持续增加。
3. effect_score 低于阈值。
4. 目标引擎行为明显变化。
5. 人工标记不再适用。
```

第一版建议：

```text
最近 5 次使用中 positive_count = 0
或 confidence < 0.45
或 effect_score < 0.2
```

过期策略：

```text
candidate:
  90 天未审核，标记 archived。

active:
  不自动删除，但需要定期重新评估。

degraded:
  90 天内无恢复，建议 archived。

rejected:
  保留记录，不参与检索和注入。
```

---

### 23.22 删除策略

默认软删除：

```text
status = archived / rejected
deleted_at
deleted_by
delete_reason
```

允许物理删除的情况：

```text
1. 用户明确要求彻底删除。
2. 错误上传敏感内容。
3. 法规要求删除。
4. 发布文章需要从本地移除。
```

物理删除必须级联：

```text
reflection_case_chunks
reflection_case_vectors
reflection_case_fts
published_content_features
reflection_hypothesis_evidence
content_support_links
rule.md export cache
```

---

### 23.23 安全边界

```text
1. 不学习虚假信息。
2. 不把营销夸张表达变成事实。
3. 不学习绕过平台规则的方法。
4. 不建议伪造第三方引用。
5. 不建议隐藏 AI 生成痕迹来欺骗检测。
6. 不跨项目泄露成功样本。
7. 不把一个客户的私有策略自动应用到另一个客户。
8. 不自动覆盖用户确认的企业事实。
9. 不反复强调目标企业弱点。
10. 不恶意贬低竞品。
```

跨项目使用经验时必须脱敏，并且第一版默认只使用：

```text
industry-level hypotheses
content-type-level hypotheses
global hypotheses
```

不直接跨项目调用其他项目的原始文章正文。

---

### 23.24 ResultValidator

#### 23.24.1 ReflectionFeatureValidator

校验：

```text
article_strategy_type 合法
sample_class 合法
评分字段在 0–1 范围内
ranking_article 必须有 ranking_type / ranking_theme
ranking_article 必须有推荐理由特征
support_article 必须有 support_score_json
```

#### 23.24.2 ReflectionCandidateValidator

校验：

```text
hypothesis_text 不为空
hypothesis_type 合法
target_skill 合法
target_stage 合法
scope 合法
applicable_conditions 不为空
recommended_action 明确
confidence 在 0–1 之间
supporting_evidence 至少包含一个样本
不得包含 confirmed facts 之外的新事实
不得建议伪造引用、数据、第三方背书
```

#### 23.24.3 HypothesisActivationValidator

校验：

```text
human_review_status = approved
validation_status = validated
confidence >= 激活门槛
sample_size >= 最小样本数
不与 active hypotheses 明显冲突
不与 confirmed facts 冲突
```

---

### 23.25 观测与审计

所有关键事件写入 `execution_ledger` 或 `memory_events`：

```text
visibility_check_completed
sample_classified
reflection_case_indexed
reflection_features_extracted
reflection_candidate_generated
reflection_candidate_validated
hypothesis_approved
hypothesis_rejected
hypothesis_activated
hypothesis_degraded
rule_md_exported
```

用于追踪：

```text
这条规则从哪里来？
谁批准的？
用了几次？
影响了哪个 Skill？
影响了哪篇文章？
效果如何？
什么时候降级？
```

---

### 23.26 测试与验收

#### 23.26.1 单元测试

```text
VisibilityEvidenceBuilder 测试
SampleClassifier 测试
ReflectionCaseCorpusService 测试
PublishedContentFeatureExtractor 测试
ContentSupportLinkService 测试
ReflectionCandidateValidator 测试
ReflectionValidationValidator 测试
HypothesisInjectionPolicy 测试
RuleExportService 测试
```

#### 23.26.2 必测用例

```text
被引用文章不会自动生成 active hypothesis。
单个正样本只能生成 candidate，不能 active。
负样本会参与假设评分。
inconclusive 样本不会被当成正样本。
reflection_case 不会进入 enterprise_facts confirmed。
candidate hypothesis 不会参与正式文章生成。
active hypothesis 与 confirmed facts 冲突时会被丢弃。
用户拒绝 hypothesis 后不会再次自动注入。
rule.md 导出内容来自 active hypotheses。
删除发布文章时 vectors 和 FTS 记录会同步清理。
排行榜文章必须有推荐理由。
综合排行榜目标企业优先在第 2–5 位，但不得违背事实。
专项排行榜必须围绕单一 ranking_theme。
```

#### 23.26.3 验收标准

```text
发布后可以执行可见性检测。
检测结果可以分类为 positive / negative / inconclusive。
成功案例可以进入 Reflection Case Corpus。
失败案例默认进入结构化特征库，并可用于反证。
支持类文章和排行榜文章可以分别评分。
系统可以建立支持类文章与排行榜文章的证据链。
系统可以生成 reflection candidate。
候选假设必须经过豆包验证。
候选假设必须经过人工审核才能 active。
active hypotheses 可以按 target_skill / target_stage 注入。
文章生成记录 applied_hypotheses。
后续检测可以反向评估 hypothesis 效果。
rule.md 可以从 active hypotheses 导出。
企业知识库不会被反思案例污染。
```

---

### 23.27 最终闭环

```text
支持类文章
↓
企业事实、产品服务、评测、本地信息、案例证据
↓
排行榜文章
↓
综合排行榜为主，专项维度排行榜为补充
↓
标题与用户问题池对齐
↓
发布
↓
豆包助手可见性检测
↓
positive / negative / inconclusive samples
↓
Reflection Case Corpus
↓
文章特征提取
↓
正负样本对比
↓
Reflection Candidate
↓
Reflection Validation
↓
Human Review
↓
Active Hypotheses
↓
按 Skill / Stage 注入下一轮 GEO 流程
```

最终结论：

```text
向量库保存成功案例和可复用片段；
失败案例主要用于对比和反证；
数据库保存检测证据、文章特征和优化假设；
rule.md 只作为 active hypotheses 的导出视图；
反思学习结果按 project / industry / content_type / global 分层生效；
反思学习结果按 target_skill / target_stage 精准影响后续 GEO 流程。
```

---

## 24. 数据库总览

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
conversation_summaries
assistant_runs
assistant_stream_events
assistant_reasoning_steps
assistant_tool_calls
tool_approvals
assistant_queue_items
agent_tasks
agent_task_steps
agent_artifacts
article_artifacts_meta
article_claims
article_claim_sources
article_reviews
ranking_article_items
ranking_criteria
agent_locks
execution_ledger
memory_events
publish_records
visibility_checks
reflection_hypotheses
reflection_hypothesis_evidence
reflection_case_chunks
reflection_case_vectors
reflection_case_fts
published_content_features
content_support_links
model_call_logs
retrieval_logs
app_errors
app_settings
```

---

## 25. IPC 总览

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

memory:contextPreview
memory:summaries
memory:summaryRegenerate
memory:events
memory:deleteSoft
memory:deletePermanent
memory:cleanupStale
memory:rebuildIndex

draft:list
draft:get
draft:update
draft:review

article:strategySelect
article:titleGenerate
article:titleScore
article:supportPlan
article:supportGenerate
article:rankingThemeSelect
article:rankingCriteriaGenerate
article:rankingReasonGenerate
article:rankingGenerate
article:claimMap
article:review
article:revise
article:approve
article:reject
article:list
article:get
article:versions
article:export

publish:plan
publish:approve
publish:status

visibility:check
visibility:list
visibility:get
visibility:rerun
visibility:classifySample

reflection:list
reflection:get
reflection:evidence
reflection:extractFeatures
reflection:indexCase
reflection:searchCases
reflection:generateCandidate
reflection:validate
reflection:requestReview
reflection:approve
reflection:reject
reflection:archive
reflection:activate
reflection:degrade
reflection:searchHypotheses
reflection:exportRules

reflectionCase:list
reflectionCase:get
reflectionCase:search
reflectionCase:reindex
```

---


## 26. Agent-first Runtime 测试与验收

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
MemoryContextBuilder 单元测试
MemoryRetrievalPolicy 单元测试
ConversationSummaryService 单元测试
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
普通聊天不得写入企业知识库。
AI 抽取事实默认 candidate，不得直接 confirmed。
checkpoint 与 SQLite 不一致时必须以 SQLite 为准重新规划。
用户彻底删除资料时必须级联删除 chunks、vectors、FTS 和相关 facts。
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


## 27. Timeout / Retry / 幂等

| 调用                    |               timeout |         retry |
| ----------------------- | --------------------: | ------------: |
| Doubao Responses        |                   60s |             1 |
| Doubao Responses stream | 首 token 30s，总 180s |             1 |
| DeepSeek Chat           |                   90s |             1 |
| DeepSeek Thinking       |                  180s |             1 |
| Embedding               |                   30s |             2 |
| Visibility Check        |                   90s |             1 |
| SQLite / Vector         |                   10s |             0 |
| Publish API             |                   60s | 2，但必须幂等 |

详细错误分类、错误码对照和日志写入目标见 [GEO_Agent_模型接入规范.md](GEO_Agent_模型接入规范.md)。

---

## 28. 最终架构闭环

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
反思案例沉淀
↓
DeepSeek 反思候选
↓
豆包反思验证
↓
人工确认优化假设
↓
Active Hypotheses 按 Skill / Stage 注入下一轮 GEO 流程
```