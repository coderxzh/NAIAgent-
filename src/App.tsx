import { AnimatePresence, motion } from 'motion/react';
import { useView } from './context/ViewContext';
import { Toaster } from '@/components/ui/toaster';
import LayoutShell from './components/layout/LayoutShell';
import DashboardView from './components/dashboard/DashboardView';
import ChatInterface from './components/chat/ChatInterface';
import DraftsView from './components/drafts/DraftsView';
import AutoLearningView from './components/auto-learning/AutoLearningView';
import AiWebBuilderView from './components/ai-web-builder/AiWebBuilderView';
import ErrorBoundary from './components/ErrorBoundary';
import KbIngestPanel from './components/knowledge-base/KbIngestPanel';
import KbCreateView from './components/knowledge-base/KbCreateView';
import type { View } from './types/domain';

function KbIngestWrapper() {
  const { viewParams } = useView();
  const projectId = viewParams.projectId as number | undefined;
  if (!projectId) return <AiWebBuilderView />;
  return <KbIngestPanel projectId={projectId} />;
}

const viewComponents: Record<View, React.ComponentType> = {
  dashboard: DashboardView,
  aiAgent: ChatInterface,
  drafts: DraftsView,
  autoLearning: AutoLearningView,
  aiWebBuilder: AiWebBuilderView,
  kbIngest: KbIngestWrapper,
  kbCreate: KbCreateView,
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
      <Toaster />
    </LayoutShell>
  );
}
