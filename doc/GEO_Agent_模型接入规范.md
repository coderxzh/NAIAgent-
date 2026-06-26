# GEO Agent 模型接入规范 v1.0

本文档统一描述 GEO Agent 中所有外部模型 Provider 的接入方式，包括豆包、DeepSeek 以及豆包 Embedding。阅读本文档前，建议先阅读 [GEO_Agent_开发文档.md](GEO_Agent_开发文档.md) 了解整体架构。

---

## 1. 总体原则

### 1.1 Provider 分工

```text
豆包          = GEO Target Model       面向豆包生态的 GEO 能力
DeepSeek      = Agent Runtime Utility Model   内部 Agent 任务辅助
豆包 Embedding = 本地知识库向量化
```

| Provider | 承担任务 |
| --- | --- |
| 豆包 | 信源发现、文章生成、GEO 风格复核、豆包助手可见性检查、反思验证 |
| DeepSeek | 企业事实抽取、对话摘要、上下文压缩、Agent 规划辅助、Claim 初筛、反思候选生成 |
| 豆包 Embedding | 企业知识库 chunk 向量化、检索 |

### 1.2 统一抽象

所有 Provider 调用都通过统一的 `ModelRoute` 和 `AssistantStreamEvent` 抽象，避免业务层直接拼接各家 API 字段。

```typescript
type ProviderApiMode =
  | 'responses'          // 豆包文本生成、豆包助手 doubao_app
  | 'chat_completions'   // DeepSeek
  | 'embeddings';        // 豆包 Embedding
```

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

### 1.3 API 选择

| 能力 | Provider | 官方 API |
| --- | --- | --- |
| 豆包文本生成 | 豆包 | Responses API |
| 豆包助手联网搜索 | 豆包 | Responses API + `doubao_app` tool |
| 豆包 Embedding | 豆包 | Ark Embeddings API |
| DeepSeek 全部任务 | DeepSeek | Chat Completions API |

**不使用：**

- 豆包 Bot API / `DOUBAO_ASSISTANT_APP_ID` / `DOUBAO_ASSISTANT_BOT_ID`
- DeepSeek Responses API
- Web Search 插件替代 `doubao_app`
- `doubao_app` 与 Function Calling 混用

---

## 2. 环境变量总览

### 2.1 通用配置

```env
# 项目默认模型标识，Model Router 可覆盖
DOUBAO_MODEL=doubao-seed-2-0-lite-260428
DEEPSEEK_DEFAULT_MODEL=deepseek-v4-pro
DEEPSEEK_FAST_MODEL=deepseek-v4-flash
DEEPSEEK_PRO_MODEL=deepseek-v4-pro
```

### 2.2 豆包

```env
ARK_API_KEY=your_ark_api_key
ARK_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

DOUBAO_API_MODE=responses
DOUBAO_THINKING_TYPE=disabled
DOUBAO_REASONING_EFFORT=medium

DOUBAO_RESPONSES_TIMEOUT_MS=60000
DOUBAO_RESPONSES_STREAM_FIRST_TOKEN_TIMEOUT_MS=30000
DOUBAO_RESPONSES_STREAM_TOTAL_TIMEOUT_MS=180000
DOUBAO_RESPONSES_MAX_RETRIES=1

DOUBAO_ASSISTANT_ENABLED=true
DOUBAO_ASSISTANT_BETA_HEADER=true
DOUBAO_ASSISTANT_TOOL_TYPE=doubao_app
DOUBAO_VISIBILITY_MODE=ai_search
DOUBAO_VISIBILITY_DEEP_MODE=reasoning_search
DOUBAO_ASSISTANT_DEFAULT_FEATURE=ai_search
DOUBAO_ASSISTANT_ROLE_DESCRIPTION=你是 GEO 可见性检测助手，负责联网搜索并判断目标文章是否被检索、提及或引用。
```

不需要配置：

```env
DOUBAO_ASSISTANT_APP_ID=
DOUBAO_ASSISTANT_BOT_ID=
```

### 2.3 DeepSeek

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com

DEEPSEEK_THINKING_ENABLED=true
DEEPSEEK_REASONING_EFFORT=high

