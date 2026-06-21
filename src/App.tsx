import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import LayoutShell from './components/layout/LayoutShell';
import DashboardView from './components/dashboard/DashboardView';
import ChatInterface from './components/chat/ChatInterface';
import PlaceholderView from './components/layout/PlaceholderView';
import type { View } from './components/layout/Sidebar';

const viewComponents: Record<View, React.ComponentType> = {
  dashboard: DashboardView,
  aiAgent: ChatInterface,
  drafts: PlaceholderView,
  autoLearning: PlaceholderView,
  aiWebBuilder: PlaceholderView,
};

export default function App() {
  const [activeView, setActiveView] = useState<View>('dashboard');

  const ActiveComponent = viewComponents[activeView];

  return (
    <LayoutShell activeView={activeView} onNavigate={setActiveView}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="flex-1"
        >
          <ActiveComponent />
        </motion.div>
      </AnimatePresence>
    </LayoutShell>
  );
}
