# GEO Agent 长期开发路线图

## 1. 路线图定位

本路线图用于指导 GEO Agent 从桌面应用基础、企业知识库、文章生成、Agent Runtime、发布检测，到反思学习闭环的长期开发。

**本文档为项目 Phase 编号的唯一基准。开发文档及其他设计文档中的 Phase 编号必须与本文档保持一致。**

```text
Memory System 记忆系统
Article Generation / GEO 内容生成系统
Auto Learning / Reflection Memory 反思学习系统
Agent-first Task Runtime
Skill Package
发布与豆包助手可见性检测
```

路线图原则：

```text
先跑通最小 GEO 闭环；
再接入 Agent 化执行；
最后做发布检测与反思学习；
避免第一版同时实现所有高级能力。
```

---

## 2. 长期目标

构建完整的 GEO Agent 桌面应用：

```text
企业资料
↓
企业事实
↓
知识库
↓
检索 / Evidence Pack
↓
支持类文章 / 排行榜文章
↓
审核
↓
发布
↓
可见性检测
↓
正负样本沉淀
↓
反思学习
↓
Active Hypotheses
↓
下一轮 GEO 流程优化
```

产品目标：

```text
帮助企业生成更容易被 AI 搜索、AI 助手、联网问答和生成式检索系统发现、理解、采信和引用的内容。
```

核心闭环：

```text
Data → Knowledge → Retrieval → Content → Distribution → Visibility → Hypothesis → Optimization
```

---

## 3. 全局技术决策

| 领域                   | 决策                                                         |
| ---------------------- | ------------------------------------------------------------ |
| 桌面端                 | Electron                                                     |
| 前端                   | React + TypeScript + Vite                                    |
| UI                     | Tailwind + shadcn/ui + AI Elements                           |
| 图表                   | ApexCharts                                                   |
| 数据库                 | SQLite                                                       |
| 向量检索               | sqlite-vec                                                   |
| 关键词检索             | FTS5                                                         |
| 知识库模型             | `project = 公司 = 知识库`                                    |
| 豆包文本 API           | Responses API                                                |
| 豆包助手               | Responses API + `doubao_app`                                 |
| 豆包助手 feature       | `ai_search` / `reasoning_search`                             |
| 豆包 Embedding         | Ark Embedding 接入点                                         |
| DeepSeek API           | Chat Completions                                             |
| DeepSeek 流式          | 支持                                                         |
| DeepSeek Responses API | 不使用                                                       |
| Agent 架构             | Agent-first Task Runtime（DeepAgents.js + LangGraph）        |
| Agent 适配             | 建议封装 `AgentRuntimeAdapter`，避免业务强绑定 DeepAgents.js |
| Skill                  | Skill Package                                                |
| 状态源                 | SQLite + Assistant Runtime                                   |
| 对话历史               | 公共历史                                                     |
| 记忆系统               | Conversation Memory + Project Knowledge Memory + Task Execution Memory |
| 内容系统               | 支持类文章 + 排行榜类文章                                    |
| 排行榜策略             | 综合排行榜为主，专项维度排行榜为补充                         |
| 工具审批               | 高风险审批                                                   |
| 可见性结果             | 优化假设证据                                                 |
| 反思学习               | project / industry / content_type / global 分层生效          |
| rule.md                | 只作为 active hypotheses 的导出视图，不作为权威存储          |

---

## 4. 里程碑总览

```text
M0：桌面基础完成
M1：GEO UI 与基础状态完成
M2：知识库 + 检索闭环完成
M3：企业事实确认闭环完成
M4：文章生成 MVP 完成
M5：Assistant Runtime 与基础 Agent 完成
M6：发布与可见性检测完成
M7：反思学习闭环完成
M8：稳定性、测试、打包完成
```

建议把第一版可用产品定义为：

```text
用户上传企业资料
↓
系统清洗、切片、索引
↓
抽取企业事实
↓
用户确认事实
↓
生成支持类文章或综合排行榜文章
↓
完成 Claim-source 校验
↓
人工审核草稿
```

