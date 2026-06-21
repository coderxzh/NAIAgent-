import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '../../hooks/use-theme';
import StatCards from './StatCards';
import ActivityChart from './ActivityChart';
import ActionItemsPanel from './ActionItemsPanel';
import RecentActivityFeed from './RecentActivityFeed';
import QuickStartCards from './QuickStartCards';
import KbHealthPanel from './KbHealthPanel';
import { mockDashboardData } from './mock-data';

export default function DashboardView() {
  const { t, cls } = useTheme();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className={cn('text-3xl font-bold tracking-tight', cls('text-gray-900', 'text-white'))}>
          {t.greeting}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          随时掌控 GEO 优化进度与企业知识库状态。
        </p>
      </div>

      <StatCards stats={mockDashboardData.stats} loading={loading} />

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <ActivityChart data={mockDashboardData.trend} />
        </div>
        <ActionItemsPanel items={mockDashboardData.actions} loading={loading} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <RecentActivityFeed items={mockDashboardData.activities} loading={loading} />
        <QuickStartCards />
        <KbHealthPanel health={mockDashboardData.kbHealth} assets={mockDashboardData.kbAssets} loading={loading} />
      </div>
    </div>
  );
}
