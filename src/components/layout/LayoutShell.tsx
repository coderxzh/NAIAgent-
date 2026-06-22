import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/use-theme';
import { useView } from '../../context/ViewContext';
import Sidebar from './Sidebar';
import Header from './Header';
import TitleBar from './TitleBar';

interface LayoutShellProps {
  children: React.ReactNode;
}

export default function LayoutShell({ children }: LayoutShellProps) {
  const { cls } = useTheme();
  const { activeView, navigateTo } = useView();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn('h-[100dvh] w-full flex flex-col transition-colors duration-300', cls('bg-[#f4f4f5] text-[#191c1e]', 'bg-[#09090b] text-white'))}>
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeView={activeView}
          onNavigate={navigateTo}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <div className={cn('flex-1 flex flex-col pt-4 lg:pt-6 px-6 lg:px-12 w-full min-w-0 transition-colors', activeView === 'aiAgent' ? 'overflow-hidden pb-5 lg:pb-8' : 'overflow-y-auto pb-6 lg:pb-12', cls('bg-white', 'bg-[#131316]'))}>
          <Header onOpenMobileMenu={() => setMobileOpen(true)} />
          {children}
        </div>
      </div>
    </div>
  );
}
