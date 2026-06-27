# 项目 1：架构分层整改 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 把 `electron/ipc/handlers.ts` 中 28 处直接 SQL 调用下沉到 Service 层，补齐 `agent/` 和 `assistant/` 核心 Service 空骨架，让 `geoAgentRuntime` 和 `geoAgentFactory` 走 Service 层，恢复 `CLAUDE.md` 约定的分层架构。

**Architecture:** 保持现有数据库 schema 和前端接口不变，新增 Project/KB/Fact/Chat/Agent/Assistant Service 文件承担业务逻辑与 SQL，Handler 仅负责参数校验和转发。Agent/Assistant Service 先达到"不抛 Error + 基本 CRUD"的最小可用状态，完整流式与治理逻辑留到后续项目。

**Tech Stack:** TypeScript, Electron, better-sqlite3, Zod, DeepAgents

## Global Constraints

- 不修改数据库 schema 和迁移文件。
- 不修改前端组件、`src/lib/electron-api.ts`、`electron/preload.ts`、IPC channels 定义。
- 不引入新的 npm 依赖。
- 保持现有错误响应格式，不破坏 Renderer。
- 每个任务独立可验证，任务完成后运行 `npm run lint`。
- 空骨架 Service 整改后至少提供基本 CRUD，不再无条件 `throw Error`。

---

## File Map

### 新建文件

| 文件 | 职责 |
|------|------|
| `electron/services/projectService.ts` | project CRUD，被 `project:*` Handler 和 `geoAgentFactory` 工具调用 |
| `electron/services/kbService.ts` | knowledge_entries 录入、索引、搜索、facts 查询/更新 |
| `electron/services/facts/factService.ts` | fact CRUD + 缺失字段（当前 `fact:extract/list/confirm/reject/modifyAndConfirm` 已走独立 Service，本任务只承接 `kb:facts` 和 `kb:factsUpdate`） |
| `electron/services/chat/chatService.ts` | chat_messages 按 session 查询 |
| `electron/services/agent/taskStateManager.ts` | agent_tasks / steps CRUD |
| `electron/services/agent/executionLedger.ts` | execution_ledger 只追加写入 |
| `electron/services/agent/artifactManager.ts` | agent_artifacts CRUD |
| `electron/services/assistant/assistantRunService.ts` | assistant_runs CRUD |
| `electron/services/assistant/toolApprovalService.ts` | tool_approvals CRUD |
| `electron/services/assistant/assistantQueueService.ts` | assistant_queue_items CRUD |

### 修改文件

| 文件 | 整改内容 |
|------|----------|
| `electron/ipc/handlers.ts` | 所有业务 SQL 改为调用 Service；保留 `db:query`、`db:exec`、`db:vectorSearch`、窗口、dialog 等通用 Handler |
| `electron/services/agent/geoAgentFactory.ts` | `projectListTool` / `projectCreateTool` 改为调用 `projectService.ts` |
| `electron/services/agent/geoAgentRuntime.ts` | 任务/步骤/产物/ledger 写入改为调用 Service 层 |

---

## Task 1: Create `projectService.ts`

**Files:**
- Create: `electron/services/projectService.ts`
- Modify: `electron/ipc/handlers.ts:139-194`

**Interfaces:**
- Consumes: `ProjectCreateSchema`, `ProjectUpdateSchema`, `ProjectIdSchema` from `electron/ipc/schemas.ts`; `Project` from `@/types/domain`; `getDb` from `electron/db/connection.ts`.
- Produces:
  - `createProject(data: {name: string; description?: string; industry?: string; region?: string}): Project`
  - `listProjects(): Project[]`
  - `getProject(id: number): Project | null`
  - `updateProject(id: number, data: Partial<Project>): void`
  - `deleteProject(id: number): void`

- [ ] **Step 1: Create the service file**

Create `electron/services/projectService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {Project} from '@/types/domain';

export function createProject(data: {
  name: string;
  description?: string;
  industry?: string;
  region?: string;
}): Project {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO projects (name, description, industry, region, status, created_at, updated_at) VALUES (?, ?, ?, ?, 'active', datetime('now'), datetime('now'))",
    )
    .run(data.name, data.description ?? null, data.industry ?? null, data.region ?? null);
  return db.prepare('SELECT * FROM projects WHERE id = ?').get(Number(result.lastInsertRowid)) as Project;
}

export function listProjects(): Project[] {
  const db = getDb();
  return db.prepare('SELECT * FROM projects ORDER BY updated_at DESC').all() as Project[];
}

export function getProject(id: number): Project | null {
  const db = getDb();
  return (
    (db.prepare('SELECT * FROM projects WHERE id = ?').get(id) as Project | undefined) ?? null
  );
}

export function updateProject(id: number, data: Partial<Project>): void {
  const db = getDb();
  const allowed = ['name', 'description', 'industry', 'region', 'status'] as const;
  const fields: string[] = [];
  const params: unknown[] = [];
  for (const key of allowed) {
    if (key in data) {
      fields.push(`${key} = ?`);
      params.push(data[key]);
    }
  }
  if (fields.length === 0) return;
  fields.push("updated_at = datetime('now')");
  params.push(id);
  db.prepare(`UPDATE projects SET ${fields.join(', ')} WHERE id = ?`).run(...params);
}

export function deleteProject(id: number): void {
  const db = getDb();
  db.prepare('DELETE FROM projects WHERE id = ?').run(id);
}
```

- [ ] **Step 2: Update handlers to call the service**

In `electron/ipc/handlers.ts`:

1. Add import near the top:

```typescript
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../services/projectService.ts';
```

2. Replace the `project:*` handlers (lines 139-194) with:

