import type {IpcChannels} from '../../electron/ipc/channels.ts';

export const api = {
  invoke: <T extends keyof IpcChannels>(
    channel: T,
    ...args: Parameters<IpcChannels[T]>
  ): Promise<ReturnType<IpcChannels[T]>> => {
    return window.electron.invoke(channel, ...args);
  },

  on: (channel: string, callback: (...args: unknown[]) => void) => {
    return window.electron.on(channel, callback);
  },
};

export const dbApi = {
  query: (sql: string, params?: unknown[]) => api.invoke('db:query', sql, params),
  exec: (sql: string, params?: unknown[]) => api.invoke('db:exec', sql, params),
  migrate: () => api.invoke('db:migrate'),
  vectorSearch: (table: string, queryVector: number[], limit = 10) =>
    api.invoke('db:vectorSearch', {table, queryVector, limit}),
};

export const dialogApi = {
  openFile: (options?: Parameters<IpcChannels['dialog:openFile']>[0]) =>
    api.invoke('dialog:openFile', options),
};

export const kbApi = {
  ingestText: (projectId: number, title: string, content: string) =>
    api.invoke('kb:ingestText', {projectId, title, content}),
  ingestFile: (projectId: number, title: string, filePath: string) =>
    api.invoke('kb:ingestFile', {projectId, title, filePath}),
  indexEntry: (entryId: number) => api.invoke('kb:indexEntry', {entryId}),
  search: (projectId: number, query: string, limit?: number) =>
    api.invoke('kb:search', {projectId, query, limit}),
};

export const ragApi = {
  ask: (projectId: number, query: string, limit?: number) =>
    api.invoke('rag:ask', {projectId, query, limit}),
};

export const appApi = {
  getPath: (name: Parameters<IpcChannels['app:getPath']>[0]) =>
    api.invoke('app:getPath', name),
};
