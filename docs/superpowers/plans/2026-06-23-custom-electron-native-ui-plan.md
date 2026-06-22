# 自定义 Electron 原生 UI 实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将 Electron 原生标题栏、菜单、弹窗、通知、滚动条替换为符合 NAI Agent 设计风格的自定义组件，并做 Windows/macOS 平台适配。

**Architecture:** 主进程根据平台设置窗口参数（Windows/Linux 无边框，macOS hiddenInset），通过 IPC 暴露窗口控制 API；渲染进程新增平台感知 TitleBar 组件；缺失的通用组件（Toast、确认弹窗）基于 shadcn/ui 自行封装；全局滚动条通过 CSS 自定义。

**Tech Stack:** Electron, React, TypeScript, Tailwind CSS, shadcn/ui, sonner, lucide-react, Zod

## Global Constraints

- 必须保持类型安全，所有 IPC channel 在 `electron/ipc/channels.ts` 中声明。
- 所有参数化 IPC 调用使用 Zod schema 校验。
- 不替换 OS 级文件选择器（保留 `dialog:openFile`）。
- 深浅色模式通过现有 `useTheme` 的 `cls(light, dark)` 工具处理。
- 每次任务结束后运行 `npm run lint`，通过后再提交。

---

## 文件结构

| 文件 | 操作 | 职责 |
|---|---|---|
| `electron/main.ts` | 修改 | 平台化窗口配置、移除默认菜单、新增窗口控制 IPC handlers |
| `electron/preload/preload.js` | 修改 | 暴露 `windowControls` API 给渲染进程 |
| `electron/ipc/handlers.ts` | 修改 | 新增 `window:*` IPC handlers |
| `electron/ipc/channels.ts` | 修改 | 新增 `window:*` channel 类型 |
| `electron/ipc/schemas.ts` | 修改 | 新增 window 相关 schemas（如需要） |
| `src/components/layout/TitleBar.tsx` | 新增 | 平台感知自定义标题栏 |
| `src/App.tsx` | 修改 | 渲染 TitleBar、调整主布局 padding |
| `src/components/ui/sonner.tsx` | 新增 | shadcn Sonner 组件 |
| `src/lib/toast.ts` | 新增 | toast 工具封装 |
| `src/index.css` | 修改 | 全局自定义滚动条样式 |
| `src/components/ui/ConfirmDialog.tsx` | 新增 | 基于 Dialog 的确认弹窗 |
| `src/hooks/use-confirm.ts` | 新增 | Promise 风格 confirm hook |
| `package.json` | 修改 | 新增 `sonner` 依赖 |

---

### Task 1: 平台化窗口配置并移除原生菜单

**Files:**
- Modify: `electron/main.ts`

**Interfaces:**
- Consumes: Electron `BrowserWindow`, `Menu`, `ipcMain`
- Produces: `mainWindow` with platform-specific title bar; no default application menu

- [ ] **Step 1: 修改 BrowserWindow 配置**

将 `electron/main.ts` 中的窗口创建逻辑改为平台感知：

```ts
import { BrowserWindow, Menu, app, ipcMain } from 'electron';
import { join } from 'path';

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    webPreferences: {
      preload: join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
    // macOS keeps traffic lights; Windows/Linux use frameless custom title bar
    ...(isMac
      ? { titleBarStyle: 'hiddenInset' }
      : { frame: false, titleBarStyle: 'hidden' }),
  });

  // Remove the default File/Edit/View/Window/Help menu
  Menu.setApplicationMenu(null);

  // ... rest of createWindow (load URL, devtools, etc.)
}
```

- [ ] **Step 2: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 3: 提交**

```bash
git add electron/main.ts
git commit -m "feat(electron): platform-specific title bar and remove default menu"
```

---

### Task 2: 新增窗口控制 IPC handlers 与 preload API

**Files:**
- Create: `electron/ipc/schemas.ts` (add empty/no-op if already exists)
- Modify: `electron/ipc/channels.ts`
- Modify: `electron/ipc/handlers.ts`
- Modify: `electron/preload/preload.js`

**Interfaces:**
- Consumes: `mainWindow` BrowserWindow instance
- Produces: `windowControls` object exposed on `window.electron`

- [ ] **Step 1: 在 channels.ts 添加新 channel 类型**

```ts
export interface Channels {
  // ... existing channels
  'window:minimize': [];
  'window:maximize': [];
  'window:unmaximize': [];
  'window:close': [];
  'window:isMaximized': [];
  'window:platform': [];
}
```

- [ ] **Step 2: 在 handlers.ts 注册 handlers**