```typescript
  createHandler('project:create', (data) => {
    const validated = ProjectCreateSchema.parse(data);
    return createProject(validated);
  });

  createHandler('project:list', () => listProjects());

  createHandler('project:get', (id) => {
    const validated = ProjectIdSchema.parse(id);
    return getProject(validated);
  });

  createHandler('project:update', (id, data) => {
    const validatedId = ProjectIdSchema.parse(id);
    ProjectUpdateSchema.parse({id: validatedId, data});
    updateProject(validatedId, data);
  });

  createHandler('project:delete', (id) => {
    const validated = ProjectIdSchema.parse(id);
    deleteProject(validated);
  });
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add electron/services/projectService.ts electron/ipc/handlers.ts
git commit -m "refactor: move project SQL from handler to projectService"
```

---

## Task 2: Create `kbService.ts`

**Files:**
- Create: `electron/services/kbService.ts`
- Modify: `electron/ipc/handlers.ts:196-247`

**Interfaces:**
- Consumes: `KbIngestTextSchema`, `KbIngestFileSchema`, `KbIndexEntrySchema`, `KbSearchSchema`, `ProjectIdSchema`, `KbFactsUpdateSchema` from schemas; `indexEntry` from `indexingService.ts`; `embedText` from `embedding.ts`; `searchSimilarChunks` from `vectorStore.ts`; `EnterpriseFact`, `IndexingResult` from `@/types/domain`.
- Produces:
  - `ingestText(params: {projectId: number; title: string; content: string}): Promise<IndexingResult>`
  - `ingestFile(params: {projectId: number; title: string; filePath: string}): Promise<IndexingResult>`
  - `indexEntry(entryId: number): Promise<IndexingResult>`
  - `search(params: {projectId: number; query: string; limit?: number}): Promise<KnowledgeSearchResult[]>` (use existing local interface in channels.ts or import `KnowledgeSearchResult` from domain if available)
  - `listFacts(projectId: number): EnterpriseFact[]`
  - `updateFactStatus(id: number, status: EnterpriseFact['status']): void`

- [ ] **Step 1: Create the service file**

Create `electron/services/kbService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import {indexEntry} from './indexingService.ts';
import {embedText} from './embedding.ts';
import {searchSimilarChunks} from './vectorStore.ts';
import type {EnterpriseFact, IndexingResult} from '@/types/domain';
import type {KnowledgeSearchResult} from '../ipc/channels.ts';

export async function ingestText(params: {
  projectId: number;
  title: string;
  content: string;
}): Promise<IndexingResult> {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO knowledge_entries (project_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
    )
    .run(params.projectId, params.title, params.content, 'text', null, 'pending');
  return indexEntry(Number(result.lastInsertRowid));
}

export async function ingestFile(params: {
  projectId: number;
  title: string;
  filePath: string;
}): Promise<IndexingResult> {
  const db = getDb();
  const result = db
    .prepare(
      "INSERT INTO knowledge_entries (project_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
    )
    .run(params.projectId, params.title, null, 'file', params.filePath, 'pending');
  return indexEntry(Number(result.lastInsertRowid));
}

export async function indexKnowledgeEntry(entryId: number): Promise<IndexingResult> {
  return indexEntry(entryId);
}

export async function searchKnowledge(params: {
  projectId: number;
  query: string;
  limit?: number;
}): Promise<KnowledgeSearchResult[]> {
  const queryVector = await embedText(params.query);
  return searchSimilarChunks(params.projectId, queryVector, params.limit ?? 5);
}

export function listFacts(projectId: number): EnterpriseFact[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM enterprise_facts WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId) as EnterpriseFact[];
}

export function updateFactStatus(id: number, status: EnterpriseFact['status']): void {
  const db = getDb();
  db.prepare('UPDATE enterprise_facts SET status = ? WHERE id = ?').run(status, id);
}
```

- [ ] **Step 2: Update handlers**

In `electron/ipc/handlers.ts`:

1. Add import:

```typescript
import {
  ingestText,
  ingestFile,
  indexKnowledgeEntry,
  searchKnowledge,
  listFacts as listKbFacts,
  updateFactStatus,
} from '../services/kbService.ts';
```

2. Replace `kb:*` handlers (lines 196-247) with:

```typescript
  createHandler('kb:ingestText', async (params) => {
    const validated = KbIngestTextSchema.parse(params);
    return ingestText(validated);
  });

  createHandler('kb:ingestFile', async (params) => {
    const validated = KbIngestFileSchema.parse(params);
    return ingestFile(validated);
  });

  createHandler('kb:indexEntry', async (params) => {
    const validated = KbIndexEntrySchema.parse(params);
    return indexKnowledgeEntry(validated.entryId);
  });

  createHandler('kb:search', async (params) => {
    const validated = KbSearchSchema.parse(params);
    return searchKnowledge(validated);
  });

  createHandler('kb:facts', (projectId) => {
    const validated = ProjectIdSchema.parse(projectId);
    return listKbFacts(validated);
  });

  createHandler('kb:factsUpdate', (id, status) => {
    const validated = KbFactsUpdateSchema.parse({id, status});
    updateFactStatus(validated.id, validated.status);
  });
```

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add electron/services/kbService.ts electron/ipc/handlers.ts
git commit -m "refactor: move kb SQL from handler to kbService"
```

---

## Task 3: Create `facts/factService.ts`

**Files:**
- Create: `electron/services/facts/factService.ts`
- Modify: `electron/services/kbService.ts` (extract fact methods or keep as re-export from factService)

**Interfaces:**
- Consumes: `getDb`; `EnterpriseFact`.
- Produces:
  - `listFacts(projectId: number): EnterpriseFact[]`
  - `updateFactStatus(id: number, status: EnterpriseFact['status']): void`

- [ ] **Step 1: Move fact methods from kbService to factService**

Create `electron/services/facts/factService.ts`:

```typescript
import {getDb} from '../../db/connection.ts';
import type {EnterpriseFact} from '@/types/domain';

