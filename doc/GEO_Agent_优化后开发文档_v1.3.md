# GEO Agent 优化后开发文档 v1.3

> 基于 DeepAgents.js 原生 Skills、SQLite + sqlite-vec、本地企业知识库、人工确认发布与双层反思规则的 GEO（Generative Engine Optimization）桌面智能助手方案。

---

## 文档信息

| 项目 | 内容 |
|---|---|
| 文档版本 | v1.3 |
| 更新时间 | 2026-06-20 |
| 核心调整 | 采用 SQLite + sqlite-vec；使用 DeepAgents.js 原生 Skills；发布前人工确认；企业事实结构化抽取；反思规则两层化 |
| 目标形态 | Electron 桌面应用 |
| 主要用户 | 企业内容运营、SEO/GEO 服务商、本地服务商家、行业内容团队 |

---

## 目录

1. 项目定位与核心目标
2. v1.3 关键决策
3. MVP 范围
4. 整体架构
5. 技术栈
6. 数据与知识库设计
7. SQLite + sqlite-vec 向量检索设计
8. 企业知识库录入与结构化事实抽取
9. 公共聊天与当前知识库选择
10. DeepAgents.js Skills 设计
11. GEO 工作流设计
12. 文章生成与合规校验
13. AI 选择渠道 + 人工确认发布
14. 可见性检测与反思优化
15. 数据库设计
16. IPC 设计
17. 运行日志、成本与可观测性
18. 开发计划
19. 风险与后续扩展
20. 附录：Skill 示例

---

# 1. 项目定位与核心目标

## 1.1 产品定位

GEO Agent 是一款基于 AI 的本地企业知识库与 GEO 内容优化桌面工具，帮助企业基于真实资料生成更适合搜索引擎与 AI 搜索引擎理解、引用和推荐的内容。

系统重点不是简单生成文章，而是构建一条可验证的 GEO 工作流：

```text
企业资料录入
  ↓
结构化事实抽取 + 向量化知识库
  ↓
生成核心问题
  ↓
推荐发稿渠道
  ↓
生成合规、真实、AI 检索友好的文章
  ↓
用户确认渠道与内容
  ↓
调用发稿平台 API 发布
  ↓
检测 AI 是否引用文章 URL
  ↓
沉淀全局 / 行业反思规则
```

## 1.2 核心价值

| 价值 | 说明 |
|---|---|
| 降低幻觉 | 企业事实结构化抽取 + 原文证据 + RAG 检索 + 生成后校验 |
| 提升内容可采纳性 | 生成内容必须基于企业知识库与已确认事实 |
| 提升 GEO 可见性 | 文章结构围绕 AI 摘要、引用、问答检索进行优化 |
| 控制合规风险 | 广告法、绝对化用语、无证据排名、虚假背书全部进入校验流程 |
| 形成优化飞轮 | 根据 AI 是否引用已发布文章，反向总结规则并作用于后续流程 |

---

# 2. v1.3 关键决策

## 2.1 向量数据库选择：SQLite + sqlite-vec

本版本确定使用 SQLite + sqlite-vec 作为本地向量检索方案。

选择原因：

1. 与现有 SQLite 业务数据库统一，减少运行时依赖。
2. 适合 Electron 桌面应用，部署和打包比独立向量数据库服务更简单。
3. 支持本地向量搜索，可用于企业知识库问答、文章生成前的 RAG 检索。
4. 后续可通过 VectorStore Adapter 切换为 LanceDB、Chroma 或远程向量数据库。

## 2.2 不再自研完整 SkillLoader

使用 DeepAgents.js 原生 Skills 系统。

原自定义 SkillLoader 不再作为运行时核心模块，只保留以下可能用途：

- 开发期校验 Skill 目录结构。
- 校验 JSON Schema 与 reference 文件是否存在。
- 批量导入全局规则、行业规则。

## 2.3 文章生成只保留 3 个核心 Skill

文章生成阶段不拆成过多 Skill，避免工程复杂度失控。

保留：

1. `article-generate`：生成标题、摘要、正文、FAQ、结构化输出。
2. `article-review`：事实、合规、广告法、SEO、E-E-A-T、AI 检索友好度检查。
3. `reflection-apply`：读取已确认的全局 / 行业反思规则并注入生成流程。

细规则通过 reference 文件提供，不再全部做成独立 Skill。

## 2.4 发布流程改为人工确认后发布

AI 负责自动推荐渠道和生成发布计划，但不得直接调用发稿平台发布。

流程为：

```text
AI 推荐渠道
  ↓
生成发布计划
  ↓
用户确认渠道、价格、文章、标题
  ↓
调用发稿平台 API
  ↓
保存发布记录和 URL
```

## 2.5 反思规则只做两层

第一版反思规则只分为：

1. 全局反思规则：适用于所有行业，例如标题结构、内容结构、AI 检索友好规则、通用合规规则。
2. 行业反思规则：适用于某个行业，例如装修、汽车音响、预制菜、本地服务、B2B 供应链等。

暂不做项目级规则，降低复杂度。

---

# 3. MVP 范围

## 3.1 MVP 必做

| 模块 | 是否纳入 MVP | 说明 |
|---|---:|---|
| 公共聊天 | 是 | 所有企业共用一个聊天入口，可切换当前知识库 |
| 企业知识库管理 | 是 | 支持创建、选择、录入、更新、删除 |
| 结构化事实抽取 | 是 | 提取企业档案、产品、背书、案例、痛点、关键词等 |
| 向量化检索 | 是 | 使用 SQLite + sqlite-vec 支持知识库问答和 RAG |
| 核心问题生成 | 是 | 基于当前知识库生成 GEO 问题 |
| 信源推荐 | 是 | AI 推荐发稿渠道，但不直接发布 |
| 文章生成 | 是 | 支撑类文章、排行榜类文章 |
| 文章审核 | 是 | 检查事实、合规、绝对化表达、广告法风险 |
| 人工确认发布 | 是 | 用户确认后调用发稿平台 API |
| 发布记录 | 是 | 保存发布状态、渠道、URL、费用、时间 |
| 可见性检测 | 是 | 调 AI 接口提问，检测是否引用已发布 URL |
| 反思规则候选 | 是 | 从被引用内容中总结候选规则 |
| 反思规则人工确认 | 是 | 候选规则确认后进入全局或行业规则库 |