发布、可见性检测、反思学习作为后续增强闭环，不建议压进最小可用版本。

---

## 5. Phase 总览

| Phase    | 名称                                            |     时间 | 目标                                                         |
| -------- | ----------------------------------------------- | -------: | ------------------------------------------------------------ |
| Phase 0  | Electron + SQLite 骨架                          |   已完成 | 桌面基础                                                     |
| Phase 1  | 仪表盘 UI 与设计系统                            | 1.5–2 周 | GEO UI 先行                                                  |
| Phase 2  | 架构、模型路由、IPC 与数据库 Schema             | 2–2.5 周 | 最终表结构、Model Router、Service 骨架                       |
| Phase 3  | 公司管理、公共对话历史与基础记忆                |     2 周 | project CRUD、chat history、conversation memory              |
| Phase 4  | 文件清洗、语义切片与 Embedding 索引             | 2–2.5 周 | cleaner、chunker、embedding、vec、FTS5                       |
| Phase 5  | Hybrid Retrieval 与 Evidence Pack               | 1.5–2 周 | Fact + FTS + Vector + Evidence Pack                          |
| Phase 6  | 企业事实抽取与人工确认                          | 1.5–2 周 | DeepSeek JSON 事实抽取、confirmed facts                      |
| Phase 7  | 文章生成 MVP：支持类文章与综合排行榜            |   3–4 周 | title、support、ranking、claim map、draft review             |
| Phase 8  | Assistant Runtime、流式事件、工具审批与草稿体验 | 2.5–3 周 | assistant stream、tool approval、draft UI、execution ledger  |
| Phase 9  | Agent-first Task Runtime + Skill 编排           |   3–4 周 | DeepAgents.js、AllowedActionPolicy、ToolGuard、MemoryContextBuilder |
| Phase 10 | 发布计划、发布记录与豆包助手可见性检测          |     2 周 | publish_records、visibility_checks、doubao_app               |
| Phase 11 | 反思学习系统                                    |   3–4 周 | Reflection Case Corpus、positive/negative samples、hypotheses |
| Phase 12 | 稳定性、测试、恢复、预算与打包                  |   2–3 周 | Recovery、LoopGuard、预算、端到端测试、打包                  |

总工期建议：

```text
25–31 周
```

如果压缩范围，只做 MVP：

```text
Phase 1–7：约 14–18 周
```

如果只做知识库 + 文章生成最小闭环：

```text
Phase 2–7：约 12–15 周
```

**MVP 范围冻结**：Phase 1–7 为当前 MVP。完成 Phase 7 后，产品具备「企业资料 → 清洗切片 → 事实抽取 → 人工确认 → 支持类/排行榜文章生成 → Claim-source 校验 → 人工审核」的最小闭环。Phase 8–12（完整 Assistant Runtime、Agent-first Runtime、真实发布/可见性、反思学习、稳定性测试）在本次基线 Sprint 后冻结，后续按顺序逐步实施，不在 MVP 内一次性交付。

---

## 6. Phase 1：仪表盘 UI 与设计系统

目标：

```text
先让产品看起来像 GEO Agent，而不是通用 Demo。
```

任务：

```text
1. 建立 ThemeContext。
2. 拆 LayoutShell。
3. 拆 AppSidebar。
4. 拆 AppHeader。
5. 新建 DashboardView。
6. 新建 GEO 指标卡。
7. 接入 AI Elements 基础组件。
8. 拆 ChatInterface。
9. 瘦身 App.tsx。
10. 建立页面导航结构：
    ├── Dashboard
    ├── Project Management
    ├── Intelligent Agent
    ├── Draft Management
    ├── Auto Learning
    ├── Enterprise Area
    └── Settings
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
DraftStatusCard
ReflectionLearningCard
```

验收：

```text
GEO 业务指标清晰。
无金融 mock。
布局稳定。
App.tsx 明显瘦身。
侧边栏与主页面风格统一。
```

---

## 7. Phase 2：架构、模型路由、IPC 与数据库 Schema

目标：

```text
搭建后续所有 AI、知识库、记忆、文章、反思学习能力的底座。
```