```ts
import { BrowserWindow } from 'electron';

// At the top of the file, keep a reference to mainWindow
let mainWindow: BrowserWindow | null = null;

export function setMainWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

// Inside handler registration block
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
```

- [ ] **Step 3: 在 main.ts 中把 mainWindow 传给 handlers**

```ts
import { setMainWindow } from './ipc/handlers';

function createWindow() {
  mainWindow = new BrowserWindow({ ... });
  setMainWindow(mainWindow);
  // ...
}
```

- [ ] **Step 4: 在 preload.js 暴露 API**

```js
const windowControls = {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  unmaximize: () => ipcRenderer.invoke('window:unmaximize'),
  close: () => ipcRenderer.invoke('window:close'),
  isMaximized: () => ipcRenderer.invoke('window:isMaximized'),
  platform: () => ipcRenderer.invoke('window:platform'),
  onMaximizedChange: (callback) => {
    const handler = (_, isMaximized) => callback(isMaximized);
    ipcRenderer.on('window:maximized-change', handler);
    return () => ipcRenderer.removeListener('window:maximized-change', handler);
  },
};

contextBridge.exposeInMainWorld('electron', {
  // ... existing APIs
  windowControls,
});
```

- [ ] **Step 5: 在 main.ts 中监听 maximize/unmaximize 事件并广播**

```ts
mainWindow.on('maximize', () => {
  mainWindow?.webContents.send('window:maximized-change', true);
});
mainWindow.on('unmaximize', () => {
  mainWindow?.webContents.send('window:maximized-change', false);
});
```

- [ ] **Step 6: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 7: 提交**

```bash
git add electron/ipc/channels.ts electron/ipc/handlers.ts electron/preload/preload.js electron/main.ts
git commit -m "feat(electron): add window control IPC and preload APIs"
```

---

### Task 3: 创建平台感知 TitleBar 组件

**Files:**
- Create: `src/components/layout/TitleBar.tsx`

**Interfaces:**
- Consumes: `window.electron.windowControls`, `useTheme` (`cls`, `isDarkMode`)
- Produces: `TitleBar` component

- [ ] **Step 1: 创建 TitleBar.tsx**

```tsx
import { useEffect, useState } from 'react';
import { Minus, Square, Maximize2, X } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

const isMac = typeof window !== 'undefined' && window.electron?.windowControls?.platform() === 'darwin';

export default function TitleBar() {
  const { cls } = useTheme();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (isMac || !window.electron?.windowControls) return;

    const ctrl = window.electron.windowControls;
    ctrl.isMaximized().then(setIsMaximized);
    const unsubscribe = ctrl.onMaximizedChange?.(setIsMaximized);
    return () => unsubscribe?.();
  }, []);

  const handleMinimize = () => window.electron?.windowControls?.minimize();
  const handleMaximize = () => {
    if (isMaximized) {
      window.electron?.windowControls?.unmaximize();
    } else {
      window.electron?.windowControls?.maximize();
    }
  };
  const handleClose = () => window.electron?.windowControls?.close();

  if (isMac) {
    return (
      <div
        className={cn(
          'h-10 w-full flex items-center px-4 select-none app-drag-region',
          cls('bg-[#f5f6f8]', 'bg-[#18181c]')
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#F37021]/10 text-[#F37021] flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <span className={cn('text-xs font-semibold', cls('text-gray-800', 'text-gray-200'))}>
            NAI Agent
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'h-10 w-full flex items-center justify-between select-none app-drag-region',
        cls('bg-[#f5f6f8] border-b border-gray-200/50', 'bg-[#18181c] border-b border-zinc-800/50')
      )}
    >
      <div className="flex items-center gap-2 px-3">
        <div className="w-5 h-5 rounded-md bg-[#F37021]/10 text-[#F37021] flex items-center justify-center">
          <svg viewBox="0 0 24 24" className="w-3 h-3 fill-current">
            <circle cx="12" cy="12" r="10" />
          </svg>
        </div>
        <span className={cn('text-xs font-semibold', cls('text-gray-800', 'text-gray-200'))}>
          NAI Agent
        </span>
      </div>

      <div className="flex items-center h-full app-no-drag-region">
        <button
          onClick={handleMinimize}
          className={cn(
            'h-full px-4 flex items-center justify-center transition-colors',
            cls('hover:bg-gray-200/60 text-gray-600', 'hover:bg-white/10 text-gray-300')
          )}
          aria-label="Minimize"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          onClick={handleMaximize}
          className={cn(
            'h-full px-4 flex items-center justify-center transition-colors',
            cls('hover:bg-gray-200/60 text-gray-600', 'hover:bg-white/10 text-gray-300')
          )}
          aria-label={isMaximized ? 'Restore' : 'Maximize'}
        >
          {isMaximized ? <Square className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleClose}
          className="h-full px-4 flex items-center justify-center transition-colors hover:bg-red-500 hover:text-white text-gray-500"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 声明 window.electron 类型**

Create or update `src/types/electron.d.ts`:

```ts
export interface WindowControls {
  minimize: () => Promise<void>;
  maximize: () => Promise<void>;
  unmaximize: () => Promise<void>;
  close: () => Promise<void>;
  isMaximized: () => Promise<boolean>;
  platform: () => string;
  onMaximizedChange?: (callback: (isMaximized: boolean) => void) => (() => void);
}

