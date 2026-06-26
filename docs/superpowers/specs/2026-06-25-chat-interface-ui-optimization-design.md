# GEO Agent 智能 Agent 界面 UI 优化设计

日期：2026-06-25  
版本：v1.0  
关联文档：[GEO_Agent_开发文档.md](../../../GEO_Agent_开发文档.md)

---

## 1. 目标

优化智能 Agent 页面（`ChatInterface`）的用户体验，使其更符合 GEO Agent 的产品定位：

1. 移除左上角无意义的 "NAI Agent" 品牌文字。  
2. 输入框中移除模型切换下拉，改为只读 "Auto" 标签（模型路由由系统根据任务自动决定）。  
3. 将"新对话"和"历史记录"按钮移到左上角原品牌文字位置。  
4. 重构历史记录侧边栏：解决新建对话按钮与关闭按钮重叠问题，并增加搜索框、消息预览、时间分组、消息数徽章。

---

## 2. 范围

本次改动仅涉及前端 React 组件，不修改后端 IPC、数据库或服务层。

涉及文件：

- `src/components/chat/ChatInterface.tsx`
- `src/components/chat/ChatInput.tsx`
- `src/components/chat/ChatHistoryDrawer.tsx`
- `src/components/chat/ChatHistoryPanel.tsx`（新增）
- `src/lib/i18n.ts`（可能新增/复用 i18n 键）

---

## 3. 设计决策

### 3.1 方案选择

采用"方案 A：组件拆分 + 前端本地计算"。

理由：

- 不改动后端，范围可控。
- 将 `ChatHistoryDrawer` 拆薄，搜索/分组/列表逻辑独立到新组件 `ChatHistoryPanel`，职责更清晰。
- 消息预览和消息数通过前端调用现有 `chatService.getMessages` 计算，后续可无缝替换为后端聚合接口。

### 3.2 左上角按钮区

`ChatInterface` 顶部当前已包含"新对话"和"历史记录"按钮。本次需确认并移除外层可能残留的 "NAI Agent" 标题（源头可能在 `Header` 或 `LayoutShell`），确保按钮区独占左上角。

布局：

```
┌─────────────────────────────────────────────────────┐
│ [+ 新对话] [历史记录]                                 │
│                                                     │
│                    聊天内容区域                      │
│                                                     │
├─────────────────────────────────────────────────────┤
│ [项目 ▼]  [Auto]              [发送]                │
└─────────────────────────────────────────────────────┘
```

### 3.3 输入框模型选择

将 `ChatInput` 中的 `<PromptInputSelect>` 模型下拉替换为只读标签：

```tsx
<div className="rounded-full h-9 px-3 flex items-center gap-2 text-sm font-medium text-muted-foreground bg-black/5 dark:bg-white/10">
  Auto
</div>
```

- 不可点击、无下拉选项。
- `selectedModel` / `onModelChange` / `modelList` props 可保留以保持接口兼容，但内部不再使用。
- 项目选择器保持不变。

### 3.4 历史记录侧边栏结构

文件拆分：

- `ChatHistoryDrawer.tsx`：仅保留 Sheet 外壳和触发器。
- `ChatHistoryPanel.tsx`：新增，负责搜索、分组、列表、删除。

侧边栏内部结构：

```
┌────────────────────────────────────┐
│ 对话历史              [+ 新对话] [X] │
├────────────────────────────────────┤
│ 🔍 搜索对话...                      │
├────────────────────────────────────┤
│ 今天                               │
│ ┌────────────────────────────────┐ │
│ │ 会话标题           18:32    3  │ │
│ │ 最后一条消息预览文字...        │ │
│ └────────────────────────────────┘ │
│ 本周                               │
│ 更早                               │
└────────────────────────────────────┘
```

关键细节：

- 标题行右侧为"+ 新对话"按钮和 Sheet 自带关闭 X，二者分离，避免重叠。
- 搜索框实时过滤 `session.title` 和最近一条消息内容。
- 时间分组：今天 / 昨天 / 本周 / 本月 / 更早。
- 消息预览：取会话最近一条消息（assistant 或 user）前 60 字，无消息显示"（无消息）"。
- 消息数徽章：右上角小标签显示该会话消息总数。
- 当前会话高亮：保持现有橙色边框/背景风格。
- 删除按钮：hover 会话项时右侧出现垃圾桶，与现有行为一致。

---

## 4. 数据流

```
ChatInterface
├── 提供 sessions 列表给 ChatHistoryDrawer
├── ChatHistoryDrawer（Sheet 外壳）
│   └── ChatHistoryPanel
│       ├── 本地 state：searchQuery
│       ├── useEffect：对每条 session 调用 chatService.getMessages 获取消息
│       ├── 计算：filteredSessions、groupedSessions、previewMap、countMap
│       └── 渲染搜索框 + 分组列表
```

性能说明：

- 打开抽屉时批量查询消息，可能产生 N+1 请求。
- 当前会话数量预计较少（本地桌面应用），可接受。
- 后续优化方向：后端新增 `assistant:historySummary` 接口一次性返回摘要。

---

## 5. 样式约定

- 沿用现有 `cls()` 工具函数处理 light/dark 模式。
- 侧边栏宽度从 `320px/380px` 加宽到 `360px/400px`。
- 分组标题：`text-xs font-medium text-gray-500`。
- 消息数徽章：`bg-[#F37021]/10 text-[#F37021]`，小圆角。
- 会话项圆角、hover 效果与现有 shadcn/ui 风格一致。

---

## 6. i18n 键值

复用已有：

- `chatHistory`
- `chatNewSession`
- `chatHistoryEmpty`

可能新增：

- `chatHistorySearchPlaceholder`
- `chatHistoryToday`
- `chatHistoryYesterday`
- `chatHistoryThisWeek`
- `chatHistoryThisMonth`
- `chatHistoryEarlier`
- `chatHistoryNoMessages`

---

## 7. 验收标准

- [ ] 左上角不再显示 "NAI Agent"。
- [ ] 左上角显示"+ 新对话"和"历史记录"按钮，样式与截图参考一致。
- [ ] 输入框中模型选择区域显示只读 "Auto"，无下拉交互。
- [ ] 历史记录侧边栏内"+ 新对话"按钮与关闭 X 不重叠。
- [ ] 历史记录侧边栏包含搜索框。
- [ ] 历史记录按今天/昨天/本周/本月/更早分组。
- [ ] 每个会话项显示最近一条消息预览。
- [ ] 每个会话项显示消息数徽章。
- [ ] TypeScript 类型检查通过（`npm run lint`）。

---

## 8. 后续优化（不在本次范围）

- 后端新增 `assistant:historySummary` 接口，减少前端 N+1 查询。
- 为历史记录搜索增加防抖。
- 将消息预览长度做成可配置。