DEEPSEEK_TIMEOUT_MS=90000
DEEPSEEK_THINKING_TIMEOUT_MS=180000
DEEPSEEK_MAX_RETRIES=1

DEEPSEEK_JSON_OUTPUT_ENABLED=true
DEEPSEEK_TOOL_CALLS_ENABLED=true
DEEPSEEK_STRICT_TOOL_MODE=false
```

### 2.4 Embedding

```env
ARK_EMBEDDING_PROVIDER=doubao
ARK_EMBEDDING_MODEL=your-ark-embedding-endpoint
ARK_EMBEDDING_DIMENSIONS=2048
ARK_EMBEDDING_ENABLE_INSTRUCTIONS=true

ARK_EMBEDDING_QUERY_INSTRUCTIONS=Target_modality: text. Instruction: Represent the user query for retrieving relevant enterprise knowledge chunks.
ARK_EMBEDDING_CORPUS_INSTRUCTIONS=Target_modality: text. Instruction: Represent this enterprise knowledge chunk for retrieval by user questions.
```

> 注意：`ARK_EMBEDDING_MODEL` 应替换为实际 Ark Embedding 接入点 ID，不要硬编码具体 endpoint。

---

## 3. Model Router

### 3.1 ProviderApiMode

```typescript
type ProviderApiMode =
  | 'responses'          // 豆包
  | 'chat_completions'   // DeepSeek
  | 'embeddings';        // 豆包 Embedding
```

### 3.2 路由表

```typescript
export const DOUBAO_MODEL_ROUTES = {
  source_discovery: {
    provider: 'doubao',
    apiMode: 'responses',
    model: process.env.DOUBAO_MODEL,
    stream: false,
    skill: 'source-discovery',
    responseFormat: 'json_schema',
  },

  article_generation: {
    provider: 'doubao',
    apiMode: 'responses',
    model: process.env.DOUBAO_MODEL,
    stream: true,
    skill: 'article-generation',
    responseFormat: 'text',
  },

  geo_style_review: {
    provider: 'doubao',
    apiMode: 'responses',
    model: process.env.DOUBAO_MODEL,
    stream: false,
    skill: 'geo-review',
    responseFormat: 'json_schema',
  },

  visibility_check: {
    provider: 'doubao',
    apiMode: 'responses',
    model: process.env.DOUBAO_MODEL,
    stream: true,
    skill: 'visibility-check',
    toolType: 'doubao_app',
    doubaoAppFeature: 'ai_search',
  },

  reflection_validation: {
    provider: 'doubao',
    apiMode: 'responses',
    model: process.env.DOUBAO_MODEL,
    stream: false,
    skill: 'reflection-validation',
    responseFormat: 'json_schema',
  },

  embedding: {
    provider: 'doubao',
    apiMode: 'embeddings',
    model: process.env.ARK_EMBEDDING_MODEL,
    stream: false,
  },
} as const;

export const DEEPSEEK_MODEL_ROUTES = {
  fact_extraction: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_PRO_MODEL,
    stream: false,
    thinking: true,
    reasoningEffort: 'high',
    responseFormat: 'json_object',
    promptVersion: 'fact-extraction.deepseek',
  },

  memory_summary: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_FAST_MODEL,
    stream: false,
    thinking: false,
    responseFormat: 'text',
    promptVersion: 'memory-summary.deepseek',
  },

  context_compression: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_FAST_MODEL,
    stream: false,
    thinking: false,
    responseFormat: 'json_object',
    promptVersion: 'context-compression.deepseek',
  },

  agent_planning: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_PRO_MODEL,
    stream: true,
    thinking: true,
    reasoningEffort: 'high',
    responseFormat: 'json_object',
    promptVersion: 'agent-planning.deepseek',
  },

  claim_review: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_PRO_MODEL,
    stream: false,
    thinking: true,
    reasoningEffort: 'high',
    responseFormat: 'json_object',
    promptVersion: 'claim-review.deepseek',
  },

  reflection_candidate: {
    provider: 'deepseek',
    apiMode: 'chat_completions',
    model: process.env.DEEPSEEK_PRO_MODEL,
    stream: false,
    thinking: true,
    reasoningEffort: 'high',
    responseFormat: 'json_object',
    promptVersion: 'reflection-candidate.deepseek',
  },
} as const;
```

---

## 4. 豆包接入

### 4.1 能力矩阵

| 能力 | API | 用途 |
| --- | --- | --- |
| source_discovery | Responses API | 判断哪些信源更适合被豆包联网搜索发现 |
| article_generation | Responses API stream | 生成 GEO 文章 |
| geo_style_review | Responses API | 复核文章是否适合豆包理解和引用 |
| visibility_check | Responses API + `doubao_app` | 检测文章是否被提及或引用 |
| reflection_validation | Responses API | 验证优化假设是否合理 |
| embedding | Embeddings API | 本地知识库检索 |

### 4.2 Responses API 非流式调用

```bash
curl https://ark.cn-beijing.volces.com/api/v3/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seed-2-0-lite-260428",
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": "请基于以下企业事实生成 5 个用户可能会问的 GEO 核心问题。"
          }
        ]
      }
    ],
    "stream": false
  }'
