-- projects: 项目表
CREATE TABLE IF NOT EXISTS projects (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- knowledge_bases: 知识库
CREATE TABLE IF NOT EXISTS knowledge_bases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- knowledge_entries: 知识库原始条目
CREATE TABLE IF NOT EXISTS knowledge_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kb_id INTEGER REFERENCES knowledge_bases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT,
  source_type TEXT,
  source_file_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- knowledge_chunks: 知识库切片
CREATE TABLE IF NOT EXISTS knowledge_chunks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entry_id INTEGER REFERENCES knowledge_entries(id) ON DELETE CASCADE,
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- knowledge_chunk_vectors: 向量表（sqlite-vec 虚拟表）
-- 注意：此表需要 sqlite-vec 扩展加载后才能创建，已移至 vec 扩展可用时创建
-- CREATE VIRTUAL TABLE IF NOT EXISTS knowledge_chunk_vectors USING vec0(
--   chunk_id INTEGER,
--   embedding float[768]
-- );

-- enterprise_facts: 企业结构化事实
CREATE TABLE IF NOT EXISTS enterprise_facts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL,
  fact_key TEXT NOT NULL,
  fact_value TEXT,
  confidence REAL DEFAULT 1.0,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- chat_sessions: 聊天会话
CREATE TABLE IF NOT EXISTS chat_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE SET NULL,
  title TEXT,
  session_type TEXT DEFAULT 'public',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- chat_messages: 聊天消息
CREATE TABLE IF NOT EXISTS chat_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  model TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- geo_runs: GEO 工作流运行
CREATE TABLE IF NOT EXISTS geo_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  knowledge_base_id INTEGER REFERENCES knowledge_bases(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- geo_run_steps: GEO 运行步骤
CREATE TABLE IF NOT EXISTS geo_run_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES geo_runs(id) ON DELETE CASCADE,
  step_type TEXT NOT NULL,
  step_data TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- geo_artifacts: 生成产物
CREATE TABLE IF NOT EXISTS geo_artifacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  run_id INTEGER REFERENCES geo_runs(id) ON DELETE CASCADE,
  artifact_type TEXT NOT NULL,
  title TEXT,
  content TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- human_approvals: 人工确认
CREATE TABLE IF NOT EXISTS human_approvals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER REFERENCES geo_artifacts(id) ON DELETE CASCADE,
  approval_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- publish_records: 发布记录
CREATE TABLE IF NOT EXISTS publish_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artifact_id INTEGER REFERENCES geo_artifacts(id) ON DELETE CASCADE,
  platform TEXT,
  status TEXT DEFAULT 'pending',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- visibility_checks: 可见性检测
CREATE TABLE IF NOT EXISTS visibility_checks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  publish_record_id INTEGER REFERENCES publish_records(id) ON DELETE CASCADE,
  query TEXT,
  rank INTEGER,
  checked_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- reflection_rules: 反思规则
CREATE TABLE IF NOT EXISTS reflection_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  scope TEXT DEFAULT 'global',
  industry TEXT,
  rule_text TEXT NOT NULL,
  status TEXT DEFAULT 'candidate',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- model_call_logs: 模型调用日志
CREATE TABLE IF NOT EXISTS model_call_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  model TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  duration_ms INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- app_settings: 应用配置
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 默认配置
INSERT OR IGNORE INTO app_settings (key, value) VALUES ('vec_enabled', 'true');
