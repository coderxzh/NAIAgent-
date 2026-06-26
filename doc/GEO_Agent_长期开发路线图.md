# GEO Agent 长期开发路线图 v2.0


## 2. 长期目标

构建完整的 GEO Agent 桌面应用：

```text
企业资料 → 企业事实 → 知识库 → 检索 → 内容 → 发布 → 可见性检测 → 优化假设
```

产品目标：

```text
帮助企业生成更容易被豆包助手联网搜索发现、理解、采信和引用的内容。
```

---

## 3. 全局技术决策

| 领域 | 决策 |
|---|---|
| 桌面端 | Electron |
| 前端 | React + TypeScript + Vite |
| UI | Tailwind + shadcn/ui + AI Elements |
| 图表 | ApexCharts |
| 数据库 | SQLite |
| 向量检索 | sqlite-vec |
| 关键词检索 | FTS5 |
| 知识库模型 | `project = 公司 = 知识库` |
| 豆包文本 API | Responses API |
| 豆包助手 | Responses API + `doubao_app` |
| 豆包助手 feature | `ai_search` / `reasoning_search` |
| 豆包 Embedding | Ark Embedding 接入点 |
| DeepSeek API | Chat Completions |
| DeepSeek 流式 | 支持 |
| DeepSeek Responses API | 不使用 |
| Agent 架构 | Agent-first Task Runtime（DeepAgents.js + LangGraph） |
| Skill | Skill Package |
| 状态源 | SQLite + Assistant Runtime |
| 对话历史 | 公共历史 |
| 工具审批 | 高风险审批 |
| 可见性结果 | 优化假设证据 |

---

## 4. Phase 总览

| Phase | 名称 | 时间 | 目标 |
|---|---|---:|---|
| Phase 0 | Electron + SQLite 骨架 | 已完成 | 桌面基础 |
| Phase 1 | 仪表盘 UI 与设计系统 | 1.5-2 周 | GEO UI 先行 |
| Phase 2 | 架构、状态、模型路由与 Assistant 基础 | 2 周 | currentProject、Model Router、基础表 |
| Phase 3 | 公司与公共对话历史 | 2 周 | project CRUD、chat history、Message Parts |
| Phase 4 | 文件清洗、语义切片与豆包 Embedding 索引 | 2 周 | cleaner、chunker、embedding、vec |
| Phase 5 | Hybrid Retrieval 与 Evidence Pack | 1.5 周 | Fact + FTS + Vector |
| Phase 6 | 企业事实抽取与确认 | 1.5 周 | DeepSeek JSON 事实抽取 |
| Phase 7 | Assistant Runtime、流式事件、工具审批与执行审计 | 2.5 周 | assistant_runs、tool_approvals、执行审计、错误记录 |
| Phase 8 | Agent-first Task Runtime + Skill Package | 3 周 | DeepAgents.js、AllowedActionPolicy、ToolGuard、Skill、内容链路 |
| Phase 9 | 发布与豆包助手可见性检测 | 1.5 周 | doubao_app ai_search、发布幂等 |
| Phase 10 | 优化假设、错误恢复、预算与打包收尾 | 2 周 | reflection、LoopGuard、RecoveryManager、预算控制、打包 |
| Phase 11 | 测试与验收 | 1 周 | 策略单元测试、Agent Runtime 测试、端到端链路测试 |

总工期：

```text
19–20.5 周
```

---

## 5. Phase 1：仪表盘 UI 与设计系统

目标：

```text
先让产品看起来像 GEO Agent，而不是金融 Demo。
```

任务：

```text
1. 建立 ThemeContext。
2. 拆 LayoutShell。
3. 拆 AppSidebar。
4. 拆 AppHeader。
5. 替换 WeeklyDashboard。
6. 新建 DashboardView。
7. 新建 GEO 指标卡。
8. 接入 AI Elements 基础组件。
9. 拆 ChatInterface。
10. 瘦身 App.tsx。
```

