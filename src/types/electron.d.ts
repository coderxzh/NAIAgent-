import type {IpcChannels} from '../../electron/ipc/channels.ts';

declare global {
  interface Window {
    electronAPI: {
      invoke: <T extends keyof IpcChannels>(
        channel: T,
        ...args: Parameters<IpcChannels[T]>
      ) => Promise<ReturnType<IpcChannels[T]>>;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;
    };
  }
}

export {};