任务：

```text
1. currentProject 状态。
2. React Context / hooks。
3. Electron service 层目录规划。
4. IPC 类型与通道设计。
5. Zod schema。
6. Model Router。
7. DoubaoResponsesClient 骨架。
8. DoubaoAssistantVisibilityClient 骨架。
9. DeepSeekClient 骨架。
10. EmbeddingProvider 骨架。
11. Skill Runtime 骨架。
12. Tool Runtime 骨架。
13. 完整数据库 schema 初始化。
```

建议目录：

```text
electron/services/
├── models/
├── db/
├── retrieval/
├── memory/
├── article/
├── reflection/
├── agent/
├── tools/
├── assistant/
└── publishing/
```

核心数据库表必须一次性规划，但可以分阶段启用：

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
agent_locks
execution_ledger
memory_events

article_artifacts_meta
article_claims
article_claim_sources
article_reviews
ranking_article_items
ranking_criteria

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

ProviderApiMode：

```typescript
type ProviderApiMode =
  | 'responses'
  | 'chat_completions'
  | 'embeddings';
```

验收：

```text
模型路由能区分豆包 responses、DeepSeek chat_completions、豆包 embeddings。
核心数据库 migration 可执行。
IPC 类型有统一定义。
各服务目录存在但可以是空实现或最小实现。
```

---

## 8. Phase 3：公司管理、公共对话历史与基础记忆

目标：

```text
完成公司 / 项目管理、公共对话历史、Message Parts 和基础 Conversation Memory。
```

任务：

```text
1. projects CRUD。
2. 公司信息维护。
3. chat_sessions。
4. chat_messages。
5. ChatHistoryDrawer。
6. New Chat。
7. Message Parts 初版：
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
8. render_json 恢复。
9. conversation_summaries 表接入。
10. ConversationMemoryService 初版。
11. contextPreview 最小调试视图。
```

原则：

```text
对话历史公共，不绑定企业知识库。
每条消息可记录当时 project_id。
普通聊天不得直接写入企业知识库。
```

验收：

```text
可以新建、打开、恢复历史对话。
render_json 能恢复基础组件。
超过阈值后可以生成会话摘要。
用户说“刚刚那篇文章”时，系统能追踪最近 artifact 引用。
```

---

## 9. Phase 4：文件清洗、语义切片与 Embedding 索引

目标：

```text
完成企业资料从录入到可检索的本地知识库闭环。
```

任务：

```text
1. 资料录入入口（文本 / 文件）。
2. fileParser。
3. textCleaner。
4. structureDetector。
5. semanticChunker。
6. chunkQualityScorer。
7. DoubaoEmbeddingProvider。
8. Query / Corpus instructions。
9. VectorStore Adapter。
10. sqlite-vec 写入。
11. FTS5 写入。
12. vector_store_meta。
13. knowledge_entries / knowledge_chunks 状态管理。
```

切片策略：

```text
普通段落：500–800 中文字
FAQ：一问一答一个 chunk
表格：整表一个 chunk
案例：背景 + 需求 + 方案 + 结果不拆断
联系方式：独立 fact chunk
资质 / 荣誉：独立 fact chunk
产品 / 服务：按服务项切分
```

Embedding 必须记录：

```text
embedding_provider
embedding_model
embedding_dim
index_status
last_reindex_at
```

验收：

```text
上传资料后可清洗、切片、向量化、关键词检索、向量检索。
Embedding 模型或维度变化时能标记 needs_reindex。
```

---

## 10. Phase 5：Hybrid Retrieval 与 Evidence Pack

目标：

```text
为事实抽取、问答、文章生成和审核提供可靠证据包。
```

任务：

```text
1. Fact Search。
2. FTS5 Search。
3. Vector Search。
4. Rerank。
5. Evidence Pack。
6. retrieval_logs。
7. missingFields 初版。
8. riskWarnings 初版。
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
用户可以对知识库提问。
系统返回 facts、chunks、keywordHits、vectorHits。
所有内容生成前都能拿到 Evidence Pack。
Evidence Pack 中每条证据可追溯到 source chunk。
```

