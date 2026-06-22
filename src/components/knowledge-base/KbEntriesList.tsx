import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { useTheme } from '@/hooks/use-theme';
import type { KnowledgeEntry, KnowledgeEntryStatus } from '@/types/domain';
import { Trash2, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KbEntriesListProps {
  kbId: number;
}

const statusBadgeMap: Record<
  KnowledgeEntryStatus,
  { label: string; variant: 'default' | 'secondary' | 'destructive' }
> = {
  pending: { label: '待处理', variant: 'secondary' },
  indexed: { label: '已索引', variant: 'default' },
  failed: { label: '失败', variant: 'destructive' },
};

export default function KbEntriesList({ kbId }: KbEntriesListProps) {
  const { cls, t } = useTheme();
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await knowledgeBaseService.getEntries(kbId);
      setEntries(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [kbId]);

  const handleDelete = async (entry: KnowledgeEntry) => {
    if (!confirm(t.entryDeleteConfirm)) return;
    await knowledgeBaseService.deleteEntry(entry.id);
    load();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <EmptyState
          icon={<FileText className="w-10 h-10" />}
          title="暂无资产"
          description="使用录入面板添加文本或文件资料。"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-xl font-bold">{t.entriesTitle}</h2>
      <div className="space-y-2">
        {entries.map((entry) => {
          const status = statusBadgeMap[entry.status] ?? {
            label: entry.status,
            variant: 'secondary',
          };
          return (
            <Card
              key={entry.id}
              className={cn(
                'p-4 flex items-center justify-between',
                cls('bg-white', 'bg-[#1c1c1f]'),
              )}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-sm truncate">{entry.title}</h3>
                  <Badge variant={status.variant}>{status.label}</Badge>
                </div>
                <p className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
                  {entry.source_type === 'text'
                    ? '文本'
                    : entry.source_type === 'file'
                      ? `文件: ${entry.source_file_path}`
                      : '—'}{' '}
                  · {entry.created_at}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(entry)}>
                <Trash2 className="w-4 h-4 text-red-500" />
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
