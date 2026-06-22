import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { useTheme } from '@/hooks/use-theme';
import type { KnowledgeBase } from '@/types/domain';

interface KbFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: number;
  kb?: KnowledgeBase | null;
  onSuccess: () => void;
}

export default function KbForm({
  open,
  onOpenChange,
  projectId,
  kb,
  onSuccess,
}: KbFormProps) {
  const { t } = useTheme();
  const [name, setName] = useState(kb?.name ?? '');
  const [description, setDescription] = useState(kb?.description ?? '');
  const [saving, setSaving] = useState(false);

  const isEdit = !!kb;
  const canSubmit = name.trim().length > 0 && !saving;

  useEffect(() => {
    if (open) {
      setName(kb?.name ?? '');
      setDescription(kb?.description ?? '');
    }
  }, [open, kb]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSaving(true);
    try {
      if (isEdit) {
        await knowledgeBaseService.update(kb.id, {
          name: name.trim(),
          description: description.trim() || null,
        });
      } else {
        await knowledgeBaseService.create({
          project_id: projectId,
          name: name.trim(),
          description: description.trim() || null,
        });
      }
      setName('');
      setDescription('');
      onSuccess();
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? t.editKb : t.createKb}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.kbName}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.kbName}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">{t.kbDescription}</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t.kbDescription}
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              取消
            </Button>
            <Button type="submit" disabled={!canSubmit}>
              {saving ? '保存中...' : '保存'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