## 3.2 MVP 暂不做

| 模块 | 暂不做原因 |
|---|---|
| 完全自动发布 | 合规与资金风险较高，需要人工确认 |
| 多人协作权限 | 桌面 MVP 阶段非核心 |
| 项目级反思规则 | 第一版规则数据量不足，容易过拟合 |
| 云端同步 | 本地桌面优先，后续可扩展 |
| 多模型自动路由优化 | 先固定任务模型映射，后续再根据效果优化 |

---

# 4. 整体架构

```text
┌─────────────────────────────────────────────────────────────┐
│                      Electron 桌面应用                       │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                  渲染进程 React                        │  │
│  │                                                       │  │
│  │  - 公共聊天 Assistant                                 │  │
│  │  - 当前企业知识库选择器                                │  │
│  │  - 知识库管理                                          │  │
│  │  - 企业事实确认                                        │  │
│  │  - 稿件管理                                            │  │
│  │  - 发布确认                                            │  │
│  │  - 可见性与反思规则                                    │  │
│  └─────────────────────────┬─────────────────────────────┘  │
│                            │ IPC / contextBridge             │
│  ┌─────────────────────────▼─────────────────────────────┐  │
│  │                  主进程 Node.js                        │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │            DeepAgents.js Runtime                 │  │  │
│  │  │  - Agent Executor                               │  │  │
│  │  │  - 原生 Skills                                  │  │  │
│  │  │  - Tool Calling                                 │  │  │
│  │  │  - Human-in-the-loop 控制点                      │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌─────────────────────────────────────────────────┐  │  │
│  │  │              GEO Workflow Service                │  │  │
│  │  │  - 可恢复 run                                   │  │  │
│  │  │  - 阶段 step 记录                               │  │  │
│  │  │  - 暂停 / 重跑 / 继续                            │  │  │
│  │  └─────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │  │ SQLite 业务库 │ │ sqlite-vec    │ │ LLM Gateway    │ │
│  │  │ better-sqlite3│ │ 向量检索      │ │ DeepSeek/豆包   │ │
│  │  └──────────────┘ └──────────────┘ └───────────────┘ │
│  │                                                       │
│  │  ┌──────────────┐ ┌──────────────┐ ┌───────────────┐ │
│  │  │ Publish API  │ │ File Parser  │ │ Rule Engine    │ │
│  │  │ 发稿平台      │ │ 文档解析       │ │ 反思规则/合规   │ │
│  │  └──────────────┘ └──────────────┘ └───────────────┘ │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

# 5. 技术栈

| 层级 | 技术选型 |
|---|---|
| 桌面框架 | Electron |
| 前端 | React + TypeScript + Vite + Tailwind CSS |
| 主进程 | Node.js + CommonJS 或 ESM，建议主进程保持单一模块体系 |
| Agent 框架 | DeepAgents.js |
| 流程编排 | LangGraph.js 或自定义 Workflow Service |
| 关系数据库 | SQLite + better-sqlite3 |
| 向量检索 | sqlite-vec |
| Embedding 模型 | 豆包 / Ark Embedding 或可配置 Embedding Provider |
| LLM 模型 | DeepSeek、豆包 |
| 文件解析 | mammoth、pdf-parse、xlsx、纯文本解析等 |
| Schema 校验 | Zod |
| 打包 | electron-builder |

---

# 6. 数据与知识库设计

## 6.1 企业知识库由三层组成

```text
企业知识库
├── 原始资料层
│   ├── 上传文件
│   ├── 粘贴文本
│   ├── 官网/公开资料整理文本
│   └── 用户手动补充资料
│
├── 语义检索层
│   ├── 文档切片
│   ├── embedding 向量
│   ├── sqlite-vec 向量索引
│   └── metadata 过滤
│
└── 结构化事实层
    ├── 企业名称
    ├── 简称/品牌名
    ├── 地址
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
    ├── 派生关键词
    └── 风险提示
```

## 6.2 为什么需要结构化事实 + 向量库

| 能力 | 作用 |
|---|---|
| 向量库 | 适合用户提问、语义召回、文章生成前检索相关原文 |
| 结构化事实 | 适合稳定生成企业介绍、产品介绍、案例、背书、地址、服务区域 |
| 原文证据 | 用于核对模型输出，降低幻觉 |
| 人工确认 | 将 AI 抽取结果转为可信企业档案 |
| 风险提示 | 限制文章生成边界，避免无证据宣传 |

## 6.3 企业事实状态

每个结构化事实都有状态：

| 状态 | 含义 |
|---|---|
| extracted | AI 已抽取，尚未人工确认 |
| confirmed | 用户确认，可优先用于文章生成 |
| rejected | 用户否定，不得使用 |
| needs_review | 置信度低或有风险，需要人工复核 |

文章生成时优先级：

```text
confirmed > extracted 且 confidence >= 0.8 > 低置信度事实
```

低置信度事实默认不得作为核心宣传事实使用。

---

# 7. SQLite + sqlite-vec 向量检索设计

## 7.1 设计目标

1. 支持企业知识库问答。
2. 支持文章生成前 RAG 检索。
3. 支持按 `project_id`、`knowledge_base_id` 严格隔离。
4. 支持后续替换为其他向量库。

## 7.2 VectorStore Adapter

业务层不得直接依赖 sqlite-vec 具体实现，统一通过 adapter 调用。

```typescript
export interface VectorStore {
  init(): Promise<void>;

