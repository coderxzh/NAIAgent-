// 视图路由
export type View =
  | 'dashboard'
  | 'aiAgent'
  | 'drafts'
  | 'autoLearning'
  | 'aiWebBuilder'
  | 'projectList'
  | 'kbIngest'
  | 'kbCreate';

// 通用状态枚举
export type RunStatus = 'pending' | 'running' | 'completed' | 'failed';
export type PublishStatus = 'pending' | 'published' | 'failed';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';
export type FactStatus = 'draft' | 'confirmed';
export type ChatRole = 'user' | 'assistant' | 'system';

// 项目
export interface Project {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

// 知识库
export interface KnowledgeBase {
  id: number;
  project_id: number;
  name: string;
  description: string | null;
  created_at: string;
}

export type KnowledgeEntryStatus = 'pending' | 'indexed' | 'failed';

// 知识库原始条目
export interface KnowledgeEntry {
  id: number;
  kb_id: number;
  title: string;
  content: string | null;
  source_type: string | null;
  source_file_path: string | null;
  status: KnowledgeEntryStatus;
  created_at: string;
}

// 知识库切片
export interface KnowledgeChunk {
  id: number;
  entry_id: number;
  chunk_text: string;
  chunk_index: number;
  created_at: string;
}

// 向量搜索结果
export interface VectorSearchResult {
  rowid: number;
  distance: number;
}

// 企业结构化事实
export interface EnterpriseFact {
  id: number;
  project_id: number;
  fact_type: string;
  fact_key: string;
  fact_value: string | null;
  confidence: number;
  status: FactStatus;
  created_at: string;
}

// 聊天会话
export interface ChatSession {
  id: number;
  project_id: number | null;
  title: string | null;
  session_type: string;
  created_at: string;
}

// 聊天消息
export interface ChatMessage {
  id: number;
  session_id: number;
  role: ChatRole;
  content: string;
  model: string | null;
  created_at: string;
}

// GEO 工作流运行
export interface GeoRun {
  id: number;
  project_id: number;
  knowledge_base_id: number | null;
  status: RunStatus;
  created_at: string;
}

// GEO 运行步骤
export interface GeoRunStep {
  id: number;
  run_id: number;
  step_type: string;
  step_data: string | null;
  status: RunStatus;
  created_at: string;
}

// 生成产物（稿件/文章）
export interface GeoArtifact {
  id: number;
  run_id: number;
  artifact_type: string;
  title: string | null;
  content: string | null;
  created_at: string;
}

// 人工确认
export interface HumanApproval {
  id: number;
  artifact_id: number;
  approval_type: string;
  status: ApprovalStatus;
  created_at: string;
}

// 发布记录
export interface PublishRecord {
  id: number;
  artifact_id: number;
  platform: string | null;
  status: PublishStatus;
  created_at: string;
}

// 可见性检测
export interface VisibilityCheck {
  id: number;
  publish_record_id: number;
  query: string | null;
  rank: number | null;
  checked_at: string;
}

// 反思规则
export interface ReflectionRule {
  id: number;
  scope: string;
  industry: string | null;
  rule_text: string;
  status: string;
  created_at: string;
}

// 模型调用日志
export interface ModelCallLog {
  id: number;
  model: string | null;
  prompt_tokens: number | null;
  completion_tokens: number | null;
  duration_ms: number | null;
  created_at: string;
}

// 应用配置
export interface AppSetting {
  key: string;
  value: string | null;
  updated_at: string;
}

// 领域聚合类型（供 UI 使用）
export interface KbHealthSummary {
  health: number;
  indexed: number;
  pending: number;
}

export interface DashboardStats {
  label: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
}

export interface TrendPoint {
  date: string;
  value: number;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  done: boolean;
}

export interface ActivityItem {
  id: string;
  title: string;
  time: string;
  type: string;
}

export interface KbAsset {
  name: string;
  status: 'indexed' | 'pending';
  words: number;
}