```

适用于：信源发现、GEO 风格复核、反思验证、短文本生成、结构化规划。

### 4.3 Responses API 流式调用

```bash
curl https://ark.cn-beijing.volces.com/api/v3/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "doubao-seed-2-0-lite-260428",
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": "请生成一篇面向 AI 搜索引用的企业服务介绍文章。"
          }
        ]
      }
    ],
    "stream": true
  }'
```

内部链路：

```text
Doubao Responses stream
  ↓
doubaoResponsesStreamParser
  ↓
AssistantStreamEvent
  ↓
assistant_stream_events
  ↓
AI Elements
```

### 4.4 结构化输出

Skill 的 `output.schema.json` 由 provider mapper 转成官方 `response_format` / `json_schema` 字段，业务层不直接拼接 provider 字段。

```json
{
  "model": "doubao-seed-2-0-lite-260428",
  "input": [
    {
      "role": "user",
      "content": [
        {
          "type": "input_text",
          "text": "请生成 5 个 GEO 核心问题，并以 JSON 输出。"
        }
      ]
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "geo_questions_output",
      "schema": {
        "type": "object",
        "properties": {
          "questions": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "question": { "type": "string" },
                "intent": { "type": "string" },
                "priority": { "type": "number" }
              },
              "required": ["question", "intent", "priority"]
            }
          }
        },
        "required": ["questions"]
      }
    }
  }
}
```

适用于：source_discovery、geo_review、reflection_validation、publish_plan。

### 4.5 豆包助手与可见性检查

默认可见性检查：

```text
Responses API + doubao_app tool + ai_search
```

深度可见性分析：

```text
Responses API + doubao_app tool + reasoning_search
```

`ai_search` 请求示例：

```bash
curl https://ark.cn-beijing.volces.com/api/v3/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -H "ark-beta-doubao-app: true" \
  -d '{
    "model": "doubao-seed-2-0-lite-260428",
    "stream": true,
    "tools": [
      {
        "type": "doubao_app",
        "feature": {
          "ai_search": {
            "type": "enabled",
            "role_description": "你是 GEO 可见性检测助手，负责联网搜索并判断目标文章是否被检索、提及或引用。"
          },
          "chat": { "type": "disabled" },
          "deep_chat": { "type": "disabled" },
          "reasoning_search": { "type": "disabled" }
        },
        "user_location": {
          "type": "approximate",
          "country": "中国",
          "region": "浙江",
          "city": "杭州"
        }
      }
    ],
    "input": [
      {
        "role": "user",
        "content": [
          {
            "type": "input_text",
            "text": "请联网搜索并判断以下文章 URL 是否被提及或引用：https://example.com/article"
          }
        ]
      }
    ]
  }'
```

本地入库流程：

```text
Responses API + doubao_app + ai_search
  ↓
解析搜索事件和输出文本
  ↓
本地判断 mentioned / cited / citation_urls
  ↓
写入 visibility_checks
  ↓