  addChunks(input: {
    projectId: string;
    knowledgeBaseId: string;
    chunks: Array<{
      chunkId: string;
      text: string;
      embedding: number[];
      metadata?: Record<string, any>;
    }>;
  }): Promise<void>;

  search(input: {
    projectId: string;
    knowledgeBaseId: string;
    queryEmbedding: number[];
    topK?: number;
    filters?: Record<string, any>;
  }): Promise<Array<{
    chunkId: string;
    content: string;
    score: number;
    metadata?: Record<string, any>;
  }>>;

  deleteByKnowledgeBaseId(knowledgeBaseId: string): Promise<void>;
}
```

## 7.3 向量表设计

> 注意：sqlite-vec 的向量维度需要与实际 Embedding 模型输出维度一致。文档中用 `EMBEDDING_DIM` 表示，实际建表时应替换为具体数值。

```sql
-- 知识库切片业务表
CREATE TABLE knowledge_chunks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    entry_id TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT,
    token_count INTEGER,
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- sqlite-vec 向量表，维度由 embedding 模型决定
-- 示例：vec0(chunk_embedding float[EMBEDDING_DIM])
CREATE VIRTUAL TABLE vec_knowledge_chunks USING vec0(
    chunk_embedding float[EMBEDDING_DIM]
);

-- 映射表：业务 chunk 与 vec rowid 对应
CREATE TABLE knowledge_chunk_vectors (
    chunk_id TEXT PRIMARY KEY,
    vec_rowid INTEGER NOT NULL,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    embedding_model TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chunk_id) REFERENCES knowledge_chunks(id)
);

CREATE INDEX idx_chunks_project_kb ON knowledge_chunks(project_id, knowledge_base_id);
CREATE INDEX idx_vectors_project_kb ON knowledge_chunk_vectors(project_id, knowledge_base_id);
```

## 7.4 检索流程

```text
用户提问
  ↓
生成 query embedding
  ↓
sqlite-vec 查找相似向量
  ↓
根据 rowid 映射 chunk_id
  ↓
按 project_id + knowledge_base_id 过滤
  ↓
读取原文片段
  ↓
交给 LLM 基于证据回答
```

## 7.5 知识库问答要求

回答知识库问题时，必须遵守：

1. 只基于当前选择的知识库回答。
2. 不得混用其他企业知识库。
3. 找不到依据时，明确回复“当前知识库没有相关信息”。
4. 尽量引用结构化事实和原文片段。
5. 不得把派生关键词当作原文事实。

---

# 8. 企业知识库录入与结构化事实抽取

## 8.1 录入入口

用户可以通过公共聊天触发录入：

- 点击“录入知识库”。
- 上传文件。
- 粘贴企业资料。
- 输入企业名称后由联网搜索整理资料。
- 手动补充结构化字段。

触发录入后，如果当前没有知识库，则创建新企业项目和默认知识库；如果已有当前知识库，则默认录入当前知识库。

## 8.2 录入流程

```text
用户上传 / 粘贴资料
  ↓
文档解析
  ↓
文本清洗
  ↓
内容切片
  ↓
embedding 向量化
  ↓
写入 SQLite + sqlite-vec
  ↓
调用 knowledge-base-ingest Skill
  ↓
抽取结构化企业事实
  ↓
生成 missing_fields 与 warnings
  ↓
用户确认或修正
  ↓
写入 enterprise_facts
```

## 8.3 事实抽取输出原则

1. 原文中没有出现的信息，不得编造。
2. 每个事实必须带 `source_quote` 或明确标注为 derived。
3. `source_quote` 应可以在原文中字符串匹配。
4. 数组字段中的每个项目最好都有独立证据。
5. 低置信度事实进入 `needs_review`。
6. 派生关键词不得和原文事实混淆。
7. 风险提示需要写入 `risk_warnings`。

---

# 9. 公共聊天与当前知识库选择

## 9.1 设计原则

系统采用公共聊天入口，而不是每个企业一个独立聊天窗口。

用户在聊天输入框上方或侧边选择当前企业知识库。

```text
当前知识库：成都行乐音改汽车用品有限公司 ▼
[ 输入问题 / 上传资料 / 开始 GEO 优化 ]
```

## 9.2 当前知识库上下文

每条聊天消息都记录当时的：

- `session_id`
- `project_id`
- `knowledge_base_id`
- `message_role`
- `message_content`
- `intent`
- `created_at`

这样公共聊天不会丢失上下文，也可以追溯某条回答基于哪个企业知识库。

## 9.3 默认切换规则

| 场景 | 行为 |
|---|---|
| 用户新建企业知识库 | 自动切换为新知识库 |
| 用户触发录入知识库 | 默认录入当前选择的知识库 |
| 当前没有知识库 | 引导创建企业知识库 |
| 用户切换知识库 | 后续回答、生成、推荐均基于新知识库 |
| 用户提问但未选择知识库 | 提示选择或创建知识库 |

## 9.4 建议按钮逻辑

```typescript
function generateSuggestions(context) {
  const { hasKnowledgeBase, selectedKnowledgeBaseId, currentRunStatus } = context;

  if (!hasKnowledgeBase) {
    return [
      { label: '创建企业知识库', action: 'create_knowledge_base' },
      { label: '录入企业资料', action: 'ingest_knowledge' },
      { label: '企业信息查询', action: 'search_company_info' },
    ];
  }

  if (hasKnowledgeBase && !selectedKnowledgeBaseId) {
    return [
      { label: '选择企业知识库', action: 'select_knowledge_base' },
      { label: '新建企业知识库', action: 'create_knowledge_base' },
    ];
  }

  if (selectedKnowledgeBaseId) {
    if (currentRunStatus === 'awaiting_publish_approval') {
      return [
        { label: '确认发布', action: 'approve_publish_plan' },
        { label: '修改发布渠道', action: 'edit_publish_plan' },
        { label: '查看稿件', action: 'open_draft' },
      ];
    }

    return [
      { label: '提问知识库', action: 'query_knowledge' },
      { label: '录入资料', action: 'ingest_knowledge' },
      { label: '开始 GEO 优化', action: 'start_geo_flow' },
      { label: '查看企业事实', action: 'review_enterprise_facts' },
    ];
  }

  return [];
}
```

---

# 10. DeepAgents.js Skills 设计

## 10.1 Skills 总体结构

```text
skills/
├── knowledge-base-ingest/
│   ├── SKILL.md
│   └── reference/
│       └── enterprise_fact_schema.json
│
├── question-generation/
│   ├── SKILL.md
│   └── reference/
│       ├── question_types.json
│       └── global_reflection_rules.json
│
├── source-recommendation/
│   ├── SKILL.md
│   └── reference/
│       ├── channel_rules.json
│       └── industry_channel_rules.json
│
├── article-generate/
│   ├── SKILL.md
│   └── reference/
│       ├── support_article_rules.md
│       ├── ranking_article_rules.md
│       ├── title_rules.md
│       ├── seo_eeat_rules.md
│       ├── geo_ai_retrieval_rules.md
│       └── compliance_rules.md
│
├── article-review/
│   ├── SKILL.md
│   └── reference/
│       ├── factuality_check_rules.md
│       ├── ad_law_risk_words.md
│       ├── unsupported_claims_rules.md
│       └── ranking_article_risk_rules.md
│
├── reflection-apply/
│   ├── SKILL.md
│   └── reference/
│       ├── global_reflection_rules.json
│       └── industry_reflection_rules.json
│
└── reflection-generate/
    ├── SKILL.md
    └── reference/
        ├── reflection_rule_schema.json
        └── visibility_examples.json
