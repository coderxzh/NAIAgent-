# Chat Interface UI Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Optimize the AI Agent chat interface by removing the top-left "NAI Agent" brand text, replacing the chat input model selector with a read-only "Auto" label, keeping the New Chat / History buttons at the top-left of the chat area, and redesigning the chat history sidebar with search, message previews, time grouping, and message-count badges.

**Architecture:** Keep changes frontend-only. Remove the redundant brand text from the shared `Header`. Replace the model `<PromptInputSelect>` in `ChatInput` with a static label. Split the history drawer into a thin Sheet shell (`ChatHistoryDrawer`) and a new `ChatHistoryPanel` component that owns search, grouping, preview, and badge computation via local state and `chatService.getMessages`.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, shadcn/ui, `lucdn-react`, project `cls()` helper for light/dark switching, `cn()` for conditional classes.

## Global Constraints

- No backend, database, or IPC changes.
- No new dependencies.
- Preserve existing props/interfaces for backward compatibility.
- Use existing `useTheme` (`t`, `cls`) and `cn` helpers.
- All i18n copy must be added to both `zh` and `en` objects in `src/lib/i18n.ts`.
- Verify with `npm run lint` (`tsc --noEmit`) after code changes.
- The project has no frontend unit-test framework configured; verification is type-checking plus visual/manual checks.

---

### Task 1: Remove "NAI Agent" brand text from Header

**Files:**
- Modify: `src/components/layout/Header.tsx:14-35`

**Interfaces:**
- Consumes: `HeaderProps` (unchanged)
- Produces: `Header` component with mobile menu button and optional project subtitle only.

- [ ] **Step 1: Remove the brand `<span>`**

Replace the header left section so it keeps the mobile menu button and project subtitle, but removes the "NAI Agent" text.

```tsx
<header className="flex justify-between items-center mb-6">
  <div className="flex items-center gap-4">
    <button
      onClick={onOpenMobileMenu}
      aria-label={t.openMenu ?? 'Open menu'}
      className={cn(
        'xl:hidden p-2 rounded-lg',
        cls('hover:bg-gray-100 text-gray-600', 'hover:bg-[#3f3f46] text-gray-300')
      )}
    >
      <Menu className="w-6 h-6" />
    </button>
    {currentProject && (
      <span className="text-xs text-muted-foreground">
        {currentProject.name}
      </span>
    )}
  </div>
</header>
```

- [ ] **Step 2: Verify no leftover imports**

Ensure `Header.tsx` still imports `Menu`, `cn`, `useTheme`, and `useAppState` only.

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 2: Replace model selector with read-only "Auto" label in ChatInput

**Files:**
- Modify: `src/components/chat/ChatInput.tsx:267-281`

**Interfaces:**
- Consumes: `ChatInputProps` (keep `selectedModel`, `onModelChange`, `modelList` for compatibility but do not use them)
- Produces: `ChatInput` renders a static "Auto" pill where the model dropdown used to be.

- [ ] **Step 1: Remove PromptInputSelect import and usage**

Remove these imports from the `prompt-input` barrel:

```tsx
PromptInputSelect,
PromptInputSelectContent,
PromptInputSelectItem,
PromptInputSelectTrigger,
PromptInputSelectValue,
```

- [ ] **Step 2: Insert the static Auto pill**

Replace the existing `<PromptInputSelect>` block with a non-interactive label:

```tsx
<div className="rounded-full h-9 px-3 flex items-center gap-2 text-sm font-medium text-muted-foreground bg-black/5 dark:bg-white/10 select-none">
  Auto
</div>
```

Old block to remove:

```tsx
<PromptInputSelect value={selectedModel} onValueChange={onModelChange}>
  <PromptInputSelectTrigger
    aria-label={t.chatModelSelector}
    className="rounded-full h-9 px-3 gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
  >
    <PromptInputSelectValue />
  </PromptInputSelectTrigger>
  <PromptInputSelectContent position="popper" side="top" align="end" className="rounded-2xl p-2 min-w-[160px]">
    {modelList.map((model) => (
      <PromptInputSelectItem key={model} value={model} className="rounded-xl px-3 py-2.5">
        {model}
      </PromptInputSelectItem>
    ))}
  </PromptInputSelectContent>
</PromptInputSelect>
```

- [ ] **Step 3: Verify project selector is untouched**

The project dropdown (lines 231-263) must remain unchanged.

- [ ] **Step 4: Type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 3: Keep New Chat / History buttons at the top-left of the chat area

**Files:**
- Modify: `src/components/chat/ChatInterface.tsx:313-341`

