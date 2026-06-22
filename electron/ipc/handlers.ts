import {app, ipcMain, dialog, BrowserWindow} from 'electron';
import {getDb} from '../db/connection.ts';
import {runMigrations} from '../db/migrations.ts';
import {
  AppPathSchema,
  DbQuerySchema,
  OpenFileSchema,
  VectorSearchSchema,
} from './schemas.ts';
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

  createHandler('db:exec', (sql) => {
    const validated = DbQuerySchema.parse({sql});
    return db.prepare(validated.sql).run();
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