```

## 10.2 Skill 职责

| Skill | 职责 |
|---|---|
| knowledge-base-ingest | 企业资料结构化抽取 |
| question-generation | 基于企业事实和知识库生成 GEO 核心问题 |
| source-recommendation | 基于问题、行业、地域推荐发稿渠道 |
| article-generate | 生成文章标题、正文、摘要、FAQ |
| article-review | 检查事实、合规、广告法、SEO、AI 检索友好度 |
| reflection-apply | 将已确认反思规则注入生成流程 |
| reflection-generate | 从可见性检测结果中生成候选反思规则 |

## 10.3 Skill 使用原则

1. 运行时优先使用 DeepAgents.js 原生 Skills。
2. Skill 只描述任务规则，不承担业务数据库操作。
3. 数据库读写由工具和 service 完成。
4. Skill 输出必须有明确 JSON contract。
5. 所有用于自动流程的 Skill 输出都必须通过 Zod 校验。

---

# 11. GEO 工作流设计

## 11.1 工作流阶段

```text
Stage 0: 知识库构建
Stage 1: 企业事实确认
Stage 2: 核心问题生成
Stage 3: 信源推荐
Stage 4: 文章生成
Stage 5: 文章审核
Stage 6: 发布计划生成
Stage 7: 用户确认发布
Stage 8: 调用发稿平台 API
Stage 9: 可见性检测
Stage 10: 反思规则候选生成
Stage 11: 反思规则人工确认
```

## 11.2 可恢复设计

每次 GEO 优化都创建 `geo_runs`。

每个阶段都写入 `geo_run_steps`。

```text
geo_runs
  ├── run_id
  ├── project_id
  ├── knowledge_base_id
  ├── current_stage
  ├── status
  └── created_at

geo_run_steps
  ├── step_id
  ├── run_id
  ├── stage
  ├── status
  ├── input_json
  ├── output_json
  ├── error_message
  ├── started_at
  └── completed_at
```

支持：

- 从失败阶段继续。
- 重跑指定阶段。
- 用户修改问题后，标记下游内容过期。
- 用户修改文章后，重新审核。
- 发布前暂停等待人工确认。

## 11.3 工作流状态

| 状态 | 含义 |
|---|---|
| running | 正在执行 |
| paused | 暂停中 |
| awaiting_user_input | 等待用户输入 |
| awaiting_fact_review | 等待企业事实确认 |
| awaiting_article_review | 等待文章审核确认 |
| awaiting_publish_approval | 等待用户确认发布 |
| completed | 已完成 |
| failed | 执行失败 |
| cancelled | 用户取消 |

## 11.4 重跑规则

| 用户操作 | 系统行为 |
|---|---|
| 修改企业事实 | 标记问题、文章、发布计划可能过期 |
| 修改核心问题 | 重跑信源推荐、文章生成、审核、发布计划 |
| 修改文章 | 重跑文章审核、发布计划 |
| 修改发布渠道 | 重生成发布计划 |
| 发布失败 | 允许从发布阶段重试 |

---

# 12. 文章生成与合规校验

## 12.1 文章生成输入

文章生成不得只依赖用户一句话，必须组合以下输入：

```text
当前企业知识库
+ 已确认企业事实
+ RAG 检索片段
+ 核心问题
+ 文章类型
+ 发稿渠道要求
+ 全局反思规则
+ 行业反思规则
+ 合规与广告法约束
```

## 12.2 文章类型

| 类型 | 说明 |
|---|---|
| support | 支撑类文章，如企业介绍、服务说明、案例、工艺流程、避坑指南 |
| ranking | 排行榜类文章，如“XX地区XX公司推荐”“XX行业十大品牌参考” |

## 12.3 支撑类文章推荐结构

```markdown
# 标题

## 摘要
2-3 句话直接回答用户问题。

## 适合谁阅读
说明目标用户。

## 核心结论
列出 3-5 条结论。

## 企业事实依据
引用企业知识库中的真实事实。

## 详细说明
展开服务、产品、流程、案例、优势。

## 常见问题
FAQ 3-5 条。