---

## 11. Phase 6：企业事实抽取与人工确认

目标：

```text
将企业资料转化为可确认、可追踪、可用于文章生成的结构化事实。
```

任务：

```text
1. DeepSeek fact extraction。
2. JSON Output。
3. thinking mode。
4. fact_type 映射。
5. source_quote。
6. confidence。
7. extraction_model / extraction_prompt_version。
8. candidate facts 入库。
9. 人工确认 UI。
10. confirmed / rejected / deprecated 状态流转。
11. missing fields 提醒。
```

事实类型：

```text
full_name
short_name
detailed_address
service_area
industry
products_services
related_brands
target_customers
core_advantages
trust_backing
pain_points
customer_cases
contact
derived_keywords
```

验收：

```text
事实可抽取、可追溯、可确认、可拒绝、可修改。
文章生成只能默认使用 confirmed facts。
没有 confirmed facts 时不能生成正式文章。
```

---

## 12. Phase 7：文章生成 MVP：支持类文章与综合排行榜

目标：

```text
完成 GEO Agent 第一版最核心的业务价值：基于 confirmed facts 和 Evidence Pack 生成可审核文章。
```

本 Phase 不依赖完整 Agent-first Runtime，可以通过普通 UI 按钮或基础 Assistant 触发。

任务：

```text
1. Article Strategy Selection 初版。
2. question-generation 初版。
3. title-generation Skill。
4. support-article-planning Skill。
5. support-article-generation Skill。
6. ranking-theme-selection Skill。
7. ranking-criteria-generation Skill。
8. ranking-reason-generation Skill。
9. ranking-article-planning Skill。
10. ranking-article-generation Skill。
11. article-claim-mapping Skill。
12. claim-review Skill。
13. geo-review Skill。
14. article_artifacts_meta。
15. article_claims。
16. article_claim_sources。
17. article_reviews。
18. ranking_article_items。
19. ranking_criteria。
20. Draft Management UI。
21. Human Review UI。
```

文章战略：

```text
支持类文章：沉淀企业、产品、服务、评测、本地信息和案例证据。
排行榜文章：综合排行榜为主，专项维度排行榜为补充。
```

综合排行榜规则：

```text
综合排行榜默认优先。
目标企业优先进入第 2–5 位。
每家上榜企业必须有推荐理由。
推荐理由必须基于 confirmed facts / Evidence Pack。
不得虚构优势。
不得恶意贬低竞品。
不得反复强调目标企业弱项。
```

标题生成原则：

```text
像用户会问 AI 的问题。
包含行业 / 产品 / 服务。
必要时包含区域 / 场景。
包含推荐 / 排行榜 / 怎么选 / 哪家好等决策意图。
与正文内容一致。
不过度营销。
不虚构排名或结论。
```

验收：

```text
可以生成支持类文章。
可以生成综合排行榜文章。
综合榜目标企业默认位于第 2–5 位。
每个上榜企业都有推荐理由。
文章包含 claim_source_map。
unsupported_claims 能被识别。
用户可以人工审核、修改、批准或拒绝草稿。
```

MVP 完成标志：

```text
知识库 → confirmed facts → Evidence Pack → 文章生成 → Claim Review → Human Review 跑通。
```

---

## 13. Phase 8：Assistant Runtime、流式事件、工具审批与草稿体验

目标：

```text
让文章生成、审核、工具调用、审批和错误展示具备统一 Assistant Runtime 体验。
```

任务：

```text
1. assistant_runs。
2. assistant_stream_events。
3. assistant_reasoning_steps。
4. assistant_tool_calls。
5. tool_approvals。
6. assistant_queue_items。
7. doubaoResponsesStreamParser。
8. deepseekStreamParser。
9. AssistantStreamEvent 统一事件类型。
10. ToolPolicy / ToolGuard 初版。
11. Approval UI。
12. execution_ledger 执行审计。
13. Draft UI 与 Assistant 消息联动。
14. 中断恢复初版（pending approval / stream interrupted）。
```

双流式支持：

