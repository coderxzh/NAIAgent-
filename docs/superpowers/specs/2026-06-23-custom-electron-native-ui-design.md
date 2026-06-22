# 自定义 Electron 原生 UI 设计文档

> 目标：将 Electron 原生标题栏、菜单、弹窗、通知、滚动条替换为符合 NAI Agent 设计风格的自定义组件。

## 设计原则

- **平台适配**：Windows/Linux 使用无边框窗口 + React 自定义标题栏；macOS 保留系统红绿灯，仅做顶部拖拽区和品牌展示。
- **不重复造轮子**：优先使用已有的 shadcn/ui 组件（Dialog、DropdownMenu、ScrollArea、Button 等），缺失时基于现有组件库风格自行封装。
- **最小侵入**：改动集中在 `electron/main.ts`、preload、IPC handlers 和新增的布局组件，不影响业务逻辑。

## 方案概览

### 1. 窗口与标题栏

**electron/main.ts**
- 根据 `process.platform` 设置窗口参数：
  - `win32` / `linux`：`frame: false`
  - `darwin`：`titleBarStyle: 'hiddenInset'`
- 调用 `Menu.setApplicationMenu(null)` 移除默认 File/Edit/View/Window/Help 菜单。
- 新增 IPC handlers：`window:minimize`、`window:maximize`、`window:close`、`window:isMaximized`、`window:toggleMaximize`。

**preload/preload.js**
- 暴露安全的窗口控制 API：`windowControls.minimize()`、`windowControls.maximize()`、`windowControls.close()`、`windowControls.onMaximizedChange(callback)`。

**src/components/layout/TitleBar.tsx**（新增）
- 平台感知组件：
  - **Windows/Linux**：左侧显示 Logo + 标题，右侧是最小化、最大化/还原、关闭按钮，使用 Lucide 图标。
  - **macOS**：仅显示居左 Logo + 标题，顶部留出 `h-10` 的拖拽区域，不渲染窗口按钮（系统提供）。
- 支持深浅色模式，按钮 hover 使用当前主题色。
- 窗口最大化状态时，中间按钮在“最大化”和“还原”之间切换。

**集成**
- 在 `App.tsx` 最外层渲染 `<TitleBar />`，放在 `<Sidebar />` 和主内容之上。
- 主布局顶部增加 `pt-[env(titlebar-area-height, 40px)]` 或固定 `pt-10`，避免内容被标题栏遮挡。

### 2. 原生弹窗替换

当前仅有一个原生弹窗：`dialog:openFile`（文件选择）。

- **文件选择**：OS 级文件浏览器涉及文件系统遍历，短期内继续调用 Electron `dialog.showOpenDialogSync`，但会通过自定义 IPC 响应封装，后续若需要可接入自定义文件浏览器。
- **Alert / Confirm / Prompt**：目前没有使用场景。为此建立统一的自定义弹窗系统，方便后续业务调用：
  - `src/components/ui/ConfirmDialog.tsx`：基于 shadcn `Dialog` 的确认/取消弹窗。
  - `src/hooks/use-confirm.ts`：提供 `confirm(message, options)` 的 Promise API。

### 3. 通知系统

目前没有原生通知。建立应用内 Toast 通知：

- **方案**：使用 `sonner`（shadcn 官方推荐的 toast 库）。
- **实现**：
  - 安装 `sonner`。
  - 新增 `src/components/ui/sonner.tsx`。
  - 在 `App.tsx` 中放置 `<Toaster />`。
  - 新增 `src/lib/toast.ts` 封装 `toast.success()`、`toast.error()`、`toast.info()`。
- 设置里的「通知」开关后续可接入是否显示 Toaster 或系统通知。

### 4. 滚动条

- **全局**：在 `src/index.css` 中定义 `::-webkit-scrollbar` 样式，使用 6px 宽度、圆角 thumb、与主题一致的轨道色。
- **局部**：对需要精细控制的区域（侧边栏项目列表、聊天区域）改用 shadcn `ScrollArea`。
- 保持当前隐藏滚动条的地方（如 Sidebar 项目列表）不变，只是用更统一的方式实现。

### 5. 按钮

- 当前已大量使用 shadcn `Button`。
- 额外检查是否有原生 `<button>` 或 Electron 默认按钮，统一替换。

## 文件变更清单

| 文件 | 操作 | 说明 |
|---|---|---|
| `electron/main.ts` | 修改 | 平台化窗口配置、移除默认菜单、新增窗口控制 IPC |
| `electron/preload/preload.js` | 修改 | 暴露 windowControls API |
| `electron/ipc/handlers.ts` | 修改 | 新增 window:* handlers |
| `electron/ipc/channels.ts` | 修改 | 新增 window:* channel 类型 |
| `src/components/layout/TitleBar.tsx` | 新增 | 平台感知自定义标题栏 |
| `src/App.tsx` | 修改 | 渲染 TitleBar、调整布局 padding |
| `src/components/ui/ConfirmDialog.tsx` | 新增 | 自定义确认弹窗 |
| `src/hooks/use-confirm.ts` | 新增 | confirm Promise API |
| `src/components/ui/sonner.tsx` | 新增 | shadcn Sonner 组件 |
| `src/lib/toast.ts` | 新增 | toast 封装 |
| `src/index.css` | 修改 | 全局自定义滚动条样式 |
| `package.json` | 修改 | 新增 `sonner` 依赖 |

## 验证计划

1. `npm run lint` 通过。
2. `npm run dev` 启动后：
   - Windows：顶部显示自定义标题栏，窗口控制按钮可用。
   - macOS：顶部无自定义按钮，系统红绿灯可见，可拖拽。
   - 菜单栏不再显示 File/Edit/View/Window/Help。
3. 调用 `toast.success('测试')` 能显示自定义通知。
4. 滚动条在需要时出现，样式与主题一致。

## 范围说明

- 不替换 OS 级文件选择器（保留原生 dialog:openFile）。
- 不实现系统级原生通知（先建立应用内 Toast）。
- 不改动业务页面内容，仅做应用壳层和基础组件替换。
