import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/empty-state';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { useAppState } from '@/context/AppStateContext';
import { useView } from '@/context/ViewContext';
import { useTheme } from '@/hooks/use-theme';
import KbForm from './KbForm';
import type { KnowledgeBase } from '@/types/domain';
import { BookOpen, Plus, Pencil, Trash2, FileUp, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KbListProps {
  projectId: number;
}

export default function KbList({ projectId }: KbListProps) {
  const { cls, t } = useTheme();
  const { setCurrentKnowledgeBase } = useAppState();
  const { navigateTo } = useView();
  const [kbs, setKbs] = useState<KnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingKb, setEditingKb] = useState<KnowledgeBase | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await knowledgeBaseService.getByProject(projectId);
      setKbs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [projectId]);

  const handleDelete = async (kb: KnowledgeBase) => {
    if (!confirm(t.deleteKbConfirm.replace('{name}', kb.name))) return;
    await knowledgeBaseService.delete(kb.id);
    load();
  };

  const handleSelect = (kb: KnowledgeBase) => {
    setCurrentKnowledgeBase(kb);
    navigateTo('kbEntries', { kbId: kb.id });
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-40" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  if (kbs.length === 0) {
    return (
      <div className="p-6 flex-1 flex items-center justify-center">
        <EmptyState
          icon={<BookOpen className="w-10 h-10" />}
          title={t.noKbs}
          description={t.noKbsDesc}
          action={
            <Button
              onClick={() => {
                setEditingKb(null);
                setFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              {t.createKb}
            </Button>
          }
        />
        <KbForm
          open={formOpen}
          onOpenChange={setFormOpen}
          projectId={projectId}
          onSuccess={load}
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">{t.knowledgeBaseTitle}</h2>
        <Button
          onClick={() => {
            setEditingKb(null);
            setFormOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {t.createKb}
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {kbs.map((kb) => (
          <Card
            key={kb.id}
            className={cn(
              'p-5 transition-all hover:shadow-md',
              cls('bg-white', 'bg-[#1c1c1f]'),
            )}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#F37021]/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-[#F37021]" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{kb.name}</h3>
                  <p
                    className={cn(
                      'text-xs mt-0.5',
                      cls('text-gray-500', 'text-zinc-400'),
                    )}
                  >
                    {kb.description || '—'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingKb(kb);
                    setFormOpen(true);
                  }}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(kb)}
                  className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => {
                  setCurrentKnowledgeBase(kb);
                  navigateTo('kbIngest', { kbId: kb.id });
                }}
              >
                <FileUp className="w-3.5 h-3.5 mr-1.5" />
                录入
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleSelect(kb)}
              >
                <List className="w-3.5 h-3.5 mr-1.5" />
                资产
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <KbForm
        open={formOpen}
        onOpenChange={setFormOpen}
        projectId={projectId}
        kb={editingKb}
        onSuccess={load}
      />
    </div>
  );
}