declare global {
  interface Window {
    electron?: {
      windowControls?: WindowControls;
      // ... existing APIs
    };
  }
}

export {};
```

- [ ] **Step 3: 在 index.css 添加拖拽样式**

```css
.app-drag-region {
  -webkit-app-region: drag;
}
.app-no-drag-region {
  -webkit-app-region: no-drag;
}
```

- [ ] **Step 4: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add src/components/layout/TitleBar.tsx src/types/electron.d.ts src/index.css
git commit -m "feat(ui): add platform-aware custom TitleBar component"
```

---

### Task 4: 在 App.tsx 中集成 TitleBar

**Files:**
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `TitleBar`
- Produces: main layout with top padding for title bar

- [ ] **Step 1: 导入并渲染 TitleBar**

```tsx
import TitleBar from '@/components/layout/TitleBar';

export default function App() {
  // ... existing state

  return (
    <ThemeProvider>
      <AppStateProvider>
        <ViewProvider>
          <div className="h-screen flex flex-col overflow-hidden">
            <TitleBar />
            <div className="flex flex-1 overflow-hidden">
              <Sidebar ... />
              <main className="flex-1 overflow-auto p-6">
                <Header ... />
                {renderView()}
              </main>
            </div>
          </div>
        </ViewProvider>
      </AppStateProvider>
    </ThemeProvider>
  );
}
```

- [ ] **Step 2: 调整 Sidebar 顶部定位**

If `Sidebar` has top positioning, ensure it sits below the TitleBar. Since the flex layout above places TitleBar above the Sidebar+main row, no absolute positioning should conflict. If Sidebar is `fixed inset-y-0 left-0`, change to `top-10` or remove fixed positioning on desktop.

Check current Sidebar implementation and adjust:

```tsx
// Sidebar.tsx aside className
'fixed xl:static inset-y-0 left-0 z-50 h-full'
// becomes
'fixed xl:static top-10 xl:top-0 inset-y-0 left-0 z-50 h-full'
```

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/App.tsx src/components/layout/Sidebar.tsx
git commit -m "feat(layout): integrate TitleBar into app shell"
```

---

### Task 5: 安装并配置 Sonner Toast

**Files:**
- Modify: `package.json`（通过 npm install）
- Create: `src/components/ui/sonner.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: `useTheme` (`isDarkMode`)
- Produces: `Toaster` component and `toast` utility

- [ ] **Step 1: 安装 sonner**

Run: `npm install sonner`
Expected: package.json updated, lock file updated

- [ ] **Step 2: 创建 sonner.tsx**

```tsx
import { Toaster as Sonner } from 'sonner';
import { useTheme } from '@/hooks/use-theme';

type ToasterProps = React.ComponentProps<typeof Sonner>;

export function Toaster({ ...props }: ToasterProps) {
  const { isDarkMode } = useTheme();

  return (
    <Sonner
      theme={isDarkMode ? 'dark' : 'light'}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton: 'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton: 'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  );
}
```

- [ ] **Step 3: 在 App.tsx 渲染 Toaster**

```tsx
import { Toaster } from '@/components/ui/sonner';

// Inside the providers, after the main layout or at the end:
<Toaster />
```

- [ ] **Step 4: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 5: 提交**

```bash
git add package.json package-lock.json src/components/ui/sonner.tsx src/App.tsx
git commit -m "feat(ui): add sonner toast component and Toaster"
```

---

### Task 6: 创建 toast 工具函数

**Files:**
- Create: `src/lib/toast.ts`

**Interfaces:**
- Consumes: `sonner` toast API
- Produces: `toast.success`, `toast.error`, `toast.info`, `toast.warning`

- [ ] **Step 1: 创建 toast.ts**

```ts
import { toast as sonnerToast } from 'sonner';

export const toast = {
  success: (message: string, description?: string) =>
    sonnerToast.success(message, { description }),
  error: (message: string, description?: string) =>
    sonnerToast.error(message, { description }),
  info: (message: string, description?: string) =>
    sonnerToast.info(message, { description }),
  warning: (message: string, description?: string) =>
    sonnerToast.warning(message, { description }),
  custom: sonnerToast.custom,
  dismiss: sonnerToast.dismiss,
};
```