仪表盘组件：

```text
GeoOverviewCards
VisibilityTrendChart
KnowledgeHealthCard
RecentGeoRuns
PendingApprovalsCard
ActivityTimeline
ModelUsageCard
```

验收：

```text
GEO 业务指标清晰
无金融 mock
布局稳定
App.tsx 明显瘦身
```

---

## 6. Phase 2：架构、状态、模型路由与 Assistant 基础

目标：

```text
搭建后续所有 AI 能力的底座。
```

任务：

```text
1. currentProject 状态
2. React Context / hooks
3. service 层骨架
   ├── assistantRuntime.ts
   ├── streamManager.ts
   ├── assistantRunService.ts
   ├── assistantMessageService.ts
   ├── assistantEventStore.ts
   ├── reasoningStepService.ts
   ├── toolCallService.ts
   ├── toolApprovalService.ts
   └── assistantQueueService.ts
4. IPC 类型与通道设计
   ├── project:*
   ├── kb:*
   ├── assistant:*
   ├── toolApproval:*
   ├── agentTask:*
   ├── draft:*
   ├── publish:*
   ├── visibility:*
   └── reflection:*
5. Zod schema
6. Model Router
7. DoubaoResponsesClient 骨架
8. DeepSeekClient 骨架
9. EmbeddingProvider 骨架
10. 核心数据库表（按最终 schema 一次性创建）
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

ProviderApiMode：

```typescript
type ProviderApiMode =
  | 'responses'
  | 'chat_completions'
  | 'embeddings';
```

目录：

```text
electron/services/models/
├── modelRouter.ts
├── modelConfig.ts
├── modelCallLogger.ts
├── doubao/
└── deepseek/
```

验收：

```text
模型路由能区分豆包 responses、DeepSeek chat_completions、豆包 embeddings。
```

---

## 7. Phase 3：公司与公共对话历史

任务：

```text
1. projects CRUD
2. 公司信息维护
3. chat_sessions
4. chat_messages
5. ChatHistoryDrawer
6. New Chat
7. Message Parts 初版
   ├── text
   ├── markdown
   ├── attachment
   ├── tool_call
   ├── approval_request
   ├── artifact
   ├── sources
   ├── reasoning_steps
   ├── queue
   └── error
8. render_json 恢复
```

原则：

```text
对话历史公共，不绑定企业知识库。
每条消息可记录当时 project_id。
```

验收：

```text
可以新建、打开、恢复历史对话。
render_json 能恢复基础组件。
```

---

## 8. Phase 4：文件清洗、语义切片与豆包 Embedding

任务：

```text
1. 资料录入入口（文本 / 文件）
2. fileParser
3. textCleaner
4. structureDetector
5. semanticChunker
   ├── 普通段落：500–800 中文字
   ├── FAQ：一问一答一个 chunk
   ├── 表格：整表一个 chunk
   ├── 案例：背景 + 需求 + 方案 + 结果不拆断
   ├── 联系方式：独立 fact chunk
   ├── 资质 / 荣誉：独立 fact chunk
   └── 产品 / 服务：按服务项切分
6. chunkQualityScorer
7. DoubaoEmbeddingProvider
8. Query / Corpus instructions
9. VectorStore Adapter
10. sqlite-vec 写入
11. FTS5 写入
12. vector_store_meta
```

Embedding 必须记录：

```text
embedding_provider
embedding_model
embedding_dim
index_status
last_reindex_at
```

维度变化处理：

```text
如果 embedding_model 或 embedding_dim 变化：
  禁止写入旧向量表
  标记 needs_reindex
  提示用户重新索引
