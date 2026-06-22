'use client';

import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/hooks/use-theme';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
  PromptInputSubmit,
  PromptInputSelect,
  PromptInputSelectContent,
  PromptInputSelectItem,
  PromptInputSelectTrigger,
  PromptInputSelectValue,
} from '@/components/ai-elements/prompt-input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  X,
  Image,
  Box,
  FileText,
  Send,
  FolderOpen,
  ChevronDown,
} from 'lucide-react';
import type { UploadedFile } from '@/lib/file-upload';
import { getFileIconAndColor, formatFileSize } from '@/lib/file-upload';

interface ChatInputProps {
  inputText: string;
  onInputChange: (value: string) => void;
  onSubmit: (message: { text: string; files: unknown[] }) => void;
  uploadedFiles: UploadedFile[];
  onFileUpload: (files: UploadedFile[]) => void;
  onRemoveFile: (id: string) => void;
  isLoading: boolean;
  onStop: () => void;
  selectedTeam: string;
  onTeamChange: (team: string) => void;
  teamList: string[];
  getTeamColor: (name: string) => string;
  selectedModel: string;
  onModelChange: (model: string) => void;
  modelList: string[];
}

export default function ChatInput({
  inputText,
  onInputChange,
  onSubmit,
  uploadedFiles,
  onFileUpload,
  onRemoveFile,
  isLoading,
  onStop,
  selectedTeam,
  onTeamChange,
  teamList,
  getTeamColor,
  selectedModel,
  onModelChange,
  modelList,
}: ChatInputProps) {
  const { t, cls } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const hasContent = inputText.trim().length > 0 || uploadedFiles.length > 0;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        140,
      )}px`;
    }
  }, [inputText]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file) => {
      const isImage = file.type.startsWith('image/');
      const url = isImage ? URL.createObjectURL(file) : undefined;
      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: formatFileSize(file.size),
        type: file.type,
        url,
      };
    });

    onFileUpload(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`
      w-full rounded-3xl border p-3 md:p-4 flex flex-col gap-2.5
      transition-colors duration-200
      ${cls(
        'bg-transparent border-gray-200/60 focus-within:border-[#F37021]/40',
        'bg-transparent border-white/[0.08] focus-within:border-[#F37021]/40'
      )}
    `}
    >
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        multiple
        onChange={handleFileChange}
      />

      {uploadedFiles.length > 0 && (
        <motion.div layout className="flex flex-wrap gap-2 px-0.5">
          <AnimatePresence>
            {uploadedFiles.map((file) => {
              const isImage = file.type.startsWith('image/');
              const fileStyle = getFileIconAndColor(file.name, file.type, cls);
              return (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, scale: 0.9, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 4 }}
                  transition={{ duration: 0.15 }}
                  className={`
                    flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl text-xs
                    border transition-colors
                    ${fileStyle.bgColor}
                    ${cls('text-gray-800', 'text-gray-200')}
                  `}
                >
                  {isImage && file.url ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-7 h-7 rounded-lg object-cover bg-gray-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-white/60 dark:bg-black/20 shrink-0">
                      <fileStyle.Icon className={`w-3.5 h-3.5 ${fileStyle.iconColor}`} />
                    </div>
                  )}
                  <div className="flex flex-col min-w-0">
                    <span className="truncate text-[11px] font-semibold leading-tight max-w-[120px] sm:max-w-[180px]">
                      {file.name}
                    </span>
                    <span className="text-[9px] opacity-50 font-normal leading-tight">{file.size}</span>
                  </div>
                  <button
                    onClick={() => onRemoveFile(file.id)}
                    className="p-1 rounded-full transition-colors hover:bg-black/5 dark:hover:bg-white/10 text-gray-400 hover:text-current"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <PromptInput
        onSubmit={onSubmit}
        className="w-full"
        inputGroupClassName="border-0 !bg-transparent dark:!bg-transparent shadow-none rounded-none has-[[data-slot=input-group-control]:focus-visible]:ring-0"
      >
        <PromptInputTextarea
          placeholder={t.chatPlaceholder}
          value={inputText}
          onChange={(e) => onInputChange(e.currentTarget.value)}
          ref={textareaRef}
          className="min-h-[44px] max-h-[140px] px-1 py-2 text-[15px] leading-relaxed !bg-transparent dark:!bg-transparent border-0 focus-visible:ring-0 placeholder:text-muted-foreground/50 resize-none"
        />

        <PromptInputFooter className="justify-between items-center pt-2">
          <PromptInputTools className="items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PromptInputButton
                  type="button"
                  tooltip={t.chatAttachFiles}
                  className="rounded-full size-10 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                >
                  <Plus className="w-5 h-5 shrink-0" strokeWidth={1.8} />
                </PromptInputButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-56 rounded-2xl p-2">
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"
                >
                  <Image className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-sm font-medium">{t.addPhotosOrVideos}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"
                >
                  <Box className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-sm font-medium">{t.add3DObjects}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"
                >
                  <FileText className="w-4 h-4 text-muted-foreground" strokeWidth={1.8} />
                  <span className="text-sm font-medium">{t.addFiles}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <PromptInputButton
                  type="button"
                  tooltip={t.chatProjectSelector}
                  className="rounded-full h-9 px-3 gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
                >
                  <FolderOpen className="w-4 h-4 shrink-0 text-[#F37021]" strokeWidth={1.8} />
                  <span className="text-sm font-medium max-w-[100px] truncate">
                    {selectedTeam || t.chatCurrentProject}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 shrink-0 opacity-50" strokeWidth={2} />
                </PromptInputButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" side="top" className="w-64 rounded-2xl p-2 max-h-[300px] overflow-y-auto">
                {teamList.map((teamName) => (
                  <DropdownMenuItem
                    key={teamName}
                    onClick={() => onTeamChange(teamName)}
                    className="rounded-xl px-3 py-2.5 gap-3 cursor-pointer"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: getTeamColor(teamName) }}
                    />
                    <span className="text-sm font-medium flex-1 truncate">{teamName}</span>
                    {selectedTeam === teamName && (
                      <span className="text-xs text-[#F37021] font-semibold">✓</span>
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </PromptInputTools>

          <PromptInputTools className="items-center gap-1.5">
            <PromptInputSelect value={selectedModel} onValueChange={onModelChange}>
              <PromptInputSelectTrigger
                aria-label={t.chatModelSelector}
                className="rounded-full h-9 px-3 gap-2 hover:bg-black/5 dark:hover:bg-white/10 text-muted-foreground transition-colors"
              >
                <PromptInputSelectValue />
              </PromptInputSelectTrigger>
              <PromptInputSelectContent position="popper" side="top" align="end" className="rounded-2xl p-2 min-w-[160px]">
                {modelList.map((model) => (
                  <PromptInputSelectItem key={model} value={model} className="rounded-xl px-3 py-2.5">
                    {model}
                  </PromptInputSelectItem>
                ))}
              </PromptInputSelectContent>
            </PromptInputSelect>

            <PromptInputSubmit
              status={isLoading ? 'submitted' : 'ready'}
              onStop={onStop}
              disabled={!hasContent && !isLoading}
              className={`
                rounded-full size-10 transition-all duration-200
                ${hasContent || isLoading
                  ? 'bg-[#F37021] text-white hover:bg-[#F37021]/90 shadow-sm'
                  : 'bg-transparent text-muted-foreground'}
              `}
            >
              <Send className="w-5 h-5" strokeWidth={1.8} />
            </PromptInputSubmit>
          </PromptInputTools>
        </PromptInputFooter>
      </PromptInput>
    </div>
  );
}