**Interfaces:**
- Consumes: `handleNewChat`, `handleSelectSession`, `handleDeleteSession`, `sessions`, `currentChatSession`, `historyOpen`, `setHistoryOpen`, `t`
- Produces: Clean left-aligned top bar with no empty right-side justification.

- [ ] **Step 1: Simplify the top bar layout**

Change the top bar wrapper from `justify-between` (which leaves unused right-side space) to a simple left-aligned flex:

```tsx
<div className="flex items-center gap-2 pb-2">
  <Button
    variant="outline"
    size="sm"
    onClick={handleNewChat}
    className="gap-1"
  >
    <Plus className="w-4 h-4" />
    {t.chatNewSession}
  </Button>
  <ChatHistoryDrawer
    sessions={sessions}
    currentSessionId={currentChatSession?.id}
    onSelect={handleSelectSession}
    onNewChat={handleNewChat}
    onDelete={handleDeleteSession}
    open={historyOpen}
    onOpenChange={setHistoryOpen}
  >
    <Button variant="outline" size="sm" className="gap-1">
      <History className="w-4 h-4" />
      {t.chatHistory}
    </Button>
  </ChatHistoryDrawer>
</div>
```

- [ ] **Step 2: Remove unused `cn` import if it becomes unused**

If `cn` is no longer used in `ChatInterface.tsx`, remove its import. Otherwise keep it.

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 4: Create ChatHistoryPanel component

**Files:**
- Create: `src/components/chat/ChatHistoryPanel.tsx`

**Interfaces:**
- Consumes: `ChatSession`, `ChatMessage` from `src/types/domain`; `chatService.getMessages`; `useTheme` (`t`, `cls`); `Button`, `Input`, `ScrollArea`; `Search`, `History`, `Plus`, `Trash2` icons.
- Produces: `ChatHistoryPanel` with props:

```tsx
interface ChatHistoryPanelProps {
  sessions: ChatSession[];
  currentSessionId?: number | null;
  onSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onDelete?: (sessionId: number) => void;
}
```

- [ ] **Step 1: Write the component file**

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { History, Plus, Search, Trash2 } from 'lucide-react';
import type { ChatSession, ChatMessage } from '@/types/domain';
import { chatService } from '@/services/chatService';

interface ChatHistoryPanelProps {
  sessions: ChatSession[];
  currentSessionId?: number | null;
  onSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onDelete?: (sessionId: number) => void;
}

type GroupKey = 'today' | 'yesterday' | 'thisWeek' | 'thisMonth' | 'earlier';

function truncatePreview(text: string, max = 60): string {
  if (text.length <= max) return text;
  return text.slice(0, max) + '...';
}

