import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/use-theme';
import Sidebar, { type View } from './Sidebar';
import Header from './Header';

interface LayoutShellProps {
  activeView: View;
  onNavigate: (view: View) => void;
  children: React.ReactNode;
}

export default function LayoutShell({ activeView, onNavigate, children }: LayoutShellProps) {
  const { cls } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn('h-[100dvh] w-full flex transition-colors duration-300', cls('bg-[#f4f4f5] text-[#191c1e]', 'bg-[#09090b] text-white'))}>
      {mobileOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 xl:hidden" onClick={() => setMobileOpen(false)} />}
      <Sidebar activeView={activeView} onNavigate={onNavigate} collapsed={collapsed} onToggleCollapse={() => setCollapsed((v) => !v)} />
      <div className={cn('flex-1 overflow-y-auto pt-4 lg:pt-6 px-6 lg:px-12 pb-6 lg:pb-12 w-full min-w-0 transition-colors', cls('bg-white', 'bg-[#131316]'))}>
        <Header onOpenMobileMenu={() => setMobileOpen(true)} />
        {children}
      </div>
    </div>
  );
}