## 选择建议
给用户决策建议，避免夸大。

## 信息来源与免责声明
说明内容基于企业资料整理。
```

## 12.4 排行榜文章强制约束

排行榜文章必须包含：

1. 评选标准。
2. 信息来源说明。
3. 更新时间。
4. 免责声明。
5. 不得宣称无证据排名。
6. 不得使用“第一、唯一、最好、首选”等绝对化表达。
7. 如企业自身进入榜单，必须保持客观中立。

## 12.5 生成输出 Contract

```json
{
  "title": "",
  "article_type": "support",
  "summary": "",
  "body_markdown": "",
  "faq": [
    {
      "question": "",
      "answer": ""
    }
  ],
  "claims": [
    {
      "claim": "",
      "source_type": "enterprise_fact | rag_chunk | derived | unsupported",
      "source_id": "",
      "confidence": 0.0
    }
  ],
  "unsupported_claims": [],
  "risk_words": [],
  "compliance_warnings": [],
  "seo_notes": [],
  "geo_retrieval_notes": []
}
```

## 12.6 文章审核输出 Contract

```json
{
  "passed": false,
  "risk_level": "low | medium | high",
  "factuality": {
    "unsupported_claims": [],
    "low_confidence_claims": []
  },
  "compliance": {
    "absolute_terms": [],
    "ad_law_risks": [],
    "ranking_risks": []
  },
  "seo": {
    "title_score": 0,
    "structure_score": 0,
    "keyword_usage_notes": []
  },
  "geo_ai_retrieval": {
    "has_direct_answer": false,
    "has_faq": false,
    "entity_consistency": true,
    "improvement_notes": []
  },
  "revision_suggestions": []
}
```

---

# 13. AI 选择渠道 + 人工确认发布

## 13.1 发布设计原则

1. AI 可以推荐渠道。
2. AI 可以生成发布计划。
3. AI 不得未经确认直接发稿。
4. 用户确认后才调用发稿平台 API。
5. 所有发布行为必须保存记录。

## 13.2 发布流程

```text
文章审核通过
  ↓
AI 推荐发稿渠道
  ↓
生成发布计划
  ↓
用户确认渠道、标题、正文、价格、时间
  ↓
调用发稿平台 API
  ↓
保存 external_id / published_url / status
```

## 13.3 发布计划 Contract

```json
{
  "draft_id": "",
  "recommended_channels": [
    {
      "channel_name": "",
      "channel_type": "portal | vertical | social | local | self_media",
      "score": 0,
      "reason": "",
      "estimated_price": "",
      "risk_notes": []
    }
  ],
  "selected_channel": null,
  "publish_title": "",
  "publish_content": "",
  "requires_user_approval": true
}
```

---

# 14. 可见性检测与反思优化

## 14.1 可见性检测思路

用户发布文章后，系统定期或手动执行可见性检测。

检测方式：

1. 基于核心问题调用 AI 接口提问。
2. 分析 AI 回答中是否引用或提及已发布文章 URL。
3. 对比发布记录中的 URL。
4. 保存匹配结果、响应内容、引用片段、置信度。

## 14.2 检测结果解释

如果文章被 AI 引用，只能说明该内容在当前问题、当前时间、当前 AI 引擎下具有较好的可见性。

不能直接等同于：

- 文章质量绝对优秀。
- 渠道一定有效。
- 标题规则一定正确。
- 后续一定稳定引用。

因此反思规则需要结合：

- 文章标题。
- 文章结构。
- 核心问题匹配度。
- 发布渠道。
- URL 是否被引用。
- 引用位置。
- 回答语义是否正面。
- 是否包含 FAQ、摘要、事实依据。

## 14.3 双层反思规则

### 全局反思规则

适用于所有行业。

适合沉淀：

- 标题结构。
- 文章开头写法。
- FAQ 结构。
- AI 检索友好结构。
- 通用合规规则。
- 通用事实引用规则。

示例：

```json
{
  "scope": "global",
  "target_stage": "content_generation",
  "rule_type": "article_structure",
  "content": "文章开头 150 字内应直接回答核心问题，并出现企业主体、服务区域和服务场景。",
  "evidence_count": 8,
  "confidence": 0.82,
  "status": "active"
}
```

### 行业反思规则

适用于某个行业。

适合沉淀：

- 行业高价值问题类型。
- 行业可信背书类型。
- 行业内容结构偏好。
- 行业合规风险。
- 行业常见用户痛点。

示例：

```json
{
  "scope": "industry",
  "industry": "汽车音响改装",
  "target_stage": "question_generation",
  "rule_type": "query_pattern",
  "content": "汽车音响改装行业的问题应优先覆盖车型、无损改装、隔音、DSP调音、价格区间等场景。",
  "evidence_count": 5,
  "confidence": 0.76,
  "status": "pending_review"
}
```

## 14.4 反思规则状态

```text
candidate → pending_review → active / rejected / archived
```

第一版不允许候选规则自动生效。

必须用户确认后才能进入正式流程。

## 14.5 规则作用阶段

| target_stage | 说明 |
|---|---|
| question_generation | 问题生成 |
| source_recommendation | 信源推荐 |
| title_generation | 标题生成 |
| content_generation | 正文生成 |
| article_review | 文章审核 |
| publish_channel_selection | 渠道选择 |
| visibility_check | 可见性检测 |

---

# 15. 数据库设计

## 15.1 项目表

```sql
CREATE TABLE projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    industry TEXT,
    region TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 15.2 企业知识库表

