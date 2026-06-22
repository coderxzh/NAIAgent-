import { AnimatePresence, motion } from 'motion/react';
import { useView } from './context/ViewContext';
import LayoutShell from './components/layout/LayoutShell';
import DashboardView from './components/dashboard/DashboardView';
import ChatInterface from './components/chat/ChatInterface';
import PlaceholderView from './components/layout/PlaceholderView';
import ErrorBoundary from './components/ErrorBoundary';
import type { View } from './types/domain';

const viewComponents: Record<View, React.ComponentType> = {
  dashboard: DashboardView,
  aiAgent: ChatInterface,
  drafts: PlaceholderView,
  autoLearning: PlaceholderView,
  aiWebBuilder: PlaceholderView,
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