```text
豆包 Responses stream
DeepSeek Chat Completions stream
```

统一事件：

```text
message_start
text_delta
reasoning_step
tool_call_requested
approval_requested
tool_call_result
queue_item_updated
message_completed
message_interrupted
error
```

验收：

```text
智能 Agent 页可显示流式文本、执行步骤、工具调用、审批、队列和错误。
每次工具调用和高风险动作写入 execution_ledger。
用户可以从对话中打开文章草稿和审核结果。
```

---

## 14. Phase 9：Agent-first Task Runtime + Skill 编排

目标：

```text
在已经可运行的知识库、事实、文章生成基础上，引入 Agent-first Task Runtime。
```

任务：

```text
1. 安装 DeepAgents.js、@langchain/core、@langchain/langgraph。
2. AgentRuntimeAdapter 抽象。
3. DeepAgentsRuntimeAdapter 实现。
4. electron/services/agent/ 目录骨架。
5. geoAgentRuntime.ts。
6. geoAgentFactory.ts。
7. agentContextBuilder.ts。
8. memoryContextBuilder.ts 接入。
9. allowedActionPolicy.ts。
10. dynamicToolRegistry.ts。
11. toolGuard.ts。
12. approvalManager.ts。
13. taskStateManager.ts。
14. executionLedger.ts。
15. resultValidator.ts。
16. retryManager.ts。
17. recoveryManager.ts。
18. loopGuard.ts。
19. artifactManager.ts。
20. agentLockManager.ts。
21. agentErrorService.ts。
22. agent_tasks / agent_task_steps / agent_artifacts / agent_locks。
23. Budget Control 初版。
24. MemoryContextBuilder 与 AgentContextBuilder 对齐。
25. Skill Runtime 与 Agent Tool Registry 连接。
```

推荐任务路径：

```text
资料录入 → 事实抽取 → 事实确认 → 问题生成 → 信源推荐 → 文章生成 → 文章审核 → 发布计划 → 用户确认 → 发布 → 可见性检测 → 优化假设
```

验收：

```text
用户可以用自然语言发起 GEO 优化任务。
Agent 能根据项目状态自主选择下一步。
Agent 只能调用 allowed_actions 对应工具。
高风险工具触发审批卡片。
中断后可以从审批点或最近成功步骤继续。
可以跑通从问题生成到文章草稿的 GEO 内容链路。
```

---

## 15. Phase 10：发布计划、发布记录与豆包助手可见性检测

目标：

```text
建立发布后的可见性反馈入口，为反思学习准备数据。
```

任务：

```text
1. publish_plan。
2. tool_approvals 发布审批。
3. publish_records。
4. publish idempotency。
5. VisibilityChecker。
6. doubao_app ai_search。
7. reasoning_search 深度检测。
8. visibility_checks。
9. matched_spans_json。
10. citation_urls_json。
11. sample_class 初步判断。
12. reflection_hypothesis_evidence 初版写入。
```

实现：

```text
Responses API + doubao_app tool + ai_search
Responses API + doubao_app tool + reasoning_search
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
可见性检测结果写入 visibility_checks。
可见性结果可以区分 mentioned、cited、inconclusive。
检测结果能作为反思学习证据。
```

---

## 16. Phase 11：反思学习系统

目标：

```text
基于可见性检测结果、成功案例、失败案例和文章特征，生成可审核、可注入后续 Skill 的优化假设。
```

任务：

```text
1. Reflection Case Corpus。
2. reflection_case_chunks。
3. reflection_case_vectors。
4. reflection_case_fts。
5. published_content_features。
6. content_support_links。
7. positive / negative / inconclusive 样本分类。
8. 支持类文章评分。
9. 排行榜文章评分。
10. 标题特征提取。
11. 文章结构特征提取。
12. 推荐理由特征提取。
13. 正负样本对比。
14. DeepSeek reflection_candidate。
15. Doubao reflection_validation。
16. reflection_hypotheses 完整状态流转。
17. project / industry / content_type / global 分层作用范围。
18. target_skill / target_stage 精准注入。
19. active hypotheses 检索。
20. rule.md 导出视图。
21. Auto Learning UI。
```