export function listFacts(projectId: number): EnterpriseFact[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM enterprise_facts WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId) as EnterpriseFact[];
}

export function updateFactStatus(id: number, status: EnterpriseFact['status']): void {
  const db = getDb();
  db.prepare('UPDATE enterprise_facts SET status = ? WHERE id = ?').run(status, id);
}
```

- [ ] **Step 2: Update kbService to re-export from factService**

In `electron/services/kbService.ts`, replace the local `listFacts` and `updateFactStatus` implementations with re-exports:

```typescript
export {listFacts, updateFactStatus} from './facts/factService.ts';
```

Remove the now-duplicated local functions and the `EnterpriseFact` import if no longer used.

- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add electron/services/facts/factService.ts electron/services/kbService.ts
git commit -m "refactor: move fact CRUD to factService and re-export from kbService"
```

---

## Task 4: Create `chat/chatService.ts`

**Files:**
- Create: `electron/services/chat/chatService.ts`
- Modify: `electron/ipc/handlers.ts:342-349`

**Interfaces:**
- Consumes: `getDb`; `ChatMessage`.
- Produces: `getSessionHistory(sessionId: number, limit?: number): ChatMessage[]`

- [ ] **Step 1: Create the service**

Create `electron/services/chat/chatService.ts`:

```typescript
import {getDb} from '../../db/connection.ts';
import type {ChatMessage} from '@/types/domain';

export function getSessionHistory(sessionId: number, limit = 50): ChatMessage[] {
  const db = getDb();
  return db
    .prepare(
      'SELECT * FROM chat_messages WHERE session_id = ? ORDER BY created_at DESC LIMIT ?',
    )
    .all(sessionId, limit) as ChatMessage[];
}
```

- [ ] **Step 2: Update handlers**

In `electron/ipc/handlers.ts`:

1. Add import:

```typescript
import {getSessionHistory} from '../services/chat/chatService.ts';
```

2. Replace `assistant:history` handler with:

```typescript
  createHandler('assistant:history', (sessionId, limit) => {
    const validated = AssistantHistorySchema.parse({sessionId, limit});
    return getSessionHistory(validated.sessionId, validated.limit ?? 50);
  });
```

- [ ] **Step 3: Run lint and commit**

```bash
npm run lint
git add electron/services/chat/chatService.ts electron/ipc/handlers.ts
git commit -m "refactor: move chat history SQL to chatService"
```

---

## Task 5: Implement `agent/taskStateManager.ts`

**Files:**
- Modify: `electron/services/agent/taskStateManager.ts`

**Interfaces:**
- Consumes: `getDb`; `AgentTask`, `AgentTaskStep`.
- Produces:
  - `loadTask(taskId: number): AgentTask | undefined`
  - `createTask(params: Partial<AgentTask>): AgentTask`
  - `updateTask(taskId: number, fields: Partial<AgentTask>): void`
  - `addTaskStep(taskId: number, step: Partial<AgentTaskStep>): AgentTaskStep`
  - `updateTaskStep(stepId: number, fields: Partial<AgentTaskStep>): void`
  - `getTaskSteps(taskId: number): AgentTaskStep[]`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/agent/taskStateManager.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {AgentTask, AgentTaskStep} from '@/types/domain';

export function loadTask(taskId: number): AgentTask | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM agent_tasks WHERE id = ?').get(taskId) as
    | AgentTask
    | undefined;
}

export function createTask(params: Partial<AgentTask>): AgentTask {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO agent_tasks (
         session_id, project_id, title, user_goal, status,
         risk_level, failure_count, loop_count, max_loop_count,
         created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
    )
    .run(
      params.session_id ?? null,
      params.project_id ?? null,
      params.title ?? null,
      params.user_goal ?? '',
      params.status ?? 'created',
      params.risk_level ?? 'low',
      params.failure_count ?? 0,
      params.loop_count ?? 0,
      params.max_loop_count ?? 12,
    );
  return db
    .prepare('SELECT * FROM agent_tasks WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as AgentTask;
}

export function updateTask(taskId: number, fields: Partial<AgentTask>): void {
  const db = getDb();
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  const setters = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  db.prepare(
    `UPDATE agent_tasks SET ${setters}, updated_at = datetime('now') WHERE id = ?`,
  ).run(...values, taskId);
}

export function addTaskStep(
  taskId: number,
  step: Partial<AgentTaskStep>,
): AgentTaskStep {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO agent_task_steps (
         task_id, parent_step_id, step_type, action_name, status,
         input_json, output_json, validation_json, error_id,
         attempt_count, max_attempts, started_at, completed_at, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      taskId,
      step.parent_step_id ?? null,
      step.step_type ?? 'plan',
      step.action_name ?? null,
      step.status ?? 'pending',
      step.input_json ?? null,
      step.output_json ?? null,
      step.validation_json ?? null,
      step.error_id ?? null,
      step.attempt_count ?? 0,
      step.max_attempts ?? 2,
      step.started_at ?? null,
      step.completed_at ?? null,
    );
  return db
    .prepare('SELECT * FROM agent_task_steps WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as AgentTaskStep;
}

export function updateTaskStep(
  stepId: number,
  fields: Partial<AgentTaskStep>,
): void {
  const db = getDb();
  const entries = Object.entries(fields).filter(([, v]) => v !== undefined);
  if (entries.length === 0) return;
  const setters = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) => v);
  db.prepare(
    `UPDATE agent_task_steps SET ${setters}, completed_at = COALESCE(completed_at, datetime('now')) WHERE id = ?`,
  ).run(...values, stepId);
}