```

验收：

```text
上传资料后可清洗、切片、向量化、关键词检索、向量检索。
```

---

## 9. Phase 5：Hybrid Retrieval 与 Evidence Pack

任务：

```text
1. Fact Search
2. FTS5 Search
3. Vector Search
4. Rerank
5. Evidence Pack
6. retrieval_logs
```

Evidence Pack 排序优先级：

```text
confirmed facts
> exact keyword match
> high-quality vector chunks
> low-confidence chunks
```

输出：

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

验收：

```text
所有内容生成前都能拿到 Evidence Pack。
```

---

## 10. Phase 6：企业事实抽取与确认

任务：

```text
1. DeepSeek fact extraction
2. JSON Output
3. thinking mode
4. 事实类型
   ├── full_name          企业名全称
   ├── short_name         简称/品牌名
   ├── detailed_address   详细经营地址
   ├── service_area       服务区域
   ├── industry           行业分类
   ├── products_services  产品与服务
   ├── related_brands     关联品牌
   ├── target_customers   目标客户
   ├── core_advantages    核心优势
   ├── trust_backing      信任背书
   ├── pain_points        用户痛点
   ├── customer_cases     客户案例
   ├── contact            联系方式
   └── derived_keywords   派生关键词
5. 事实状态
   ├── candidate
   ├── confirmed
   ├── rejected
   └── deprecated
