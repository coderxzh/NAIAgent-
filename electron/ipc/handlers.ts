import {app, ipcMain, dialog, BrowserWindow} from 'electron';
import {getDb} from '../db/connection.ts';
import {runMigrations} from '../db/migrations.ts';
import {
  AppPathSchema,
  DbExecSchema,
  DbQuerySchema,
  KbIndexEntrySchema,
  KbIngestFileSchema,
  KbIngestTextSchema,
  KbSearchSchema,
  OpenFileSchema,
  RagAskSchema,
  VectorSearchSchema,
} from './schemas.ts';
import {indexEntry} from '../services/indexingService.ts';
import {embedText} from '../services/embedding.ts';
import {searchSimilarChunks} from '../services/vectorStore.ts';
import {askQuestion} from '../services/ragService.ts';
import type {IpcChannels} from './channels.ts';

let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

function createHandler<T extends keyof IpcChannels>(
  channel: T,
  handler: (
    ...args: Parameters<IpcChannels[T]>
  ) =>
    | Promise<ReturnType<IpcChannels[T]>>
    | ReturnType<IpcChannels[T]>,
) {
  ipcMain.handle(channel, async (_event, ...args) => {
    try {
      return await handler(...(args as Parameters<IpcChannels[T]>));
    } catch (error) {
      console.error(`IPC error on ${channel}:`, error);
      throw error;
    }
  });
}

export function registerIpcHandlers() {
  const db = getDb();

  createHandler('ping', () => 'pong');

  createHandler('db:query', (sql, params) => {
    const validated = DbQuerySchema.parse({sql, params});
    return db.prepare(validated.sql).all(...(validated.params ?? []));
  });

  createHandler('db:exec', (sql, params) => {
    const validated = DbExecSchema.parse({sql, params});
    return db.prepare(validated.sql).run(...(validated.params ?? []));
  });

  createHandler('db:migrate', () => {
    return runMigrations(db);
  });

  createHandler('db:vectorSearch', (params) => {
    const validated = VectorSearchSchema.parse(params);
    const stmt = db.prepare(
      `SELECT rowid, distance FROM ${validated.table} WHERE embedding MATCH ? ORDER BY distance LIMIT ?`,
    );
    return stmt.all(
      JSON.stringify(validated.queryVector),
      validated.limit,
    ) as Array<{rowid: number; distance: number}>;
  });

  createHandler('dialog:openFile', (options) => {
    const validated = OpenFileSchema.parse(options ?? {});
    const result = dialog.showOpenDialogSync({
      properties: validated.multiple
        ? ['openFile', 'multiSelections']
        : ['openFile'],
      filters: validated.filters as Electron.FileFilter[] | undefined,
    });
    return result ?? [];
  });

  createHandler('app:getPath', (name) => {
    const validated = AppPathSchema.parse(name);
    return app.getPath(validated);
  });

  function getOrCreateDefaultKb(projectId: number): number {
    const existing = db
      .prepare('SELECT id FROM knowledge_bases WHERE project_id = ? ORDER BY created_at LIMIT 1')
      .get(projectId) as {id: number} | undefined;
    if (existing) return existing.id;

    const result = db
      .prepare(
        "INSERT INTO knowledge_bases (project_id, name, description, created_at) VALUES (?, ?, ?, datetime('now'))",
      )
      .run(projectId, '默认知识库', null);
    return Number(result.lastInsertRowid);
  }

  createHandler('kb:ingestText', async (params) => {
    const validated = KbIngestTextSchema.parse(params);
    const kbId = getOrCreateDefaultKb(validated.projectId);
    const result = db
      .prepare(
        "INSERT INTO knowledge_entries (kb_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      )
      .run(kbId, validated.title, validated.content, 'text', null, 'pending');
    const entryId = Number(result.lastInsertRowid);
    return indexEntry(entryId);
  });

  createHandler('kb:ingestFile', async (params) => {
    const validated = KbIngestFileSchema.parse(params);
    const kbId = getOrCreateDefaultKb(validated.projectId);
    const result = db
      .prepare(
        "INSERT INTO knowledge_entries (kb_id, title, content, source_type, source_file_path, status, created_at) VALUES (?, ?, ?, ?, ?, ?, datetime('now'))",
      )
      .run(kbId, validated.title, null, 'file', validated.filePath, 'pending');
    const entryId = Number(result.lastInsertRowid);
    return indexEntry(entryId);
  });

  createHandler('kb:indexEntry', async (params) => {
    const validated = KbIndexEntrySchema.parse(params);
    return indexEntry(validated.entryId);
  });

  createHandler('kb:search', async (params) => {
    const validated = KbSearchSchema.parse(params);
    const queryVector = await embedText(validated.query);
    const results = searchSimilarChunks(queryVector, validated.limit ?? 5);
    // Filter by project by joining knowledge_bases
    return results.filter((r) => {
      const kb = db
        .prepare(
          `SELECT kb.project_id
           FROM knowledge_chunks c
           JOIN knowledge_entries e ON c.entry_id = e.id
           JOIN knowledge_bases kb ON e.kb_id = kb.id
           WHERE c.id = ?`,
        )
        .get(r.chunkId) as {project_id: number} | undefined;
      return kb?.project_id === validated.projectId;
    });
  });

  createHandler('rag:ask', async (params) => {
    const validated = RagAskSchema.parse(params);
    return askQuestion(validated.projectId, validated.query, validated.limit ?? 5);
  });

  createHandler('window:minimize', () => {
    mainWindow?.minimize();
  });

  createHandler('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });

  createHandler('window:unmaximize', () => {
    mainWindow?.unmaximize();
  });

  createHandler('window:close', () => {
    mainWindow?.close();
  });

  createHandler('window:isMaximized', () => {
    return mainWindow?.isMaximized() ?? false;
  });

  createHandler('window:platform', () => {
    return process.platform;
  });
}