export function getTaskSteps(taskId: number): AgentTaskStep[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM agent_task_steps WHERE task_id = ? ORDER BY created_at ASC')
    .all(taskId) as AgentTaskStep[];
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/agent/taskStateManager.ts
git commit -m "feat(agent): implement taskStateManager CRUD"
```

---

## Task 6: Implement `agent/executionLedger.ts`

**Files:**
- Modify: `electron/services/agent/executionLedger.ts`

**Interfaces:**
- Consumes: `getDb`; `ExecutionLedgerEntry`.
- Produces:
  - `append(taskId, eventType, payload?, options?): ExecutionLedgerEntry`
  - `getTimeline(taskId): ExecutionLedgerEntry[]`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/agent/executionLedger.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {ExecutionLedgerEntry} from '@/types/domain';

export function append(
  taskId: number | null,
  eventType: string,
  payload?: unknown,
  options?: {stepId?: number; projectId?: number; actor?: string; eventName?: string},
): ExecutionLedgerEntry {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO execution_ledger (
         task_id, step_id, project_id, actor, event_type, event_name, payload_json, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .run(
      taskId ?? null,
      options?.stepId ?? null,
      options?.projectId ?? null,
      options?.actor ?? 'system',
      eventType,
      options?.eventName ?? null,
      payload ? JSON.stringify(payload) : null,
    );
  return db
    .prepare('SELECT * FROM execution_ledger WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as ExecutionLedgerEntry;
}

export function getTimeline(taskId: number): ExecutionLedgerEntry[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM execution_ledger WHERE task_id = ? ORDER BY created_at ASC')
    .all(taskId) as ExecutionLedgerEntry[];
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/agent/executionLedger.ts
git commit -m "feat(agent): implement executionLedger append and timeline"
```

---

## Task 7: Implement `agent/artifactManager.ts`

**Files:**
- Modify: `electron/services/agent/artifactManager.ts`

**Interfaces:**
- Consumes: `getDb`; `AgentArtifact`.
- Produces:
  - `createArtifact(taskId, type, title, content, projectId?): AgentArtifact`
  - `getArtifacts(taskId): AgentArtifact[]`
  - `updateArtifact(id, fields): void`
  - `getArtifactById(id): AgentArtifact | null`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/agent/artifactManager.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {AgentArtifact} from '@/types/domain';

export function createArtifact(
  taskId: number | null,
  type: string,
  title: string,
  content: string,
  projectId?: number | null,
): AgentArtifact {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO agent_artifacts (
         task_id, project_id, artifact_type, title, content, status, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, 'completed', datetime('now'), datetime('now'))`,
    )
    .run(taskId ?? null, projectId ?? null, type, title, content);
  return db
    .prepare('SELECT * FROM agent_artifacts WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as AgentArtifact;
}

export function getArtifacts(taskId: number): AgentArtifact[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM agent_artifacts WHERE task_id = ? ORDER BY created_at DESC')
    .all(taskId) as AgentArtifact[];
}

export function getArtifactById(id: number): AgentArtifact | null {
  const db = getDb();
  return (
    (db.prepare('SELECT * FROM agent_artifacts WHERE id = ?').get(id) as
      | AgentArtifact
      | undefined) ?? null
  );
}

export function updateArtifact(
  id: number,
  fields: Partial<Pick<AgentArtifact, 'content' | 'status' | 'metadata_json' | 'title'>>,
): void {
  const db = getDb();
  const allowed = ['content', 'status', 'metadata_json', 'title'] as const;
  const setters: string[] = [];
  const params: unknown[] = [];
  for (const key of allowed) {
    if (key in fields) {
      setters.push(`${key} = ?`);
      params.push(fields[key]);
    }
  }
  if (setters.length === 0) return;
  setters.push("updated_at = datetime('now')");
  params.push(id);
  db.prepare(`UPDATE agent_artifacts SET ${setters.join(', ')} WHERE id = ?`).run(...params);
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/agent/artifactManager.ts
git commit -m "feat(agent): implement artifactManager CRUD"
```

---

## Task 8: Refactor `geoAgentRuntime.ts` to use Service layer

**Files:**
- Modify: `electron/services/agent/geoAgentRuntime.ts`
- Modify: `electron/ipc/handlers.ts:387-414` (agentTask:create and agentTask:run)

**Interfaces:**
- Consumes: `createTask`, `updateTask`, `addTaskStep`, `updateTaskStep` from `taskStateManager.ts`; `append` from `executionLedger.ts`; `createArtifact` from `artifactManager.ts`.
- Produces: `runMinimalAgentTask(userGoal, options): Promise<AgentTask>` (same signature).

- [ ] **Step 1: Refactor geoAgentRuntime.ts**

Replace the top imports and the database-direct parts of `electron/services/agent/geoAgentRuntime.ts`. Keep `getLastAiMessageText` and the Agent invocation logic. The new file should look like:

```typescript
import {createGeoAgent} from './geoAgentFactory.ts';
import {createTask, updateTask, addTaskStep, updateTaskStep} from './taskStateManager.ts';
import {append} from './executionLedger.ts';
import {createArtifact} from './artifactManager.ts';
import type {AgentTask} from '@/types/domain';

export interface RunMinimalAgentOptions {
  projectId?: number;
  sessionId?: number;
  title?: string;
}

function getLastAiMessageText(state: unknown): string | null {
  // keep existing implementation unchanged
}

export async function runMinimalAgentTask(
  userGoal: string,
  options: RunMinimalAgentOptions = {},
): Promise<AgentTask> {
  const task = createTask({
    session_id: options.sessionId ?? null,
    project_id: options.projectId ?? null,
    title: options.title ?? userGoal.slice(0, 80),
    user_goal: userGoal,
    status: 'running',
    current_objective: '等待 Agent 回答',
    last_action: null,
    risk_level: 'low',
    failure_count: 0,
    loop_count: 0,
    max_loop_count: 12,
  });
  const taskId = task.id;

  const planStep = addTaskStep(taskId, {
    step_type: 'plan',
    action_name: 'analyze_user_goal',
    status: 'running',
    input_json: JSON.stringify({userGoal}),
    attempt_count: 1,
    max_attempts: 1,
    started_at: new Date().toISOString(),
  });

  append(taskId, 'task_started', {userGoal}, {projectId: options.projectId, actor: 'agent'});

  try {
    updateTask(taskId, {current_objective: '调用 DeepAgent 处理用户问题'});

    const agent = createGeoAgent(options.projectId);
    const userMessage = options.projectId
      ? `当前项目 ID 是 ${options.projectId}。请基于该项目知识库回答：${userGoal}`
      : userGoal;
    const result = await agent.invoke({
      messages: [{role: 'user', content: userMessage}],
    });

    const answerText = getLastAiMessageText(result) ?? 'Agent 未返回有效回答';

    updateTaskStep(planStep.id, {
      status: 'completed',
      output_json: JSON.stringify({result: '已生成回答'}),
      completed_at: new Date().toISOString(),
    });

    addTaskStep(taskId, {
      step_type: 'final_response',
      action_name: 'answer_user',
      status: 'completed',
      input_json: JSON.stringify({userGoal}),
      output_json: JSON.stringify({answer: answerText}),
      attempt_count: 1,
      max_attempts: 1,
      completed_at: new Date().toISOString(),
    });

    createArtifact(
      taskId,
      'agent_response',
      options.title ?? 'Agent 回答',
      answerText,
      options.projectId ?? null,
    );

    updateTask({
      id: taskId,
      status: 'completed',
      current_objective: '已完成回答',
      last_action: 'answer_user',
      completed_at: new Date().toISOString(),
    } as Partial<AgentTask>);

    append(taskId, 'task_completed', {answerLength: answerText.length}, {projectId: options.projectId, actor: 'agent'});
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[geoAgentRuntime] task ${taskId} failed:`, error);

    updateTaskStep(planStep.id, {
      status: 'failed',
      output_json: JSON.stringify({error: message}),
      completed_at: new Date().toISOString(),
    });

    updateTask(taskId, {
      status: 'failed',
      current_objective: `失败：${message}`,
    });

    append(taskId, 'task_failed', {error: message}, {projectId: options.projectId, actor: 'agent'});
  }

  return loadTask(taskId) as AgentTask;
}
```

Note: add import for `loadTask` from `taskStateManager.ts` at the top.

- [ ] **Step 2: Update agentTask:create handler**

In `electron/ipc/handlers.ts`, replace `agentTask:create` handler (lines 387-405) with:

```typescript
  createHandler('agentTask:create', (params) => {
    const validated = AgentTaskCreateSchema.parse(params);
    return createTask({
      session_id: validated.sessionId ?? null,
      project_id: validated.projectId ?? null,
      title: validated.title ?? null,
      user_goal: validated.userGoal,
      status: 'created',
      risk_level: 'low',
      failure_count: 0,
      loop_count: 0,
      max_loop_count: 12,
    });
  });