```sql
CREATE TABLE knowledge_bases (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## 15.3 知识库原始条目

```sql
CREATE TABLE knowledge_entries (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    source_type TEXT,
    source_file_path TEXT,
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id)
);
```

## 15.4 知识库切片

```sql
CREATE TABLE knowledge_chunks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    entry_id TEXT NOT NULL,
    content TEXT NOT NULL,
    content_hash TEXT,
    token_count INTEGER,
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (entry_id) REFERENCES knowledge_entries(id)
);
```

## 15.5 向量映射表

```sql
CREATE TABLE knowledge_chunk_vectors (
    chunk_id TEXT PRIMARY KEY,
    vec_rowid INTEGER NOT NULL,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    embedding_model TEXT NOT NULL,
    embedding_dim INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (chunk_id) REFERENCES knowledge_chunks(id)
);
```

## 15.6 企业结构化事实

```sql
CREATE TABLE enterprise_facts (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    field_key TEXT NOT NULL,
    field_label TEXT NOT NULL,
    value_json TEXT,
    source_quote TEXT,
    source_entry_id TEXT,
    source_chunk_id TEXT,
    confidence REAL,
    is_derived BOOLEAN DEFAULT FALSE,
    derived_from_json TEXT,
    status TEXT DEFAULT 'extracted',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id)
);
```

## 15.7 聊天会话与消息

```sql
CREATE TABLE chat_sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    project_id TEXT,
    knowledge_base_id TEXT,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    intent TEXT,
    metadata_json TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES chat_sessions(id)
);
```

## 15.8 GEO 执行表

```sql
CREATE TABLE geo_runs (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    current_stage TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (knowledge_base_id) REFERENCES knowledge_bases(id)
);