写入 reflection_hypothesis_evidence
```

可见性检查结果**不得**通过 Function Calling 入库。

### 4.6 Embedding API

文本向量化：

```text
POST https://ark.cn-beijing.volces.com/api/v3/embeddings
```

```bash
curl https://ark.cn-beijing.volces.com/api/v3/embeddings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ARK_API_KEY" \
  -d '{
    "model": "your-ark-embedding-endpoint",
    "input": [
      "杭州某某科技有限公司提供企业网站建设、AI 内容优化和本地 SEO 服务。"
    ]
  }'
```

多模态向量化用于未来扩展图片、视频和文本统一语义检索：

```text
POST https://ark.cn-beijing.volces.com/api/v3/embeddings/multimodal
```

当前项目主要使用文本向量化；如果接入点是多模态模型，由 `DoubaoEmbeddingProvider` 根据模型能力选择 endpoint。

Query / Corpus instructions：

```text
Query instructions:
Target_modality: text. Instruction: Represent the user query for retrieving relevant enterprise knowledge chunks.

Corpus instructions:
Target_modality: text. Instruction: Represent this enterprise knowledge chunk for retrieval by user questions.
```

如果接入点不支持 instructions，代码自动降级为不传。

### 4.7 TypeScript Client

```typescript
export type DoubaoResponseInput = {
  model: string;
  input: unknown;
  instructions?: string;
  stream?: boolean;
  previousResponseId?: string;
  responseFormat?: unknown;
  tools?: unknown[];
  metadata?: Record<string, unknown>;
  extraHeaders?: Record<string, string>;
  signal?: AbortSignal;
};

export class DoubaoResponsesClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = 'https://ark.cn-beijing.volces.com/api/v3',
  ) {}

  async createResponse(input: DoubaoResponseInput) {
    const body: Record<string, unknown> = {
      model: input.model,
      input: input.input,
      stream: input.stream ?? false,
    };

    if (input.instructions) body.instructions = input.instructions;
    if (input.previousResponseId) body.previous_response_id = input.previousResponseId;
    if (input.responseFormat) body.response_format = input.responseFormat;
    if (input.tools) body.tools = input.tools;
    if (input.metadata) body.metadata = input.metadata;

    const response = await fetch(`${this.baseUrl}/responses`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
        ...(input.extraHeaders ?? {}),
      },
      body: JSON.stringify(body),
      signal: input.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doubao Responses API error ${response.status}: ${errorText}`);
    }

    return response;
  }
}
```

```typescript
export type EmbeddingInput = {
  texts: string[];
  inputType: 'query' | 'corpus';
};

export class DoubaoEmbeddingProvider {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = 'https://ark.cn-beijing.volces.com/api/v3',
    private readonly model = process.env.ARK_EMBEDDING_MODEL!,
  ) {}

  async embed(input: EmbeddingInput): Promise<number[][]> {
    const instructions =
      input.inputType === 'query'
        ? process.env.ARK_EMBEDDING_QUERY_INSTRUCTIONS
        : process.env.ARK_EMBEDDING_CORPUS_INSTRUCTIONS;

    const body: Record<string, unknown> = {
      model: this.model,
      input: input.texts,
    };

    if (process.env.ARK_EMBEDDING_ENABLE_INSTRUCTIONS === 'true' && instructions) {
      body.instructions = instructions;
    }

    const response = await fetch(`${this.baseUrl}/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Doubao Embedding API error ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    return json.data.map((item: any) => item.embedding);
  }
}
```

### 4.8 注意事项与当前限制

> 以下限制来自豆包 Responses API 当前行为，可能随官方更新而变化，接入时应以最新官方文档为准。

```text
1. 单次只能开启一个 doubao_app feature。
2. doubao_app 不能和 Function Calling 混用。
3. doubao_app 不能和 Web Search / Knowledge Search / MCP 混用。
4. role_description 与 instructions / system prompt 互斥。
5. store 不保存 tools，每轮请求都要重新传 tools。
```

---

## 5. DeepSeek 接入

### 5.1 能力矩阵

| 任务 | 推荐模型 | 流式 | 输出 |
| --- | --- | ---: | --- |
| 企业事实抽取 | deepseek-v4-pro | 否 | JSON |
| 对话摘要 | deepseek-v4-flash | 否 | Text |
| 上下文压缩 | deepseek-v4-flash | 否 | JSON |
| Agent 规划辅助 | deepseek-v4-pro | 可选 | JSON |
| Claim 初筛审核 | deepseek-v4-pro | 否 | JSON |
| 反思候选生成 | deepseek-v4-pro | 否 | JSON |
| 内部长任务说明 | deepseek-v4-pro | 可选 | Stream text |

### 5.2 Chat Completions 非流式调用

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {
        "role": "system",
        "content": "你是 GEO Agent 的企业事实抽取助手。"
      },
      {
        "role": "user",
        "content": "请从以下文本中提取企业名称、服务、优势和联系方式：杭州某某科技有限公司提供企业网站建设、AI 内容优化和本地 SEO 服务，联系电话 13800000000。"
      }
    ],
    "stream": false
  }'
```