```

Add import:

```typescript
import {createTask} from '../services/agent/taskStateManager.ts';
```

- [ ] **Step 3: Run lint and commit**

```bash
npm run lint
git add electron/services/agent/geoAgentRuntime.ts electron/ipc/handlers.ts
git commit -m "refactor(agent): geoAgentRuntime uses taskStateManager, executionLedger, artifactManager"
```

---

## Task 9: Refactor `geoAgentFactory.ts` tools to use `projectService`

**Files:**
- Modify: `electron/services/agent/geoAgentFactory.ts`

**Interfaces:**
- Consumes: `listProjects`, `createProject` from `projectService.ts`.
- Produces: same `createGeoAgent(projectId?)` signature.

- [ ] **Step 1: Update imports and tools**

In `electron/services/agent/geoAgentFactory.ts`:

1. Remove `import {getDb} from '../../db/connection.ts';`
2. Add `import {listProjects, createProject} from '../projectService.ts';`
3. Replace `projectListTool` implementation with:

```typescript
  const projectListTool = tool(
    async () => {
      const rows = listProjects();
      return JSON.stringify(rows, null, 2);
    },
    {
      name: 'project_list',
      description: '列出所有已有项目，供用户选择或参考。',
      schema: projectListInputSchema,
    },
  );
```

4. Replace `projectCreateTool` implementation with:

```typescript
  const projectCreateTool = tool(
    async (input) => {
      const project = createProject({
        name: input.name,
        description: input.description,
        industry: input.industry,
        region: input.region,
      });
      return `已创建项目「${project.name}」，项目 ID 为 ${project.id}。创建完成后可以录入企业资料，然后基于知识库执行 GEO 任务。`;
    },
    {
      name: 'project_create',
      description: '创建一个新项目（企业），创建后可以继续录入知识库资料。',
      schema: projectCreateInputSchema,
    },
  );
```

5. Replace `const tools: any[] = ...` with a typed array:

```typescript
  const tools = [answerUserTool, projectListTool, projectCreateTool];
```

(If TypeScript complains due to DeepAgent tool union types, use `as ToolInterface[]` or keep `any[]` if necessary, but prefer `ReturnType<typeof tool>[]`.)

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/agent/geoAgentFactory.ts
git commit -m "refactor(agent): geoAgentFactory tools use projectService instead of direct SQL"
```

---

## Task 10: Implement `assistant/assistantRunService.ts`

**Files:**
- Modify: `electron/services/assistant/assistantRunService.ts`