export default function ChatHistoryPanel({
  sessions,
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
}: ChatHistoryPanelProps) {
  const { t, cls } = useTheme();
  const [query, setQuery] = useState('');
  const [messagesMap, setMessagesMap] = useState<Record<number, ChatMessage[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (sessions.length === 0) {
      setMessagesMap({});
      return;
    }
    setLoading(true);
    Promise.all(
      sessions.map((s) =>
        chatService.getMessages(s.id).then((msgs): [number, ChatMessage[]] => [s.id, msgs])
      )
    )
      .then((entries) => {
        if (cancelled) return;
        const map: Record<number, ChatMessage[]> = {};
        entries.forEach(([id, msgs]) => {
          map[id] = msgs;
        });
        setMessagesMap(map);
      })
      .catch(() => {
        if (!cancelled) setMessagesMap({});
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessions]);

  const { filteredSessions, previewMap, countMap } = useMemo(() => {
    const lower = query.trim().toLowerCase();
    const filtered = sessions.filter((s) => {
      if (!lower) return true;
      const msgs = messagesMap[s.id] ?? [];
      const last = msgs[msgs.length - 1];
      return (
        (s.title ?? '').toLowerCase().includes(lower) ||
        (last?.content ?? '').toLowerCase().includes(lower)
      );
    });

    const previewMap: Record<number, string> = {};
    const countMap: Record<number, number> = {};
    filtered.forEach((s) => {
      const msgs = messagesMap[s.id] ?? [];
      countMap[s.id] = msgs.length;
      const last = msgs[msgs.length - 1];
      previewMap[s.id] = truncatePreview(last?.content ?? t.chatHistoryNoMessages);
    });
    return { filteredSessions: filtered, previewMap, countMap };
  }, [sessions, messagesMap, query, t.chatHistoryNoMessages]);

  const groups = useMemo(() => {
    const map: Record<GroupKey, ChatSession[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      thisMonth: [],
      earlier: [],
    };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart);
    yesterdayStart.setDate(yesterdayStart.getDate() - 1);
    const weekStart = new Date(todayStart);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    filteredSessions.forEach((s) => {
      const d = new Date(s.created_at);
      if (d >= todayStart) map.today.push(s);
      else if (d >= yesterdayStart) map.yesterday.push(s);
      else if (d >= weekStart) map.thisWeek.push(s);
      else if (d >= monthStart) map.thisMonth.push(s);
      else map.earlier.push(s);
    });
    return map;
  }, [filteredSessions]);

  const groupLabels: Record<GroupKey, string> = {
    today: t.chatHistoryToday,
    yesterday: t.chatHistoryYesterday,
    thisWeek: t.chatHistoryThisWeek,
    thisMonth: t.chatHistoryThisMonth,
    earlier: t.chatHistoryEarlier,
  };

  const groupOrder: GroupKey[] = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'earlier'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 pr-8">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <History className="w-5 h-5 text-[#F37021]" />
          {t.chatHistory}
        </h2>
        <Button variant="outline" size="sm" onClick={onNewChat} className="gap-1">
          <Plus className="w-4 h-4" />
          {t.chatNewSession}
        </Button>
      </div>

      <div className="relative pb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={t.chatHistorySearchPlaceholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={cn(
            'pl-9 rounded-full',
            cls('bg-gray-100 border-transparent', 'bg-zinc-800 border-transparent')
          )}
        />
      </div>

      {sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center flex-1 py-12 text-center">
          <p className={cn('text-sm', cls('text-gray-500', 'text-zinc-400'))}>
            {t.chatHistoryEmpty}
          </p>
        </div>
      ) : (
        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="space-y-6">
            {groupOrder.map((key) => {
              const list = groups[key];
              if (list.length === 0) return null;
              return (
                <div key={key}>
                  <h3 className="text-xs font-medium text-gray-500 mb-2 px-1">
                    {groupLabels[key]}
                  </h3>
                  <div className="space-y-2">
                    {list.map((session) => {
                      const isActive = session.id === currentSessionId;
                      return (
                        <div
                          key={session.id}
                          onClick={() => onSelect(session)}
                          className={cn(
                            'group relative flex flex-col gap-1 p-3 rounded-xl cursor-pointer transition-colors border',
                            isActive
                              ? 'bg-[#F37021]/10 border-[#F37021]/20'
                              : cls(
                                  'hover:bg-gray-100 border-transparent',
                                  'hover:bg-zinc-800 border-transparent'
                                )
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm font-medium truncate flex-1">
                              {session.title || t.chatNewSession}
                            </p>
                            <span className="shrink-0 inline-flex items-center justify-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-[#F37021]/10 text-[#F37021]">
                              {countMap[session.id] ?? 0}
                            </span>
                          </div>
                          <p
                            className={cn(
                              'text-xs line-clamp-2',
                              cls('text-gray-500', 'text-zinc-400')
                            )}
                          >
                            {previewMap[session.id] || t.chatHistoryNoMessages}
                          </p>
                          {onDelete && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(session.id);
                              }}
                              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-opacity hover:bg-red-50 dark:hover:bg-red-950/20"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
            {groupOrder.every((k) => groups[k].length === 0) && !loading && (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {t.chatHistoryEmpty}
              </div>
            )}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Type-check the new component**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 5: Refactor ChatHistoryDrawer to use ChatHistoryPanel

**Files:**
- Modify: `src/components/chat/ChatHistoryDrawer.tsx`

**Interfaces:**
- Consumes: `ChatHistoryPanel` from Task 4; `Sheet`, `SheetContent`, `SheetTrigger`, `SheetTitle` from `@/components/ui/sheet`; `useTheme` (`t`, `cls`); `cn`.
- Produces: `ChatHistoryDrawer` as a thin Sheet shell; header/list logic moved to `ChatHistoryPanel`.

- [ ] **Step 1: Replace the drawer body with ChatHistoryPanel**

```tsx
'use client';

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import type { ChatSession } from '@/types/domain';
import ChatHistoryPanel from './ChatHistoryPanel';

interface ChatHistoryDrawerProps {
  sessions: ChatSession[];
  currentSessionId?: number | null;
  onSelect: (session: ChatSession) => void;
  onNewChat: () => void;
  onDelete?: (sessionId: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactNode;
}

export default function ChatHistoryDrawer({
  sessions,
  currentSessionId,
  onSelect,
  onNewChat,
  onDelete,
  open,
  onOpenChange,
  children,
}: ChatHistoryDrawerProps) {
  const { t, cls } = useTheme();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent
        className={cn(
          'w-[360px] sm:w-[400px] p-6',
          cls('bg-white', 'bg-[#1c1c1f]')
        )}
      >
        <SheetTitle className="sr-only">{t.chatHistory}</SheetTitle>
        <ChatHistoryPanel
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelect={onSelect}
          onNewChat={onNewChat}
          onDelete={onDelete}
        />
      </SheetContent>
    </Sheet>
  );
}
```

- [ ] **Step 2: Confirm overlap is fixed**

The `ChatHistoryPanel` header has `pr-8` to leave room for the Sheet close button. The Sheet close button and the "+ 新对话" button must not overlap.

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 6: Add i18n keys

**Files:**
- Modify: `src/lib/i18n.ts`

**Interfaces:**
- Consumes: existing `zh` / `en` objects.
- Produces: new translation keys used by `ChatHistoryPanel`.

- [ ] **Step 1: Add keys to the `zh` object**

After `chatNewSession: '新对话',` add:

```ts
chatHistorySearchPlaceholder: '搜索对话...',
chatHistoryToday: '今天',
chatHistoryYesterday: '昨天',
chatHistoryThisWeek: '本周',
chatHistoryThisMonth: '本月',
chatHistoryEarlier: '更早',
chatHistoryNoMessages: '（无消息）',
```

- [ ] **Step 2: Add keys to the `en` object**

After `chatNewSession: 'New chat',` add:

```ts
chatHistorySearchPlaceholder: 'Search chats...',
chatHistoryToday: 'Today',
chatHistoryYesterday: 'Yesterday',
chatHistoryThisWeek: 'This week',
chatHistoryThisMonth: 'This month',
chatHistoryEarlier: 'Earlier',
chatHistoryNoMessages: '(No messages)',
```

- [ ] **Step 3: Type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

---

### Task 7: Final integration and verification

**Files:**
- All files modified above.

- [ ] **Step 1: Run full type-check**

Run: `npm run lint`
Expected: no TypeScript errors.

- [ ] **Step 2: Manual verification checklist**

Open the AI Agent view (run `npm run dev` if needed) and verify:

1. Top-left no longer shows "NAI Agent".
2. "+ 新对话" and "历史记录" buttons are visible at the top-left of the chat area.
3. Chat input model selector shows read-only "Auto" with no dropdown.
4. Opening history shows a sidebar with:
   - "对话历史" title and "+ 新对话" button that do not overlap the X close button.
   - A search box at the top.
   - Sessions grouped under 今天 / 昨天 / 本周 / 本月 / 更早.
   - Each session shows a recent message preview.
   - Each session shows a message-count badge.
   - Current session still uses the orange highlight.
5. Searching filters by session title and last message content.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Header.tsx \
        src/components/chat/ChatInterface.tsx \
        src/components/chat/ChatInput.tsx \
        src/components/chat/ChatHistoryDrawer.tsx \
        src/components/chat/ChatHistoryPanel.tsx \
        src/lib/i18n.ts
git commit -m "feat(ui): optimize AI Agent chat interface

- Remove top-left NAI Agent brand text
- Replace model selector with read-only Auto label
- Clean top-left New Chat / History button layout
- Redesign history sidebar with search, previews, grouping, and message-count badges"
```

---

## Self-Review

**1. Spec coverage:**

| Spec Requirement | Implementing Task |
|---|---|
| Remove top-left "NAI Agent" brand text | Task 1 |
| Replace model dropdown with read-only "Auto" | Task 2 |
| New Chat / History buttons at top-left | Task 3 |
| History sidebar: fix overlapping New Chat and X | Task 5 (via `pr-8` in `ChatHistoryPanel` header) |
| History sidebar: search box | Task 4 |
| History sidebar: time grouping | Task 4 |
| History sidebar: message preview | Task 4 |
| History sidebar: message-count badge | Task 4 |
| TypeScript passes | Tasks 1-7 |

**2. Placeholder scan:**

- No "TBD", "TODO", "implement later".
- No vague "add error handling" steps.
- Every code step includes the actual code.

**3. Type consistency:**

- `ChatHistoryPanelProps` uses `ChatSession` from `src/types/domain`.
- `chatService.getMessages` returns `ChatMessage[]` and is used consistently.
- `messagesMap` keys are numbers matching `session.id`.
- New i18n keys are added to both languages before `ChatHistoryPanel` consumes them.

**4. Gap check:**

- The message-preview length is capped at 60 characters via `truncatePreview`, matching the design spec.
- Time grouping uses local time midnight boundaries (today/yesterday/this week/this month/earlier), matching the design spec.
- The project selector and file attachment UI in `ChatInput` are intentionally untouched.
