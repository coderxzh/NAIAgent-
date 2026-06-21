import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '@/hooks/use-theme';
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
} from '@/components/ai-elements/conversation';
import {
  Message,
  MessageContent,
  MessageResponse,
} from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputFooter,
  PromptInputTools,
  PromptInputButton,
} from '@/components/ai-elements/prompt-input';
import {
  MessageSquare,
  PenLine,
  Terminal,
  Image as ImageIcon,
  BookOpen,
  Plus,
  X,
  ChevronDown,
  Mic,
  Check,
} from 'lucide-react';
import type { UploadedFile, ChatMessage } from '@/lib/file-upload';
import { getFileIconAndColor, formatFileSize } from '@/lib/file-upload';

interface ChatInterfaceProps {
  /** 外部传入的已上传文件列表 */
  uploadedFiles?: UploadedFile[];
  /** 当文件被移除时的回调 */
  onRemoveFile?: (id: string) => void;
  /** 当新文件被上传时的回调 */
  onFileUpload?: (files: UploadedFile[]) => void;
  /** 当前选中的团队/项目 */
  selectedTeam?: string;
  /** 团队切换回调 */
  onTeamChange?: (team: string) => void;
  /** 可选的团队列表 */
  teamList?: string[];
  /** 获取团队颜色（用于圆点指示） */
  getTeamColor?: (name: string) => string;
  /** 当前选中的模型 */
  selectedModel?: string;
  /** 模型切换回调 */
  onModelChange?: (model: string) => void;
  /** 可选的模型列表 */
  modelList?: string[];
}

