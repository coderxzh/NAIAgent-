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

  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:unmaximize': () => void;
  'window:close': () => void;
  'window:isMaximized': () => boolean;
  'window:platform': () => NodeJS.Platform;
}