6. source_quote
7. confidence
8. extraction_model / extraction_prompt_version
9. 人工确认 UI
10. enterprise_facts
```

验收：

```text
事实可抽取、可追溯、可确认、可拒绝、可修改。
```

---

## 11. Phase 7：Assistant Runtime、流式事件、工具审批与队列

任务：

```text
1. assistant_runs
2. assistant_stream_events
3. assistant_reasoning_steps
4. assistant_tool_calls
5. tool_approvals
6. assistant_queue_items
7. doubaoResponsesStreamParser
8. deepseekStreamParser
9. AssistantStreamEvent 统一事件类型
10. ToolPolicy / ToolGuard
11. Approval UI
12. execution_ledger 执行审计
13. 中断恢复（pending approval / stream interrupted）
```

双流式支持：

```text
豆包 Responses stream
DeepSeek Chat Completions stream
```

都统一为：

```text
AssistantStreamEvent
```

验收：

```text
智能 Agent 页可显示流式文本、执行步骤、工具调用、审批、队列和错误。
每次工具调用和高风险动作写入 execution_ledger。
```

---

## 12. Phase 8：Agent-first Task Runtime + Skill Package

目标：

```text
搭建 Agent-first 任务运行时可以自主规划、调用 Skill、执行工具、人工审批、中断恢复。
不再使用固定 Workflow Engine 作为主编排器。
```

任务：

```text
1. 安装 DeepAgents.js、@langchain/core、@langchain/langgraph
2. electron/services/agent/ 目录骨架
   ├── geoAgentRuntime.ts
   ├── geoAgentFactory.ts
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
3. agent_tasks 表
4. agent_task_steps 表
5. agent_artifacts 表
6. agent_locks 表
7. AllowedActionPolicy（根据项目状态动态限制 Agent 动作）
8. Dynamic Tool Registry（只暴露当前 allowed_actions 对应的工具）
9. ToolGuard（校验工具调用权限和审批要求）
10. ResultValidator（校验 Skill / 工具产出）
11. RetryManager + LoopGuard（失败重试与死循环防护）
12. RecoveryManager（中断后恢复）
13. Budget Control（模型调用、工具调用、运行时间、成本预算）
14. source-discovery Skill
15. article-generation Skill
16. geo-review Skill
17. visibility-check Skill
18. reflection-validation Skill
19. fact-extraction Skill
20. claim-review Skill
21. reflection-candidate Skill
22. context-compression Skill
```

Skill 包结构：

```text
SKILL.md
prompt-contract.md
output.schema.json
tools.md
examples.json
index.ts
```

推荐任务路径（Agent 可动态调整）：

```text
资料录入 → 事实抽取 → 事实确认 → 问题生成 → 信源推荐 → 文章生成 → 文章审核 → 发布计划 → 用户确认 → 发布 → 可见性检测 → 优化假设
```

验收：

```text
用户可以用自然语言发起 GEO 优化任务。
Agent 能根据项目状态自主选择下一步。
高风险工具触发审批卡片。
中断后可以从审批点或最近成功步骤继续。
可以跑通从问题生成到文章草稿的 GEO 内容链路。
```

---

## 13. Phase 9：发布与豆包助手可见性检测

任务：

```text
1. publish_plan。
2. tool_approvals。
3. publish_records。
4. publish idempotency。
5. VisibilityChecker。
6. doubao_app ai_search。
7. reasoning_search 深度检测。
8. visibility_checks。
9. reflection_hypothesis_evidence。
```

实现：

```text
Responses API + doubao_app tool + ai_search
```

禁止：

```text
Bot API
App ID / Bot ID
doubao_app + function tools 混用
```

验收：

```text
发布后能检测目标 URL 是否被豆包助手联网搜索提及或引用。
```

---

## 14. Phase 10：优化假设、错误恢复、预算控制与打包收尾

任务：

```text
1. reflection_hypotheses
2. reflection_hypothesis_evidence
3. DeepSeek reflection_candidate
4. Doubao reflection_validation
5. Rule Decay
6. app_errors
7. RetryManager 完整策略（Transient / Permanent / Validation / Permission / ApprovalRejected / ExternalUnknownState）
8. TimeoutPolicy
9. CircuitBreaker
10. LoopGuard（task.max_loop_count、step.max_attempts、same_action_repeat_limit、cost_budget_limit、time_budget_limit）
11. RecoveryManager（waiting_approval、stream interrupted、validation failed、external unknown 恢复）
12. AgentLockManager（project、draft、publish、kb_reindex、fact_batch_update 并发锁）
13. 工具幂等设计（publish.article、kb.reindex_all、fact.batch_update 等）
14. Budget Control（模型调用、工具调用、运行时间、成本预算、前端提醒与暂停）
15. 打包验证
```

错误处理包括：

```text
模型调用失败
流式中断
Embedding 维度不一致
doubao_app feature 多选
doubao_app 与 function 混用
role_description 与 instructions 同传
DeepSeek JSON 解析失败
工具审批拒绝
发布状态未知
Agent 选择非法动作
循环/超预算
外部状态未知
```

验收：

```text
产品可稳定打包。
错误可追踪、可恢复、可重试。
高风险动作具备幂等保护。
Agent 循环、超预算时能自动暂停并提示用户。
```

---

## 15. Phase 11：测试与验收

目标：

```text
在打包前完成核心策略、Agent Runtime 和端到端链路的测试覆盖。
```

任务：

```text
1. AllowedActionPolicy 单元测试
2. DynamicToolRegistry 单元测试
3. ToolGuard 单元测试
4. ResultValidator 单元测试
5. RetryManager 单元测试
6. LoopGuard 单元测试
7. AgentLockManager 单元测试
8. RecoveryManager 单元测试
9. Doubao / DeepSeek client 集成测试
10. 可见性检查端到端测试
11. 发布幂等性测试
12. 错误恢复场景测试
```

必测用例：

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

验收：

```text
所有单元测试通过。
核心 GEO 链路可跑通。
高风险动作有人工审批覆盖。
中断恢复场景可验证。
```

---

## 16. 立即下一步

```text
1. 以 v2.0 开发文档和路线图为准。
2. 继续 Phase 1 仪表盘 UI。
3. 同步准备 Phase 2 的 Model Router、IPC 和完整 DB schema。
4. 建立 doubao / deepseek 两套 client 目录。
5. 建立 Assistant Runtime 基础表。
6. 建立 Skill Package 目录骨架。
```

---

## 17. 最终路线图主线

```text
UI 先行
↓
状态与模型路由
↓
知识库
↓
Embedding / Retrieval
↓
DeepSeek 事实抽取
↓
Assistant Runtime
↓
Agent-first Task Runtime
↓
豆包内容生成
↓
豆包助手可见性检查
↓
优化假设
↓
稳定性和打包
```
