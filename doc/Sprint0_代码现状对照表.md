# Sprint 0 代码现状对照表

> 本表用于记录 Sprint 0 结束时各核心能力的实现状态，作为后续迭代的基线。状态说明：
> - ✅ 已完成：核心链路已跑通，可直接使用
> - ⚠️ 骨架/部分完成：表或 IPC 已存在，但关键逻辑未实现或未接入主线
> - ❌ 未开始：缺少表、服务或 UI

| 能力 | 状态 | 说明 | 对应 Phase |
|---|---|---|---|
| Electron + SQLite 骨架 | ✅ | 主进程、IPC、数据库迁移已跑通 | Phase 0 |
| 仪表盘 UI 与设计系统 | ⚠️ | LayoutShell、Sidebar、DashboardView 已存在，部分图表和卡片为占位 | Phase 1 |
| 项目/公司管理 | ✅ | projects CRUD 完整 | Phase 2/3 |
| 公共对话历史 | ⚠️ | chat_sessions / chat_messages 表完整， Assistant Runtime 流式为骨架 | Phase 3 |
| 文件清洗、语义切片与 Embedding | ✅ | parser → cleaner → chunker → embed → vector + FTS5 已跑通 | Phase 4 |
| Hybrid Retrieval / Evidence Pack | ⚠️ | Fact + FTS5 + Vector + 重排已有，缺 missingFields/riskWarnings 生成 | Phase 5 |
| 企业事实抽取 | ❌ | enterprise_facts 表存在，无 DeepSeek JSON 抽取实现 | Phase 6 |
| 人工确认事实 | ⚠️ | `kb:factsUpdate` 可修改状态，无完整确认/拒绝 UI 闭环 | Phase 6 |
| 文章生成 MVP | ❌ | 无 Skill Package 目录，无 article_* 表（本次 Sprint 补齐 schema） | Phase 7 |
| Claim-source 校验 | ❌ | 无 article_claims / article_claim_sources 业务逻辑（本次 Sprint 补齐 schema） | Phase 7 |
| Assistant Runtime 真流式 | ⚠️ | assistant_runs / chat_messages 表和 IPC 有，`assistant:streamStart` 只写记录不真流式 | Phase 8 |
| Agent-first Task Runtime | ⚠️ | DeepAgents.js 可跑基础问答，allowedActionPolicy / ToolGuard / LoopGuard 未接入主线 | Phase 9 |
| 发布 | ⚠️ | publish_records 表有，`publish:plan` 只写库未真实发布 | Phase 10 |
| 可见性检测 | ⚠️ | visibilityChecker.ts 有实现，但 IPC handler 只写空记录，未真实调用 | Phase 10 |
| 反思学习 | ❌ | reflection_hypotheses 表结构已修正，但无闭环服务 | Phase 11 |
| 稳定性/测试/打包 | ❌ | 无测试用例，打包脚本依赖 electron-builder 配置待验证 | Phase 12 |

## 关键 issue 列表

1. **企业事实抽取未实现**  
   影响：Phase 6 无法闭环，下游文章生成缺少 confirmed facts。  
   下一步：接入 DeepSeek Chat Completions JSON 抽取，设计人工确认 UI。

2. **文章生成 Skill 缺失**  
   影响：Phase 7 完全空白，MVP 核心产出无法生成。  
   下一步：创建 `skills/` 目录，定义 prompt contracts 与输出 schema，先实现 support-article-generation 与 ranking-article-generation。

3. **Claim-source 校验缺失**  
   影响：文章 claim 无法溯源，无法识别 unsupported claims。  
   下一步：在 article 生成流程中写入 article_claims + article_claim_sources，并增加 claim-review UI。

4. **Assistant Runtime 流式为骨架**  
   影响：聊天体验不是真流式，工具审批/队列未真正运行。  
   下一步：实现 `assistant:streamStart` 真实 SSE 流式写入 assistant_stream_events，并驱动工具审批流程。

5. **Agent Runtime 未接入主线**  
   影响：虽然能跑基础问答，但策略、校验、记忆上下文未启用。  
   下一步：在 `geoAgentRuntime.ts` 中接入 allowedActionPolicy、dynamicToolRegistry、ToolGuard、LoopGuard。

6. **发布/可见性调用为占位**  
   影响：无法真实发布内容或检测豆包助手可见性。  
   下一步：接入真实渠道 API，并在 `visibility:check` handler 中调用 `visibilityChecker.ts`。

7. **反思学习无闭环服务**  
   影响：无法沉淀正负样本和优化假设。  
   下一步：建设 reflection case corpus 与假设生成/验证服务。

8. **类型/表字段不一致**  
   - `model_call_logs` SQL 列为 `duration_ms`，`ModelCallLog` 接口为 `latency_ms`，建议后续统一。  
   - 本次 Sprint 已修正 `reflection_hypotheses` 表结构与 TypeScript 类型。

## 本轮 Sprint 交付

1. 开发文档 Phase 编号已与路线图对齐（新增 Phase 7 占位，原 7–10 顺延为 8–11）。
2. 路线图已声明为 Phase 编号唯一基准，并明确冻结 MVP 范围（Phase 1–7）。
3. 新增 `012_mvp_article_schema.sql`，补齐 conversation_summaries、memory_events、article_*、ranking_* 表。
4. 新增 `013_reflection_hypotheses_fix.sql`，修正 reflection_hypotheses 表结构。
5. 更新 `src/types/domain.ts`，补充新表接口并修正 ReflectionHypothesis 类型。
