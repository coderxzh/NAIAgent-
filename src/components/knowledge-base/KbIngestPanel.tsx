import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { knowledgeBaseService } from '@/services/knowledgeBaseService';
import { dialogApi } from '@/lib/electron-api';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface KbIngestPanelProps {
  kbId: number;
  onSuccess: () => void;
}

export default function KbIngestPanel({ kbId, onSuccess }: KbIngestPanelProps) {
  const { cls, t } = useTheme();
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [filePath, setFilePath] = useState('');
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'ingesting' | 'success' | 'error'>('idle');

  const canSubmitText = title.trim() && content.trim() && status !== 'ingesting';
  const canSubmitFile = title.trim() && filePath && status !== 'ingesting';

  const handleTextSubmit = async () => {
    if (!canSubmitText) return;
    setStatus('ingesting');
    setProgress(30);
    try {
      await knowledgeBaseService.ingestText(kbId, title.trim(), content.trim());
      setProgress(100);
      setStatus('success');
      setTitle('');
      setContent('');
      onSuccess();
    } catch {
      setStatus('error');
    }
  };

  const handleFileSelect = async () => {
    const paths = await dialogApi.openFile({
      multiple: false,
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'md', 'markdown'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });
    if (paths && paths.length > 0) setFilePath(paths[0]);
  };

  const handleFileSubmit = async () => {
    if (!canSubmitFile) return;
    setStatus('ingesting');
    setProgress(20);
    try {
      await knowledgeBaseService.ingestFile(kbId, title.trim(), filePath);
      setProgress(100);
      setStatus('success');
      setTitle('');
      setFilePath('');
      onSuccess();
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold mb-4">{t.ingestTitle}</h2>
      <div className="mb-4">
        <label className="text-sm font-medium mb-1.5 block">{t.entryTitle}</label>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={t.entryTitle}
        />
      </div>
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'text' | 'file')}>
        <TabsList className="mb-4">
          <TabsTrigger value="text">{t.ingestTextTab}</TabsTrigger>
          <TabsTrigger value="file">{t.ingestFileTab}</TabsTrigger>
        </TabsList>
        <TabsContent value="text" className="space-y-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={t.ingestTextPlaceholder}
            rows={12}
          />
          <Button onClick={handleTextSubmit} disabled={!canSubmitText}>
            {status === 'ingesting' ? t.ingestProgress : t.ingestSubmit}
          </Button>
        </TabsContent>
        <TabsContent value="file" className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={filePath}
              readOnly
              placeholder={t.ingestFileSelect}
              className="flex-1"
            />
            <Button type="button" variant="outline" onClick={handleFileSelect}>
              {t.ingestFileSelect}
            </Button>
          </div>
          <p className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
            {t.ingestFileTypes}
          </p>
          <Button onClick={handleFileSubmit} disabled={!canSubmitFile}>
            {status === 'ingesting' ? t.ingestProgress : t.ingestSubmit}
          </Button>
        </TabsContent>
      </Tabs>
      {status === 'ingesting' && <Progress value={progress} className="mt-4" />}
      {status === 'success' && (
        <p className="mt-4 text-sm text-emerald-500">{t.ingestSuccess}</p>
      )}
      {status === 'error' && (
        <p className="mt-4 text-sm text-red-500">{t.ingestError}</p>
      )}
    </div>
  );
}
