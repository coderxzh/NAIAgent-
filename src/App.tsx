import { AnimatePresence, motion } from 'motion/react';
import { useView } from './context/ViewContext';
import LayoutShell from './components/layout/LayoutShell';
import DashboardView from './components/dashboard/DashboardView';
import ChatInterface from './components/chat/ChatInterface';
import PlaceholderView from './components/layout/PlaceholderView';
import ErrorBoundary from './components/ErrorBoundary';
import ProjectList from './components/projects/ProjectList';
import KbList from './components/knowledge-base/KbList';
import KbIngestPanel from './components/knowledge-base/KbIngestPanel';
import KbEntriesList from './components/knowledge-base/KbEntriesList';
import type { View } from './types/domain';

function KbListWrapper() {
  const { viewParams } = useView();
  const projectId = viewParams.projectId as number | undefined;
  if (!projectId) return <PlaceholderView />;
  return <KbList projectId={projectId} />;
}

function KbIngestWrapper() {
  const { viewParams, navigateTo } = useView();
  const kbId = viewParams.kbId as number | undefined;
  if (!kbId) return <PlaceholderView />;
  return <KbIngestPanel kbId={kbId} onSuccess={() => navigateTo('kbEntries', { kbId })} />;
}

function KbEntriesWrapper() {
  const { viewParams } = useView();
  const kbId = viewParams.kbId as number | undefined;
  if (!kbId) return <PlaceholderView />;
  return <KbEntriesList kbId={kbId} />;
}

const viewComponents: Record<View, React.ComponentType> = {
  dashboard: DashboardView,
  aiAgent: ChatInterface,
  drafts: PlaceholderView,
  autoLearning: PlaceholderView,
  aiWebBuilder: PlaceholderView,
  projectList: ProjectList,
  kbList: KbListWrapper,
  kbIngest: KbIngestWrapper,
  kbEntries: KbEntriesWrapper,
};

export default function App() {
  const { activeView } = useView();
  const ActiveComponent = viewComponents[activeView];

  return (
    <LayoutShell>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <ErrorBoundary>
            <ActiveComponent />
          </ErrorBoundary>
        </motion.div>
      </AnimatePresence>
    </LayoutShell>
  );
}