export default function ChatInterface({
  uploadedFiles: externalFiles,
  onRemoveFile,
  onFileUpload,
  selectedTeam: externalSelectedTeam,
  onTeamChange,
  teamList = [],
  getTeamColor = () => '#60a5fa',
  selectedModel: externalSelectedModel,
  onModelChange,
  modelList = ['豆包2.0', 'DeepSeek', 'Qwen3.5'],
}: ChatInterfaceProps) {
  const { t, cls, lang } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 内部状态（当外部未提供时使用）
  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [internalTeam, setInternalTeam] = useState(lang === 'zh' ? '成都行乐音改' : 'Thorafodi Web App');
  const [internalModel, setInternalModel] = useState('豆包2.0');
  const [showInspirationMenu, setShowInspirationMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);

  const uploadedFiles = externalFiles ?? internalFiles;
  const selectedTeam = externalSelectedTeam ?? internalTeam;
  const selectedModel = externalSelectedModel ?? internalModel;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  // 欢迎语和建议 chip 数据
  const suggestions = [
    { icon: PenLine, title: t.aiSuggestion1Title ?? '写作', desc: t.aiSuggestion1Desc ?? 'Your expert AI assistant for Writing.', iconColor: 'text-emerald-500 dark:text-emerald-400', bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
    { icon: Terminal, title: t.aiSuggestion2Title ?? '编程', desc: t.aiSuggestion2Desc ?? 'Your expert AI assistant for Programming.', iconColor: 'text-blue-500 dark:text-blue-400', bgClass: 'bg-blue-500/10 dark:bg-blue-500/20' },
    { icon: ImageIcon, title: t.aiSuggestion3Title ?? '图像生成', desc: t.aiSuggestion3Desc ?? 'Your expert AI assistant for Image generation.', iconColor: 'text-purple-500 dark:text-purple-400', bgClass: 'bg-purple-500/10 dark:bg-purple-500/20' },
    { icon: BookOpen, title: t.aiSuggestion4Title ?? '教育', desc: t.aiSuggestion4Desc ?? 'Your expert AI assistant for Education.', iconColor: 'text-orange-500 dark:text-orange-400', bgClass: 'bg-orange-500/10 dark:bg-orange-500/20' },
  ];

  // 模拟 AI 回复
  const simulateAIResponse = useCallback((userContent: string) => {
    setIsLoading(true);
    timeoutRef.current = setTimeout(() => {
      const responses: Record<string, string> = {
        zh: `收到您的消息："${userContent.substring(0, 50)}${userContent.length > 50 ? '...' : ''}"

我是 Voxle，您的个人 AI 助手。我可以帮您完成写作、编程、图像生成、教育辅导等各种任务。请随时告诉我您需要什么帮助。`,
        en: `Received your message: "${userContent.substring(0, 50)}${userContent.length > 50 ? '...' : ''}"

I'm Voxle, your personal AI assistant. I can help you with writing, programming, image generation, education, and much more. Let me know what you need!`,
      };
      const reply: ChatMessage = {
        id: `assistant_${Date.now()}`,
        role: 'assistant',
        content: responses[lang] ?? responses.en,
      };
      setMessages((prev) => [...prev, reply]);
      setIsLoading(false);
    }, 1200);
  }, [lang]);

  // 处理提交
  const handleSubmit = useCallback(
    (message: { text: string; files: unknown[] }) => {
      const text = message.text.trim();
      if (!text && uploadedFiles.length === 0) return;

      const userMsg: ChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');

      // 清除已选文件
      if (onFileUpload) {
        onFileUpload([]);
      } else {
        setInternalFiles([]);
      }

      // 模拟 AI 回复
      simulateAIResponse(text);
    },
    [uploadedFiles.length, simulateAIResponse, onFileUpload]
  );

  // 文件上传处理
  const handleFileUpload = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      const newFiles: UploadedFile[] = Array.from(files).map((file) => {
        const isImage = file.type.startsWith('image/');
        const url = isImage ? URL.createObjectURL(file) : undefined;
        if (url) {
          objectUrlsRef.current.add(url);
        }
        return {
          id: Math.random().toString(36).substring(2, 9),
          name: file.name,
          size: formatFileSize(file.size),
          type: file.type,
          url,
        };
      });

      if (onFileUpload) {
        onFileUpload(newFiles);
      } else {
        setInternalFiles((prev) => [...prev, ...newFiles]);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFileUpload]
  );

  // 移除文件
  const removeFile = useCallback(
    (id: string) => {
      const fileToRemove = uploadedFiles.find((f) => f.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
        objectUrlsRef.current.delete(fileToRemove.url);
      }
      if (onRemoveFile) {
        onRemoveFile(id);
      } else {
        setInternalFiles((prev) => prev.filter((f) => f.id !== id));
      }
    },
    [onRemoveFile, uploadedFiles]
  );

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputAreaRef.current && !inputAreaRef.current.contains(event.target as Node)) {
        setShowInspirationMenu(false);
        setShowModelMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 清理所有 object URLs
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  // 团队选择
  const handleTeamSelect = useCallback(
    (name: string) => {
      if (onTeamChange) {
        onTeamChange(name);
      } else {
        setInternalTeam(name);
      }
      setShowInspirationMenu(false);
    },
    [onTeamChange]
  );

  // 模型选择
  const handleModelSelect = useCallback(
    (model: string) => {
      if (onModelChange) {
        onModelChange(model);
      } else {
        setInternalModel(model);
      }
      setShowModelMenu(false);
    },
    [onModelChange]
  );

  return (
    <div className="flex flex-col flex-1 max-w-4xl mx-auto w-full relative xl:mt-[-40px]">
      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto w-full flex flex-col items-center justify-start select-none pt-[12vh] pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <Conversation>
          <ConversationContent>
            {messages.length === 0 ? (
              <>
                {/* 欢迎语 */}
                <div className="flex flex-col items-center justify-center mb-10">
                  <h2 className={`text-center font-serif font-bold tracking-tight mb-2 px-4 ${cls('text-gray-900', 'text-white')}`} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
                    {t.aiGreeting1 ?? (lang === 'zh' ? '很高兴见到您，Sajon。' : 'Good to see you, Sajon.')}
                  </h2>
                  <p className={`text-center font-medium mb-10 max-w-xl px-6 ${cls('text-gray-500', 'text-gray-400')}`} style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                    {t.aiGreeting2 ?? (lang === 'zh' ? 'Voxle是您的个人专家 AI 助手，几乎可以完成您能想象到的任何任务。' : 'Voxle your personal and expert AI assistant for pretty much any tasks you can imagine.')}
                  </p>

                  {/* 建议 chip */}
                  <div className="w-full flex flex-row flex-nowrap items-center justify-center gap-3 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {suggestions.map((item, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputText(item.desc);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                        className={`inline-flex items-center gap-3.5 pl-2 pr-6 py-2.5 min-w-[170px] rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer active:scale-95 ${cls(
                          'bg-white hover:bg-gray-50 border-gray-200/80 text-gray-700 shadow-2xs',
                          'bg-[#1c1c1f]/50 hover:bg-[#1c1c1f]/80 border-white/5 text-zinc-300'
                        )}`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bgClass}`}>
                          <item.icon className={`w-4 h-4 stroke-[2.5] ${item.iconColor}`} />
                        </span>
                        <span className="text-[14.5px] font-extrabold tracking-normal text-left">{item.title}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 空状态 */}
                <ConversationEmptyState
                  icon={<MessageSquare className="w-10 h-10" />}
                  title={t.newChat ?? (lang === 'zh' ? '新对话' : 'New Chat')}
                  description={t.chatPlaceholder ?? 'Describe your 3D object or scene...'}
                />
              </>
            ) : (
              <>
                {messages.map((msg) => (
                  <Message key={msg.id} from={msg.role}>
                    <MessageContent>
                      {msg.role === 'assistant' ? (
                        <MessageResponse>{msg.content}</MessageResponse>
                      ) : (
                        <p>{msg.content}</p>
                      )}
                    </MessageContent>
                  </Message>
                ))}
                {isLoading && (
                  <Message from="assistant">
                    <MessageContent>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.2s]" />
                        <div className="w-2 h-2 rounded-full bg-current animate-bounce [animation-delay:0.4s]" />
                      </div>
                    </MessageContent>
                  </Message>
                )}
              </>
            )}
          </ConversationContent>
        </Conversation>
      </div>

      {/* 输入区域 */}
      <div ref={inputAreaRef} className={`mt-auto relative z-10 w-full rounded-[24px] p-4 flex flex-col gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-colors backdrop-blur-3xl ${cls('bg-white/95', 'bg-[#18181b]/95')}`}>
        {/* Inspiration menu popup */}
        <AnimatePresence>
          {showInspirationMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute bottom-[56px] left-[70px] rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] text-[15px] font-semibold flex flex-col gap-1 w-[260px] max-h-[300px] overflow-y-auto origin-bottom-left backdrop-blur-2xl ${cls('bg-white/95', 'bg-[#27272a]/95')}`}
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {teamList.map((teamName) => (
                <button
                  key={teamName}
                  onClick={() => handleTeamSelect(teamName)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-2xl transition-colors ${cls('hover:bg-gray-100 text-gray-700', 'hover:bg-[#27272a] text-gray-300')} ${selectedTeam === teamName ? (cls('bg-gray-100 text-black', 'bg-[#3f3f46] text-white')) : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getTeamColor(teamName) }} />
                    <span className="truncate">{teamName}</span>
                  </div>
                  {selectedTeam === teamName && <Check className="w-4 h-4 shrink-0 transition-opacity" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Model menu popup */}
        <AnimatePresence>
          {showModelMenu && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={`absolute bottom-[56px] right-[124px] rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] text-[15px] font-semibold flex flex-col gap-1 w-[180px] origin-bottom-right backdrop-blur-2xl ${cls('bg-white/95', 'bg-[#27272a]/95')}`}
            >
              {modelList.map((model) => (
                <button
                  key={model}
                  onClick={() => handleModelSelect(model)}
                  className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-2xl transition-colors ${cls('hover:bg-gray-100 text-gray-700', 'hover:bg-[#27272a] text-gray-300')} ${selectedModel === model ? (cls('bg-gray-100 text-black', 'bg-[#3f3f46] text-white')) : ''}`}
                >
                  <span>{model}</span>
                  {selectedModel === model && <Check className="w-4 h-4" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Uploaded file preview chips */}
        {uploadedFiles.length > 0 && (
          <motion.div layout className="flex flex-wrap gap-2 px-3 pb-3 pt-1 border-b border-gray-100 dark:border-white/5">
            <AnimatePresence>
              {uploadedFiles.map((file) => {
                const isImage = file.type.startsWith('image/');
                const fileStyle = getFileIconAndColor(file.name, file.type, cls);
                return (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, scale: 0.85, y: 5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85, y: 5 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-center gap-2.5 p-1 rounded-[16px] text-xs font-semibold select-none group border transition-all ${fileStyle.bgColor} ${cls('text-gray-800', 'text-gray-200')}`}
                  >
                    <div className="flex items-center gap-2 max-w-[170px] sm:max-w-[220px]">
                      {isImage && file.url ? (
                        <img
                          src={file.url}
                          alt={file.name}
                          className="w-7 h-7 rounded-[10px] object-cover bg-gray-200 shadow-sm shrink-0"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 bg-white dark:bg-black/20 shadow-sm ${fileStyle.iconColor}`}>
                          <fileStyle.Icon className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex flex-col min-w-0 pr-1">
                        <span className="truncate text-[11px] leading-tight font-bold">{file.name}</span>
                        <span className="text-[9px] opacity-50 font-normal leading-tight">{file.size}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(file.id)}
                      className={`p-1 mr-0.5 rounded-full transition-colors ${cls('hover:bg-black/5 text-gray-400 hover:text-black', 'hover:bg-white/10 text-gray-400 hover:text-white')}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}

        {/* PromptInput */}
        <PromptInput
          onSubmit={handleSubmit}
          className="w-full"
        >
          <PromptInputTextarea
            placeholder={t.chatPlaceholder ?? 'Describe your 3D object or scene...'}
            value={inputText}
            onChange={(e) => setInputText(e.currentTarget.value)}
            ref={textareaRef}
          />

          <PromptInputFooter>
            <PromptInputTools>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                multiple
                onChange={handleFileUpload}
              />
              <PromptInputButton
                onClick={() => fileInputRef.current?.click()}
                tooltip={lang === 'zh' ? '添加文件' : 'Add files'}
              >
                <Plus className="w-5 h-5 shrink-0" />
              </PromptInputButton>

              <PromptInputButton
                onClick={() => {
                  setShowInspirationMenu(!showInspirationMenu);
                  setShowModelMenu(false);
                }}
                tooltip={lang === 'zh' ? '选择项目' : 'Select project'}
              >
                <span className="flex items-center gap-2 text-[15px] font-bold">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-scale-in" style={{ backgroundColor: getTeamColor(selectedTeam) }} />
                  <span className="max-w-[124px] truncate">{selectedTeam}</span>
                  <ChevronDown className="w-4 h-4 shrink-0 opacity-40 ml-1" />
                </span>
              </PromptInputButton>
            </PromptInputTools>

            <PromptInputTools>
              <PromptInputButton
                onClick={() => {
                  setShowModelMenu(!showModelMenu);
                  setShowInspirationMenu(false);
                }}
                tooltip={lang === 'zh' ? '选择模型' : 'Select model'}
              >
                <span className="text-[15px] font-bold">
                  {selectedModel} <ChevronDown className="w-4 h-4 shrink-0 opacity-40 ml-1 inline" />
                </span>
              </PromptInputButton>

              <PromptInputButton tooltip={lang === 'zh' ? '语音输入' : 'Voice input'}>
                <Mic className="w-5 h-5 shrink-0" />
              </PromptInputButton>

              <PromptInputSubmit
                status={isLoading ? 'submitted' : 'ready'}
                onStop={() => setIsLoading(false)}
              />
            </PromptInputTools>
          </PromptInputFooter>
        </PromptInput>
      </div>
    </div>
  );
}
