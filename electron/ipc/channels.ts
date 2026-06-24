interface IndexingResult {
  entryId: number;
  chunkCount: number;
  status: 'pending' | 'indexed' | 'failed';
  error?: string;
}

interface KnowledgeSearchResult {
  chunkId: number;
  distance: number;
  chunkText: string;
  chunkIndex: number;
  entryId: number;
  entryTitle: string;
  sourceType: string | null;
  sourceFilePath: string | null;
}

interface RagAnswer {
  answer: string;
  sources: Array<{
    chunkId: number;
    entryId: number;
    entryTitle: string;
    chunkText: string;
    chunkIndex: number;
    sourceType: string | null;
    sourceFilePath: string | null;
  }>;
  model: string;
}

export interface IpcChannels {
  ping: () => 'pong';

  'db:query': (sql: string, params?: unknown[]) => unknown[];
  'db:exec': (sql: string, params?: unknown[]) => {changes: number; lastInsertRowid: number | bigint};
  'db:migrate': () => {currentVersion: number; targetVersion: number};
  'db:vectorSearch': (params: {
    table: string;
    queryVector: number[];
    limit: number;
  }) => Array<{rowid: number; distance: number}>;

  'dialog:openFile': (options?: {
    multiple?: boolean;
    filters?: Array<{name: string; extensions: string[]}>;
  }) => string[];

  'app:getPath': (name: 'userData' | 'home' | 'downloads') => string;

  'kb:ingestText': (params: {
    projectId: number;
    title: string;
    content: string;
  }) => IndexingResult;
  'kb:ingestFile': (params: {
    projectId: number;
    title: string;
    filePath: string;
  }) => IndexingResult;
  'kb:indexEntry': (params: {entryId: number}) => IndexingResult;
  'kb:search': (params: {
    projectId: number;
    query: string;
    limit?: number;
  }) => KnowledgeSearchResult[];
  'rag:ask': (params: {
    projectId: number;
    query: string;
    limit?: number;
  }) => RagAnswer;

  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:unmaximize': () => void;
  'window:close': () => void;
  'window:isMaximized': () => boolean;
  'window:platform': () => NodeJS.Platform;
}