**Interfaces:**
- Consumes: `getDb`; `AssistantRun`.
- Produces:
  - `createRun(input: StartAssistantRunInput): AssistantRun`
  - `getRun(id): AssistantRun | undefined`
  - `cancelRun(requestId): void`
  - `updateRunStatus(id, status): void`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/assistant/assistantRunService.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {AssistantRun} from '@/types/domain';

export interface StartAssistantRunInput {
  sessionId?: number;
  projectId?: number;
  requestId: string;
  runType?: string;
}

export function createRun(input: StartAssistantRunInput): AssistantRun {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO assistant_runs (
         session_id, project_id, request_id, run_type, status,
         started_at, updated_at
       ) VALUES (?, ?, ?, ?, 'running', datetime('now'), datetime('now'))`,
    )
    .run(
      input.sessionId ?? null,
      input.projectId ?? null,
      input.requestId,
      input.runType ?? 'chat',
    );
  return db
    .prepare('SELECT * FROM assistant_runs WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as AssistantRun;
}

export function getRun(id: number): AssistantRun | undefined {
  const db = getDb();
  return db.prepare('SELECT * FROM assistant_runs WHERE id = ?').get(id) as
    | AssistantRun
    | undefined;
}

export function getRunByRequestId(requestId: string): AssistantRun | undefined {
  const db = getDb();
  return db
    .prepare('SELECT * FROM assistant_runs WHERE request_id = ?')
    .get(requestId) as AssistantRun | undefined;
}

export function updateRunStatus(id: number, status: string): void {
  const db = getDb();
  db
    .prepare("UPDATE assistant_runs SET status = ?, updated_at = datetime('now') WHERE id = ?")
    .run(status, id);
}

export function cancelRun(requestId: string): void {
  const db = getDb();
  const run = getRunByRequestId(requestId);
  if (run) {
    updateRunStatus(run.id, 'cancelled');
  }
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/assistant/assistantRunService.ts
git commit -m "feat(assistant): implement assistantRunService CRUD"
```

---

## Task 11: Implement `assistant/toolApprovalService.ts`

**Files:**
- Modify: `electron/services/assistant/toolApprovalService.ts`

**Interfaces:**
- Consumes: `getDb`; `ToolApproval`.
- Produces:
  - `createApproval(toolCallId, approvalType): ToolApproval`
  - `respond(approvalId, approved, note?): void`
  - `listPending(): ToolApproval[]`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/assistant/toolApprovalService.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {ToolApproval} from '@/types/domain';

export function createApproval(
  toolCallId: number,
  approvalType: string,
): ToolApproval {
  const db = getDb();
  const result = db
    .prepare(
      `INSERT INTO tool_approvals (
         tool_call_id, requested_by, approval_type, status,
         requested_at
       ) VALUES (?, ?, ?, 'pending', datetime('now'))`,
    )
    .run(toolCallId, 'assistant', approvalType);
  return db
    .prepare('SELECT * FROM tool_approvals WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as ToolApproval;
}

export function respond(approvalId: number, approved: boolean, note?: string): void {
  const db = getDb();
  db.prepare(
    "UPDATE tool_approvals SET status = ?, reviewer_note = ?, reviewed_at = datetime('now') WHERE id = ?",
  ).run(approved ? 'approved' : 'rejected', note ?? null, approvalId);
}

export function listPending(): ToolApproval[] {
  const db = getDb();
  return db
    .prepare("SELECT * FROM tool_approvals WHERE status = 'requested' ORDER BY requested_at DESC")
    .all() as ToolApproval[];
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/assistant/toolApprovalService.ts
git commit -m "feat(assistant): implement toolApprovalService CRUD"
```

---

## Task 12: Implement `assistant/assistantQueueService.ts`

**Files:**
- Modify: `electron/services/assistant/assistantQueueService.ts`

**Interfaces:**
- Consumes: `getDb`; `AssistantQueueItem`.
- Produces:
  - `listItems(runId): AssistantQueueItem[]`
  - `updateItem(itemId, status, metadata?): void`

- [ ] **Step 1: Implement the service**

Replace the contents of `electron/services/assistant/assistantQueueService.ts` with:

```typescript
import {getDb} from '../../db/connection.ts';
import type {AssistantQueueItem} from '@/types/domain';

export function listItems(runId: number): AssistantQueueItem[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM assistant_queue_items WHERE run_id = ? ORDER BY order_index ASC')
    .all(runId) as AssistantQueueItem[];
}

export function updateItem(
  itemId: number,
  status: string,
  metadata?: Record<string, unknown>,
): void {
  const db = getDb();
  db.prepare(
    'UPDATE assistant_queue_items SET status = ?, metadata_json = ?, updated_at = datetime(\'now\') WHERE id = ?',
  ).run(status, metadata ? JSON.stringify(metadata) : null, itemId);
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/assistant/assistantQueueService.ts
git commit -m "feat(assistant): implement assistantQueueService CRUD"
```

---

## Task 13: Implement `assistant/assistantRuntime.ts`

**Files:**
- Modify: `electron/services/assistant/assistantRuntime.ts`

**Interfaces:**
- Consumes: `createRun`, `cancelRun` from `assistantRunService.ts`.
- Produces:
  - `startRun(input): AssistantRun`
  - `cancelRun(requestId): void`

- [ ] **Step 1: Implement minimal runtime**

Replace the contents of `electron/services/assistant/assistantRuntime.ts` with:

```typescript
import {createRun, cancelRun} from './assistantRunService.ts';
import type {AssistantRun} from '@/types/domain';

export interface StartAssistantRunInput {
  sessionId?: number;
  projectId?: number;
  requestId: string;
  runType?: string;
}

export async function startRun(input: StartAssistantRunInput): Promise<AssistantRun> {
  return createRun(input);
}

export async function cancelRun(requestId: string): Promise<void> {
  cancelRun(requestId);
}
```

- [ ] **Step 2: Run lint and commit**

```bash
npm run lint
git add electron/services/assistant/assistantRuntime.ts
git commit -m "feat(assistant): implement minimal assistantRuntime delegating to runService"
```

---

## Task 14: Refactor remaining Handler SQL to Service layer

**Files:**
- Modify: `electron/ipc/handlers.ts`
- Create: `electron/services/agentTaskService.ts` (or split into agent/task/artifact service)
- Create: `electron/services/draftService.ts`
- Create: `electron/services/publishService.ts`
- Create: `electron/services/visibilityService.ts`
- Create: `electron/services/reflectionService.ts`

**Interfaces:**
- These services mirror the remaining Handler SQL for agentTask, draft, publish, visibility, reflection.

### Sub-task 14.1: `agentTaskService.ts`

Create `electron/services/agentTaskService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {AgentTask, AgentTaskStep, AgentArtifact} from '@/types/domain';

export function getTask(id: number): AgentTask | null {
  const db = getDb();
  return (
    (db.prepare('SELECT * FROM agent_tasks WHERE id = ?').get(id) as AgentTask | undefined) ??
    null
  );
}

export function listTasks(filters?: {
  projectId?: number;
  status?: string;
  limit?: number;
}): AgentTask[] {
  const db = getDb();
  let sql = 'SELECT * FROM agent_tasks WHERE 1=1';
  const params: unknown[] = [];
  if (filters?.projectId !== undefined) {
    sql += ' AND project_id = ?';
    params.push(filters.projectId);
  }
  if (filters?.status !== undefined) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  sql += ' ORDER BY created_at DESC LIMIT ?';
  params.push(filters?.limit ?? 50);
  return db.prepare(sql).all(...params) as AgentTask[];
}

export function updateTaskStatus(id: number, status: string, extra?: {incFailure?: boolean}): void {
  const db = getDb();
  if (extra?.incFailure) {
    db.prepare(
      "UPDATE agent_tasks SET status = ?, failure_count = failure_count + 1, updated_at = datetime('now') WHERE id = ?",
    ).run(status, id);
  } else {
    db.prepare(
      "UPDATE agent_tasks SET status = ?, updated_at = datetime('now') WHERE id = ?",
    ).run(status, id);
  }
}

export function getTaskTimeline(id: number): AgentTaskStep[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM agent_task_steps WHERE task_id = ? ORDER BY created_at ASC')
    .all(id) as AgentTaskStep[];
}

export function getTaskArtifacts(id: number): AgentArtifact[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM agent_artifacts WHERE task_id = ? ORDER BY created_at DESC')
    .all(id) as AgentArtifact[];
}
```

Update handlers for `agentTask:get/list/resume/pause/cancel/retry/timeline/artifacts` to call this service.

### Sub-task 14.2: `draftService.ts`

Create `electron/services/draftService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {AgentArtifact} from '@/types/domain';

export function listDrafts(projectId: number): AgentArtifact[] {
  const db = getDb();
  return db
    .prepare('SELECT * FROM agent_artifacts WHERE project_id = ? ORDER BY created_at DESC')
    .all(projectId) as AgentArtifact[];
}

export function getDraft(id: number): AgentArtifact | null {
  const db = getDb();
  return (
    (db.prepare('SELECT * FROM agent_artifacts WHERE id = ?').get(id) as
      | AgentArtifact
      | undefined) ?? null
  );
}

export function updateDraft(
  id: number,
  content: string,
  status?: string,
): void {
  const db = getDb();
  db.prepare(
    "UPDATE agent_artifacts SET content = ?, status = COALESCE(?, status), updated_at = datetime('now') WHERE id = ?",
  ).run(content, status ?? null, id);
}

export function reviewDraft(id: number, approved: boolean, note?: string): void {
  const db = getDb();
  const status = approved ? 'approved' : 'rejected';
  db.prepare(
    "UPDATE agent_artifacts SET status = ?, metadata_json = json_patch(COALESCE(metadata_json, '{}'), json_object('reviewNote', ?)), updated_at = datetime('now') WHERE id = ?",
  ).run(status, note ?? null, id);
}
```

### Sub-task 14.3: `publishService.ts`

Create `electron/services/publishService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {PublishRecord} from '@/types/domain';

export interface PublishPlanInput {
  artifactId: number;
  projectId: number;
  channels: Array<{name: string; platform: string; channelType?: string}>;
}

export function planPublish(input: PublishPlanInput): PublishRecord[] {
  const db = getDb();
  const insert = db.prepare(
    `INSERT INTO publish_records (
       artifact_id, project_id, platform, channel_name, channel_type,
       status, created_at
     ) VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
  );
  const records: PublishRecord[] = [];
  for (const channel of input.channels) {
    const result = insert.run(
      input.artifactId,
      input.projectId,
      channel.platform,
      channel.name,
      channel.channelType ?? null,
    );
    records.push(
      db
        .prepare('SELECT * FROM publish_records WHERE id = ?')
        .get(Number(result.lastInsertRowid)) as PublishRecord,
    );
  }
  return records;
}

export function approvePublish(recordIds: number[], approved: boolean): void {
  const db = getDb();
  const status = approved ? 'pending' : 'rejected';
  const update = db.prepare('UPDATE publish_records SET status = ? WHERE id = ?');
  for (const id of recordIds) {
    update.run(status, id);
  }
}

export function getPublishStatus(id: number): PublishRecord | null {
  const db = getDb();
  return (
    (db.prepare('SELECT * FROM publish_records WHERE id = ?').get(id) as
      | PublishRecord
      | undefined) ?? null
  );
}
```

### Sub-task 14.4: `visibilityService.ts`

Create `electron/services/visibilityService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {VisibilityCheck} from '@/types/domain';

export function createVisibilityCheck(input: {
  publishRecordId: number;
  query?: string;
}): VisibilityCheck {
  const db = getDb();
  const publishRecord = db
    .prepare('SELECT * FROM publish_records WHERE id = ?')
    .get(input.publishRecordId) as
    | {project_id: number; published_url: string | null; channel_name: string}
    | undefined;
  const projectId = publishRecord?.project_id ?? 0;
  const query = input.query ?? publishRecord?.channel_name ?? '';
  const result = db
    .prepare(
      `INSERT INTO visibility_checks (
         publish_record_id, project_id, query, published_url,
         checked_at
       ) VALUES (?, ?, ?, ?, datetime('now'))`,
    )
    .run(input.publishRecordId, projectId, query, publishRecord?.published_url ?? null);
  return db
    .prepare('SELECT * FROM visibility_checks WHERE id = ?')
    .get(Number(result.lastInsertRowid)) as VisibilityCheck;
}
```

### Sub-task 14.5: `reflectionService.ts`

Create `electron/services/reflectionService.ts`:

```typescript
import {getDb} from '../db/connection.ts';
import type {ReflectionHypothesis} from '@/types/domain';

export function listHypotheses(filters?: {
  status?: string;
  scope?: string;
}): ReflectionHypothesis[] {
  const db = getDb();
  let sql = 'SELECT * FROM reflection_hypotheses WHERE 1=1';
  const params: unknown[] = [];
  if (filters?.status !== undefined) {
    sql += ' AND status = ?';
    params.push(filters.status);
  }
  if (filters?.scope !== undefined) {
    sql += ' AND scope = ?';
    params.push(filters.scope);
  }
  sql += ' ORDER BY created_at DESC';
  return db.prepare(sql).all(...params) as ReflectionHypothesis[];
}

export function updateHypothesisStatus(id: number, status: string): void {
  const db = getDb();
  db.prepare(
    "UPDATE reflection_hypotheses SET status = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(status, id);
}
```

### Sub-task 14.6: Update handlers

In `electron/ipc/handlers.ts`, replace all remaining business SQL handlers with service calls:

- `agentTask:get/list/resume/pause/cancel/retry/timeline/artifacts` → `agentTaskService`
- `draft:list/get/update/review` → `draftService`
- `publish:plan/approve/status` → `publishService`
- `visibility:check` → `visibilityService`
- `reflection:list/approve/reject/archive` → `reflectionService`
- `assistant:streamStart/streamCancel/queueList/queueUpdate/toolApproval:*` → `assistantRuntime/assistantQueueService/toolApprovalService`

Add imports at the top of `handlers.ts`:

```typescript
import {
  getTask,
  listTasks,
  updateTaskStatus,
  getTaskTimeline,
  getTaskArtifacts,
} from '../services/agentTaskService.ts';
import {listDrafts, getDraft, updateDraft, reviewDraft} from '../services/draftService.ts';
import {planPublish, approvePublish, getPublishStatus} from '../services/publishService.ts';
import {createVisibilityCheck} from '../services/visibilityService.ts';
import {listHypotheses, updateHypothesisStatus} from '../services/reflectionService.ts';
import {startRun, cancelRun} from '../services/assistant/assistantRuntime.ts';
import {listItems, updateItem} from '../services/assistant/assistantQueueService.ts';
import {respond, listPending} from '../services/assistant/toolApprovalService.ts';
```

- [ ] **Step 1: Create all service files**
- [ ] **Step 2: Update handlers**
- [ ] **Step 3: Run lint**

```bash
npm run lint
```

- [ ] **Step 4: Commit**

```bash
git add electron/services/*.ts electron/services/agent/agentTaskService.ts electron/services/assistant/*.ts electron/ipc/handlers.ts
git commit -m "refactor: move remaining handler SQL to services (agentTask, draft, publish, visibility, reflection, assistant)"
```

---

## Task 15: Final verification

**Files:**
- `electron/ipc/handlers.ts`
- All new/modified service files

- [ ] **Step 1: Grep for remaining direct business SQL in handlers**

```bash
grep -n "db.prepare\|db.exec" electron/ipc/handlers.ts
```

Expected remaining matches only in:
- `db:query`
- `db:exec`
- `db:migrate`
- `db:vectorSearch`

No matches in `project:*`, `kb:*`, `fact:*`, `agentTask:*`, `draft:*`, `publish:*`, `visibility:*`, `reflection:*`, `assistant:*` handlers.

- [ ] **Step 2: Grep for throw Error in agent/assistant services**

```bash
grep -rn "throw new Error" electron/services/agent/ electron/services/assistant/
```

Expected: no matches (or only in genuinely unimplemented non-core paths).

- [ ] **Step 3: Run full lint**

```bash
npm run lint
```

Expected: no errors.

- [ ] **Step 4: Manual regression checklist**

Run the app (`npm run dev`) and verify:

1. 项目新建 / 编辑 / 删除 / 切换正常。
2. 知识库文本/文件录入正常，索引后能搜索。
3. 企业事实抽取与审核（确认/拒绝/修改）正常。
4. AI 聊天中的 Agent 任务调用正常，任务状态和产物能查询。
5. Assistant 历史记录能加载。

- [ ] **Step 5: Commit verification notes (optional)**

If no code changes were needed during verification, no additional commit is required.

---

## Self-Review Checklist

- [ ] **Spec coverage**: Each section of the design doc maps to one or more tasks in this plan.
- [ ] **Placeholder scan**: No TBD/TODO/"implement later" in task steps; code blocks contain actual content.
- [ ] **Type consistency**: Function names and signatures match across tasks (e.g., `createTask`, `append`, `createArtifact`).
- [ ] **Scope check**: Project 1 scope is respected; no Phase 7 article generation or Phase 8 streaming logic included.