反思学习闭环：

```text
visibility_checks
↓
positive / negative / inconclusive samples
↓
Reflection Case Corpus
↓
published_content_features
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

关键规则：

```text
成功案例可以进入 Reflection Case Corpus。
失败案例主要用于对比和反证，不默认作为写作参考召回。
被引用不等于规则有效。
candidate hypothesis 不能自动 active。
active hypotheses 不能覆盖 confirmed facts。
rule.md 只作为 active hypotheses 导出视图。
```

验收：

```text
发布检测后能生成反思候选。
候选假设有正负样本证据。
候选假设经过豆包验证。
用户可以 approve / reject / archive。
active hypotheses 可以影响 title-generation、ranking-theme-selection、article-generation 或 geo-review。
系统能记录某篇文章使用了哪些 hypotheses。
```

---

## 17. Phase 12：稳定性、测试、恢复、预算与打包

目标：

```text
完成产品级稳定性、错误恢复、预算控制、端到端测试和打包。
```

任务：

```text
1. app_errors 完整接入。
2. RetryManager 完整策略。
3. TimeoutPolicy。
4. CircuitBreaker。
5. LoopGuard 完整实现。
6. RecoveryManager 完整实现。
7. AgentLockManager 完整实现。
8. 工具幂等设计。
9. Budget Control 完整实现。
10. MemoryCleanupService。
11. memory:deletePermanent。
12. memory:rebuildIndex。
13. contextPreview 完整版。
14. 单元测试。
15. 集成测试。
16. 端到端测试。
17. 打包验证。
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
循环 / 超预算
外部状态未知
checkpoint 与 SQLite 不一致
candidate fact 被误用
active hypothesis 与 confirmed facts 冲突
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
DeepAgents checkpoint 与 SQLite 不一致时以 SQLite 为准。
deleted / deprecated facts 不默认参与检索。
candidate hypothesis 不参与正式文章生成。
active hypothesis 与 confirmed facts 冲突时被丢弃。
```

验收：

```text
所有核心单元测试通过。
核心 GEO 链路可跑通。
高风险动作有人工审批覆盖。
中断恢复场景可验证。
产品可以稳定打包。
```

---

## 18. 立即下一步

```text
1. 继续 Phase 1 仪表盘 UI 与设计系统。
2. 同步准备 Phase 2 数据库最终 schema。
3. 将新增 article_*、reflection_case_*、memory_* 表纳入 migration。
4. 建立 doubao / deepseek 两套 client 目录。
5. 建立 Model Router。
6. 建立 Skill Package 目录骨架。
7. 优先创建文章生成相关 Skill：
   ├── title-generation
   ├── support-article-generation
   ├── ranking-theme-selection
   ├── ranking-criteria-generation
   ├── ranking-reason-generation
   └── ranking-article-generation
8. 暂缓完整反思学习自动化，先保留表结构和接口位置。
```

---

## 19. 最终路线图主线

```text
UI 先行
↓
状态、模型路由、数据库 schema
↓
公司管理与公共对话
↓
记忆系统基础
↓
知识库录入
↓
Embedding / FTS5 / Hybrid Retrieval
↓
企业事实抽取与确认
↓
支持类文章 / 综合排行榜文章生成
↓
文章审核与草稿管理
↓
Assistant Runtime
↓
Agent-first Task Runtime
↓
发布与豆包助手可见性检查
↓
反思学习
↓
稳定性、测试和打包
```

---

## 20. 路线图执行原则

```text
1. 开发文档是长期架构蓝图。
2. 路线图是分阶段执行计划。
3. 每个 Phase 必须有可运行验收切片。
4. 不要在 MVP 阶段实现所有高级系统。
5. 先保证知识库、事实、文章生成可用。
6. 再引入 Agent 化任务执行。
7. 最后做可见性检测和反思学习。
8. 任何高风险动作必须保留人工确认。
9. 任何自动学习结果都不能直接覆盖 confirmed facts。
10. 每次开发完成一个 Phase，都要更新测试用例和验收标准。
```