CREATE TABLE geo_run_steps (
    id TEXT PRIMARY KEY,
    run_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    input_json TEXT,
    output_json TEXT,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES geo_runs(id)
);
```

## 15.9 生成产物

```sql
CREATE TABLE geo_artifacts (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    project_id TEXT NOT NULL,
    knowledge_base_id TEXT NOT NULL,
    artifact_type TEXT NOT NULL,
    title TEXT,
    content TEXT,
    metadata_json TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES geo_runs(id)
);
```

## 15.10 人工确认

```sql
CREATE TABLE human_approvals (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    approval_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reviewer_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    FOREIGN KEY (run_id) REFERENCES geo_runs(id)
);
```

## 15.11 发布记录

```sql
CREATE TABLE publish_records (
    id TEXT PRIMARY KEY,
    artifact_id TEXT NOT NULL,
    project_id TEXT NOT NULL,
    channel_name TEXT NOT NULL,
    channel_type TEXT,
    publish_title TEXT,
    status TEXT DEFAULT 'pending',
    external_id TEXT,
    published_url TEXT,
    estimated_price REAL,
    actual_price REAL,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (artifact_id) REFERENCES geo_artifacts(id),
    FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

## 15.12 可见性检测

```sql
CREATE TABLE visibility_checks (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    artifact_id TEXT,
    publish_record_id TEXT,
    query TEXT NOT NULL,
    ai_engine TEXT NOT NULL,
    response_text TEXT,
    matched BOOLEAN DEFAULT FALSE,
    matched_url TEXT,
    matched_quote TEXT,
    confidence REAL,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (artifact_id) REFERENCES geo_artifacts(id),
    FOREIGN KEY (publish_record_id) REFERENCES publish_records(id)
);
```

## 15.13 反思规则

```sql
CREATE TABLE reflection_rules (
    id TEXT PRIMARY KEY,
    scope TEXT NOT NULL, -- global / industry
    industry TEXT,
    target_stage TEXT NOT NULL,
    rule_type TEXT NOT NULL,
    content TEXT NOT NULL,
    evidence_json TEXT,
    evidence_count INTEGER DEFAULT 0,
    confidence REAL DEFAULT 0,
    status TEXT DEFAULT 'candidate',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 15.14 模型调用日志

```sql
CREATE TABLE model_call_logs (
    id TEXT PRIMARY KEY,
    run_id TEXT,
    stage TEXT,
    model TEXT NOT NULL,
    provider TEXT,
    input_tokens INTEGER,
    output_tokens INTEGER,
    latency_ms INTEGER,
    cost_estimate REAL,
    status TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 15.15 应用配置

```sql
CREATE TABLE app_settings (
    key TEXT PRIMARY KEY,
    value_json TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

# 16. IPC 设计

## 16.1 IPC 原则

1. 渲染进程不得直接访问 Node.js、SQLite、文件系统。
2. 所有 IPC 入口必须使用 Zod 做运行时校验。
3. 文件上传由主进程 dialog 选择或生成 file token。
4. 渲染进程不得传任意本地路径执行读取。
5. 所有涉及发布、删除、重跑的操作需要明确用户行为触发。

## 16.2 IPC Channels

```typescript
export interface IpcChannels {
  // Chat
  'chat:send': { message: string; sessionId?: string; projectId?: string; knowledgeBaseId?: string };
  'chat:stream': { message: string; sessionId?: string; projectId?: string; knowledgeBaseId?: string; requestId: string };
  'chat:history': { sessionId: string };

  // Knowledge Base
  'kb:create': { projectName: string; industry?: string; region?: string };
  'kb:list': {};
  'kb:select': { knowledgeBaseId: string };
  'kb:ingest-text': { knowledgeBaseId: string; text: string };
  'kb:ingest-file': { knowledgeBaseId: string; fileToken: string };
  'kb:query': { knowledgeBaseId: string; query: string; topK?: number };
  'kb:facts': { knowledgeBaseId: string };
  'kb:facts-update': { factId: string; valueJson: any; status: string };

  // GEO Workflow
  'geo:start': { knowledgeBaseId: string };
  'geo:status': { runId: string };
  'geo:resume': { runId: string };
  'geo:rerun-step': { runId: string; stage: string };
  'geo:cancel': { runId: string };

  // Drafts / Articles
  'draft:list': { projectId: string };
  'draft:get': { artifactId: string };
  'draft:update': { artifactId: string; title?: string; content?: string };
  'draft:review': { artifactId: string };

  // Publish
  'publish:plan': { artifactId: string };
  'publish:approve': { publishPlanId: string };
  'publish:status': { publishRecordId: string };

  // Visibility / Reflection
  'visibility:check': { publishRecordId: string; queries?: string[] };
  'reflection:list': { scope?: 'global' | 'industry'; industry?: string; status?: string };
  'reflection:approve': { ruleId: string };
  'reflection:reject': { ruleId: string };
}
```

---

# 17. 运行日志、成本与可观测性

## 17.1 必须记录的日志

| 日志 | 作用 |
|---|---|
| model_call_logs | 成本、延迟、错误排查 |
| geo_run_steps | 工作流恢复、重跑、失败定位 |
| publish_records | 发布状态追踪 |
| visibility_checks | GEO 效果验证 |
| reflection_rules | 优化规则沉淀 |

## 17.2 模型调用指标

每次 LLM / Embedding 调用记录：

- provider
- model
- stage
- input_tokens
- output_tokens
- latency_ms
- status
- error_message
- cost_estimate

## 17.3 质量指标

| 指标 | 含义 |
|---|---|
| Fact Coverage | 文章中可追溯事实占比 |
| Unsupported Claim Count | 无证据 claims 数量 |
| Article Review Pass Rate | 文章审核通过率 |
| Draft Acceptance Rate | 用户采纳率 |
| Publish Success Rate | 发稿成功率 |
| Visibility Match Rate | AI 引用 URL 命中率 |
| Reflection Rule Adoption Rate | 反思规则确认率 |

---

# 18. 开发计划

## Phase 1：基础工程与数据库（1 周）

| 任务 | 产出 |
|---|---|
| Electron + React 项目初始化 | 桌面应用骨架 |
| SQLite + better-sqlite3 集成 | 本地业务数据库 |
| sqlite-vec 验证 | 本地向量检索 PoC |
| 数据库迁移机制 | migrations |
| IPC 基础封装 | contextBridge API |

## Phase 2：知识库录入与向量检索（1.5 周）

| 任务 | 产出 |
|---|---|
| 知识库创建 / 选择 | KB 管理 |
| 文档解析与文本切片 | knowledge_entries / chunks |
| Embedding 调用 | 向量生成 |
| sqlite-vec 写入与查询 | 知识库问答检索 |
| 公共聊天 + 当前知识库上下文 | Assistant MVP |

## Phase 3：企业事实抽取（1 周）

| 任务 | 产出 |
|---|---|
| knowledge-base-ingest Skill | 结构化事实抽取 |
| enterprise_facts 存储 | 企业档案 |
| 事实确认 UI | 用户修正和确认 |
| missing_fields / warnings | 补充资料提示 |

## Phase 4：GEO 工作流与问题生成（1.5 周）

| 任务 | 产出 |
|---|---|
| geo_runs / steps | 可恢复工作流 |
| question-generation Skill | 核心问题生成 |
| source-recommendation Skill | 信源推荐 |
| 暂停 / 恢复 / 重跑 | 工作流控制 |

## Phase 5：文章生成与审核（2 周）

| 任务 | 产出 |
|---|---|
| article-generate Skill | 支撑类 / 排行榜文章 |
| article-review Skill | 合规与事实审核 |
| 稿件管理 UI | 草稿编辑 |
| unsupported claims 检查 | 防幻觉机制 |

## Phase 6：人工确认发布（1 周）

| 任务 | 产出 |
|---|---|
| 发布计划生成 | 推荐渠道与发布内容 |
| 人工确认发布 UI | 发布审批 |
| 发稿平台 API 接入 | 发布能力 |
| 发布记录保存 | URL / 状态 / 费用 |

## Phase 7：可见性检测与反思规则（1.5 周）

| 任务 | 产出 |
|---|---|
| visibility check | URL 命中检测 |
| reflection-generate Skill | 候选规则生成 |
| reflection-apply Skill | 规则应用 |
| 反思规则确认 UI | global / industry 规则库 |

## Phase 8：稳定性、安全与打包（1 周）

| 任务 | 产出 |
|---|---|
| IPC Zod 校验 | 安全加固 |
| 文件 token 机制 | 文件安全 |
| 错误恢复 | 稳定性 |
| electron-builder 打包 | 可安装应用 |
| sqlite-vec 打包验证 | 向量能力可分发 |

## 总工期预估

| 阶段 | 时间 |
|---|---:|
| Phase 1 | 1 周 |
| Phase 2 | 1.5 周 |
| Phase 3 | 1 周 |
| Phase 4 | 1.5 周 |
| Phase 5 | 2 周 |
| Phase 6 | 1 周 |
| Phase 7 | 1.5 周 |
| Phase 8 | 1 周 |
| 合计 | 约 10.5 周 |

---

# 19. 风险与后续扩展

## 19.1 主要风险

| 风险 | 应对 |
|---|---|
| sqlite-vec 打包兼容性 | Phase 1 提前验证 Windows / macOS |
| 企业资料质量差 | missing_fields + 人工补充 |
| 结构化事实抽取不准 | source_quote + confidence + 人工确认 |
| 文章仍有幻觉 | article-review + unsupported_claims + 人工编辑 |
| AI 可见性检测不稳定 | 多次检测、多问题检测、记录置信度 |
| 反思规则误学习 | 候选规则必须人工确认 |
| 发稿 API 失败 | 发布状态、重试、错误日志 |

## 19.2 后续扩展

1. 支持 LanceDB 或远程向量库。
2. 支持项目级反思规则。
3. 支持自动定时可见性检测。
4. 支持云端同步和团队协作。
5. 支持多平台发布效果对比。
6. 支持行业模板市场。
7. 支持内容版本 A/B 测试。

---

# 20. 附录：Skill 示例

## 20.1 knowledge-base-ingest / SKILL.md

```markdown
---
name: knowledge-base-ingest
description: 解析用户上传或粘贴的企业资料，抽取高精度结构化事实，用于建立 GEO 本地企业档案。
visibility: user
platforms: [doubao, deepseek]
task_type: knowledge_extraction
network_mode: none
output_contract: knowledge_draft
---

# 技能：企业知识库事实抽取

## 1. 任务目标

你的任务是阅读用户提供的企业原始资料，包括公司简介、官网文字、产品手册、案例资料、宣传资料等，以严谨、客观的态度抽取企业事实。

绝对不允许编造、夸大、虚构或推导任何原文中没有明确依据的信息。

## 2. 输出原则

每个字段必须包含：

- value：抽取出的事实内容。若原文未提及，使用 null 或 []。
- source_quote：对应原文片段，必须尽量与原文一致。
- confidence：0.0 到 1.0。
- status：extracted、needs_review。

数组字段中的每个项目应尽量单独包含 source_quote 和 confidence。

派生字段必须使用 is_derived: true，并说明 derived_from，不得伪装成原文事实。

## 3. 字段清单

### 3.1 原文事实字段

- company_name：资料中明确出现的企业、品牌或门店主体名称。
- legal_name：工商注册全称，仅当原文明确出现时抽取。
- short_name：品牌、门店或公司简称。
- detailed_address：详细经营地址。
- business_regions：业务服务区域。
- industry_category：所属行业分类。
- offerings：产品、服务、工艺、解决方案。
- associated_brands：关联品牌，并标明关系类型。
- target_audiences：目标客户或适用人群。
- core_advantages：核心差异化优势。
- trust_endorsements：信任背书、资质、奖项、成立年限。
- user_pain_points：用户痛点与对应解决方案。
- proven_cases：客户案例或合作项目。
- contact_info：电话、微信、客服热线等。

### 3.2 派生字段

- extracted_keywords：原文中直接出现的高频关键词。
- derived_target_keywords：基于地区、行业、服务、主体组合出的目标关键词。

### 3.3 风险字段

- risk_warnings：风险提示，例如无证据排名、疑似授权风险、绝对化表达风险。
- missing_fields：缺失字段。
- warnings：抽取过程中的其他提醒。

## 4. 特别约束

- 不把文件名当公司名。
- 不输出旧字段：main_business、products_services、cases、customer_service_phone、industry。
- main_business 与 products_services 的语义统一进入 offerings。
- 当 source_quote 为 null 且不是 derived 字段时，confidence 不得高于 0.4。
- 当字段需要人工复核时，status 设置为 needs_review。

## 5. 输出格式

仅输出 JSON，不要输出解释性文字。

```json
{
  "profile": {
    "company_name": {
      "value": "",
      "source_quote": "",
      "confidence": 1.0,
      "status": "extracted"
    },
    "legal_name": {
      "value": null,
      "source_quote": null,
      "confidence": 0.0,
      "status": "needs_review"
    },
    "offerings": {
      "value": [
        {
          "text": "",
          "source_quote": "",
          "confidence": 1.0
        }
      ],
      "status": "extracted"
    },
    "associated_brands": {
      "value": [
        {
          "brand": "",
          "relationship": "authorized_dealer | partner | supplier | used_brand | mentioned_only | unknown",
          "source_quote": "",
          "confidence": 1.0
        }
      ],
      "status": "extracted"
    },
    "derived_target_keywords": {
      "value": [],
      "is_derived": true,
      "derived_from": ["business_regions", "industry_category", "offerings"],
      "confidence": 0.75,
      "status": "extracted"
    }
  },
  "risk_warnings": [],
  "missing_fields": [],
  "warnings": []
}
```
```

## 20.2 article-generate / SKILL.md 摘要

```markdown
---
name: article-generate
description: 基于企业事实、RAG 片段、GEO 问题、SEO/E-E-A-T 和合规规则生成文章。
task_type: content_generation
output_contract: article_draft
---

# 技能：GEO 文章生成

你必须基于输入的企业事实、知识库片段和规则生成文章。

禁止：

- 编造企业事实。
- 编造案例、资质、荣誉、排名。
- 使用第一、唯一、最好、首选、顶级等绝对化表达。
- 将派生关键词当作原文事实。
- 使用没有来源的行业排名。

文章必须：

- 开头直接回答核心问题。
- 包含摘要、核心结论、事实依据、正文、FAQ、免责声明。
- 保持企业实体名称一致。
- 符合 SEO、E-E-A-T、AI 检索友好结构。
- 输出 claims、unsupported_claims、risk_words。
```

## 20.3 reflection-generate / SKILL.md 摘要

```markdown
---
name: reflection-generate
description: 根据可见性检测结果总结候选 GEO 反思规则。
task_type: reflection
output_contract: reflection_rule_candidates
---

# 技能：GEO 反思规则生成

你的任务是分析已发布文章是否被 AI 引用，并从被引用文章中总结可能有效的规则。

注意：被 AI 引用不等于文章质量一定优秀，必须同时考虑标题、结构、渠道、问题匹配度、FAQ、事实依据和引用位置。

候选规则必须明确：

- scope：global 或 industry。
- target_stage：作用阶段。
- rule_type：规则类型。
- content：规则内容。
- evidence：证据。
- confidence：置信度。
- status：candidate。

不得自动将候选规则设置为 active。
```

---

# 结论

v1.3 方案将 GEO Agent 明确为：

```text
事实库 + 向量库 + Skills 规则库 + 反思规则库 + 人工确认发布
```

其中：

- SQLite + sqlite-vec 负责本地向量检索。
- SQLite 业务表负责企业事实、工作流、发布记录、反思规则。
- DeepAgents.js Skills 负责知识抽取、问题生成、文章生成、文章审核、反思规则。
- 人工确认机制负责企业事实确认、文章确认、发布确认、反思规则确认。

该方案优先保证 MVP 可落地、可恢复、可验证、可控风险，同时保留后续扩展到更复杂 GEO 自动化系统的空间。