适用于：企业事实抽取、对话摘要、上下文压缩、Claim 初筛、反思候选生成。

### 5.3 Chat Completions 流式调用

```bash
curl https://api.deepseek.com/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $DEEPSEEK_API_KEY" \
  -d '{
    "model": "deepseek-v4-pro",
    "messages": [
      {
        "role": "user",
        "content": "请分步骤分析 GEO Agent 的 Assistant Runtime 应该如何设计。"
      }
    ],
    "stream": true
  }'
```

适用于：智能 Agent 页面、Agent 规划解释、长任务实时输出、内部分析任务。

内部链路：

```text
DeepSeek Chat Completions stream
  ↓
deepseekStreamParser
  ↓
AssistantStreamEvent
  ↓
assistant_stream_events
  ↓
AI Elements
```

### 5.4 Thinking Mode

DeepSeek thinking mode 可能返回 `reasoning_content` 和 `content`。

项目规则：

```text
reasoning_content 不直接展示给用户
reasoning_content 可用于内部日志、调试或生成 reasoning_step 摘要
前端只展示可审计的 reasoning_step 摘要
```

TypeScript 示例：

```typescript
const response = await fetch('https://api.deepseek.com/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: process.env.DEEPSEEK_PRO_MODEL,
    messages: [
      {
        role: 'user',
        content: '请判断这篇文章的核心 claims 是否都有企业资料依据。',
      },
    ],
    thinking: { type: 'enabled' },
    reasoning_effort: process.env.DEEPSEEK_REASONING_EFFORT || 'high',
    stream: false,
  }),
});

const json = await response.json();
const message = json.choices[0].message;
const reasoningContent = message.reasoning_content;
const finalContent = message.content;
```

### 5.5 JSON Output

DeepSeek JSON Output 使用：

```json
{
  "response_format": {
    "type": "json_object"
  }
}
```

注意：

- Prompt 中仍然要明确要求只输出 JSON。
- 本地仍然要做 Zod / JSON Schema 校验。
- `max_tokens` 要足够，避免 JSON 被截断。

### 5.6 Tool Calls

DeepSeek Tool Calls 原则：

```text
模型只返回工具名和参数
工具实际执行必须由 GEO Agent 本地 Runtime 完成
高风险工具必须进入 ToolPolicy + tool_approvals
工具结果需要回填给模型
```

### 5.7 TypeScript Client

```typescript
export type DeepSeekChatMessage = {
  role: 'system' | 'user' | 'assistant' | 'tool';
  content?: string | null;
  reasoning_content?: string;
  tool_call_id?: string;
  tool_calls?: unknown[];
};

export type DeepSeekChatOptions = {
  model: string;
  messages: DeepSeekChatMessage[];
  stream?: boolean;
  tools?: unknown[];
  tool_choice?: 'none' | 'auto' | 'required' | unknown;
  response_format?: { type: 'json_object' };
  reasoning_effort?: 'low' | 'medium' | 'high';
  thinking?: { type: 'enabled' | 'disabled' };
  max_tokens?: number;
  signal?: AbortSignal;
};

export class DeepSeekClient {
  constructor(
    private readonly apiKey: string,
    private readonly baseUrl = 'https://api.deepseek.com',
  ) {}

  async createChatCompletion(options: DeepSeekChatOptions) {
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(options),
      signal: options.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`DeepSeek API error ${response.status}: ${errorText}`);
    }

    return response.json();
  }
}
```