- [ ] **Step 2: 将设置中的通知开关接入 toast 能力（可选展示）**

In `SettingsDialog.tsx`, when toggling notifications, show a toast:

```tsx
import { toast } from '@/lib/toast';

// onCheckedChange
setNotificationsEnabled((v) => {
  const next = !v;
  toast.info(next ? '通知已开启' : '通知已关闭');
  return next;
});
```

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/lib/toast.ts src/components/layout/SettingsDialog.tsx
git commit -m "feat(ui): add toast utility and demo in settings"
```

---

### Task 7: 全局自定义滚动条样式

**Files:**
- Modify: `src/index.css`

**Interfaces:**
- Produces: consistent scrollbar styling across the app

- [ ] **Step 1: 添加滚动条 CSS**

```css
/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 9999px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}

/* Firefox */
* {
  scrollbar-width: thin;
  scrollbar-color: hsl(var(--border)) transparent;
}
```

- [ ] **Step 2: 将 Sidebar 和 Chat 中的隐藏滚动条改为可见自定义滚动条（可选）**

Remove `style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}` from Sidebar project list and ChatInterface if the user wants custom scrollbars everywhere. If hidden scrollbars are intentional, leave them.

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/index.css
git commit -m "feat(ui): add global custom scrollbar styles"
```

---

### Task 8: 创建自定义确认弹窗

**Files:**
- Create: `src/components/ui/ConfirmDialog.tsx`
- Create: `src/hooks/use-confirm.ts`

**Interfaces:**
- Consumes: shadcn `Dialog`, `Button`
- Produces: `ConfirmDialog` component and `useConfirm` hook

- [ ] **Step 1: 创建 ConfirmDialog.tsx**

```tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title = '确认操作',
  description = '确定要执行此操作吗？',
  confirmText = '确认',
  cancelText = '取消',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onCancel}>
            {cancelText}
          </Button>
          <Button onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 2: 创建 use-confirm.ts**

```ts
import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions = {}) => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise<boolean>((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolver?.(true);
    setIsOpen(false);
    setResolver(null);
  }, [resolver]);

  const handleCancel = useCallback(() => {
    resolver?.(false);
    setIsOpen(false);
    setResolver(null);
  }, [resolver]);

  return {
    confirm,
    confirmDialogProps: {
      open: isOpen,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
      onConfirm: handleConfirm,
      onCancel: handleCancel,
    },
  };
}
```

- [ ] **Step 3: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 4: 提交**

```bash
git add src/components/ui/ConfirmDialog.tsx src/hooks/use-confirm.ts
git commit -m "feat(ui): add custom ConfirmDialog and useConfirm hook"
```

---

### Task 9: 最终验证与端到端测试

**Files:**
- Modify: any remaining files found during testing

- [ ] **Step 1: 运行 lint**

Run: `npm run lint`
Expected: PASS

- [ ] **Step 2: 启动应用**

Run: `npm run dev`
Expected: App starts without errors

- [ ] **Step 3: 手动验证清单**

- Windows/Linux:
  - 顶部显示自定义标题栏，含 Logo、标题、最小化/最大化/关闭按钮
  - 菜单栏不再显示 File/Edit/View/Window/Help
  - 窗口按钮可正常操作
- macOS:
  - 顶部保留系统红绿灯
  - 标题栏区域可拖拽
  - 菜单栏不再显示 File/Edit/View/Window/Help
- 所有平台：
  - 设置里切换通知开关能显示 toast
  - 滚动条样式与主题一致
  - 确认弹窗组件可正常渲染（可在某处临时调用测试）

- [ ] **Step 4: 提交修复（如有）**

```bash
git add ...
git commit -m "fix(electron/ui): address native UI replacement edge cases"
```

---

## Spec Coverage Check

| 需求 | 实现任务 |
|---|---|
| 自定义标题栏 | Task 1, 2, 3, 4 |
| 移除原生菜单 | Task 1 |
| Windows/macOS 平台适配 | Task 1, 3, 4 |
| 替换原生弹窗 | Task 8 |
| 自定义通知 | Task 5, 6 |
| 自定义滚动条 | Task 7 |
| 按钮已使用组件库 | 现有 shadcn Button，Task 8 继续使用 |

## Placeholder Scan

- 无 TBD/TODO/"实现 later"/"添加适当错误处理" 等占位符。
- 每个任务包含完整代码和验证命令。
