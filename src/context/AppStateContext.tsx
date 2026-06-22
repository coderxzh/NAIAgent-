import { createContext, useContext, useMemo, useState } from 'react';
import type {
  ChatSession,
  GeoRun,
  KnowledgeBase,
  Project,
} from '../types/domain';

interface AppStateContextValue {
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;
  currentKnowledgeBase: KnowledgeBase | null;
  setCurrentKnowledgeBase: (kb: KnowledgeBase | null) => void;
  currentRun: GeoRun | null;
  setCurrentRun: (run: GeoRun | null) => void;
  currentChatSession: ChatSession | null;
  setCurrentChatSession: (session: ChatSession | null) => void;
  refreshProjects: number;
  triggerRefreshProjects: () => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: React.ReactNode }) {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [currentKnowledgeBase, setCurrentKnowledgeBase] =
    useState<KnowledgeBase | null>(null);
  const [currentRun, setCurrentRun] = useState<GeoRun | null>(null);
  const [currentChatSession, setCurrentChatSession] =
    useState<ChatSession | null>(null);
  const [refreshProjects, setRefreshProjects] = useState(0);

  const value = useMemo<AppStateContextValue>(
    () => ({
      currentProject,
      setCurrentProject,
      currentKnowledgeBase,
      setCurrentKnowledgeBase,
      currentRun,
      setCurrentRun,
      currentChatSession,
      setCurrentChatSession,
      refreshProjects,
      triggerRefreshProjects: () => setRefreshProjects((v) => v + 1),
    }),
    [currentProject, currentKnowledgeBase, currentRun, currentChatSession, refreshProjects],
  );

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within AppStateProvider');
  }
  return ctx;
}