### 5.8 注意事项

- DeepSeek `/chat/completions` 是无状态接口，需要客户端拼接上下文。
- Context Cache 仅用于成本优化，不作为 GEO Agent 状态源。
- `reasoning_content` 不适合直接展示给用户。

---

## 6. 统一流式事件映射

### 6.1 AssistantStreamEvent 统一类型

```typescript
type AssistantStreamEvent =
  | { type: 'message_start'; messageId: number; runId?: number; requestId: string }
  | { type: 'text_delta'; messageId: number; delta: string }
  | { type: 'reasoning_step_delta'; messageId: number; delta: string }
  | { type: 'reasoning_step'; stepId: string; title: string; content: string; status: string }
  | { type: 'tool_call_requested'; toolCallId: number; toolName: string; argumentsPreview: unknown; approvalRequired: boolean }
  | { type: 'approval_requested'; approvalId: number; toolCallId: number; title: string; description?: string }
  | { type: 'tool_call_result'; toolCallId: number; resultSummary: string }
  | { type: 'queue_item_updated'; item: AssistantQueueItem }
  | { type: 'message_completed'; messageId: number }
  | { type: 'message_interrupted'; messageId: number; reason: string }
  | { type: 'error'; errorId?: number; message: string; recoverable: boolean; retryable: boolean };
```

### 6.2 豆包 stream 事件映射

```text
response_doubao_app_call_search_searching          → search_progress
response_doubao_app_call_search_completed          → search_completed
response_doubao_app_call_reasoning_search_completed → reasoning_search_completed
response_doubao_app_call_output_text_delta         → text_delta
response_doubao_app_call_output_text_done          → message_text_done
response_doubao_app_call_reasoning_text_delta      → reasoning_step_delta
response_doubao_app_call_reasoning_text_done       → reasoning_step_completed
```

### 6.3 DeepSeek stream 事件映射

```typescript
export function mapDeepSeekDeltaToAssistantEvent(
  chunk: any,
  messageId: number,
): AssistantStreamEvent[] {
  const events: AssistantStreamEvent[] = [];
  const delta = chunk?.choices?.[0]?.delta;

  if (!delta) return events;

  if (delta.reasoning_content) {
    events.push({
      type: 'reasoning_step_delta',
      messageId,
      delta: delta.reasoning_content,
    });
  }

  if (delta.content) {
    events.push({
      type: 'text_delta',
      messageId,
      delta: delta.content,
    });
  }

  const finishReason = chunk?.choices?.[0]?.finish_reason;
  if (finishReason === 'stop') {
    events.push({
      type: 'message_completed',
      messageId,
    });
  }

  return events;
}
```

---

## 7. 统一错误处理与重试

### 7.1 错误分类

```text
TransientError：临时错误，可重试
PermanentError：永久错误，不重试
ValidationError：结果不符合预期，可有限修复
PermissionError：权限问题，不重试，提示用户
ApprovalRejected：用户拒绝，不重试，重新规划
ExternalUnknownState：外部状态未知，不立即重试，先查询状态
```

### 7.2 错误码对照

| Provider | 错误码 | 含义 |
| --- | --- | --- |
| 豆包 | 401 | API Key 错误 |
| 豆包 | 403 | 权限不足或服务未开通 |
| 豆包 | 429 | 频率限制 |
| 豆包 | 5xx | 服务端错误 |
| DeepSeek | 400 | 请求格式错误 |
| DeepSeek | 401 | API Key 错误 |
| DeepSeek | 402 | 余额不足 |
| DeepSeek | 422 | 参数错误 |
| DeepSeek | 429 | 速率限制 |
| DeepSeek | 500 | 服务端错误 |
| DeepSeek | 503 | 服务繁忙 |

### 7.3 Timeout / Retry 矩阵

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

### 7.4 日志写入

错误与调用信息统一写入：

```text
app_errors
model_call_logs
assistant_stream_events
visibility_checks
```

---

## 8. 相关链接

- [DeepAgents 链接速查](DeepAgents链接速查.md)
- [GEO Agent 开发文档](GEO_Agent_开发文档.md)
