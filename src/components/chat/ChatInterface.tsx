'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import { useTheme } from '@/hooks/use-theme';
import type { UploadedFile, ChatMessage } from '@/lib/file-upload';
import { formatFileSize } from '@/lib/file-upload';
import { teams } from '@/lib/teams';
import WelcomeScreen from './WelcomeScreen';
import EmptyChatState from './EmptyChatState';
import MessageList from './MessageList';
import ChatInput from './ChatInput';

interface ChatInterfaceProps {
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (id: string) => void;
  onFileUpload?: (files: UploadedFile[]) => void;
  selectedTeam?: string;
  onTeamChange?: (team: string) => void;
  teamList?: string[];
  getTeamColor?: (name: string) => string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  modelList?: string[];
}

export default function ChatInterface({
  uploadedFiles: externalFiles,
  onRemoveFile,
  onFileUpload,
  selectedTeam: externalSelectedTeam,
  onTeamChange,
  teamList = teams.map((t) => t.name),
  getTeamColor = (name: string) => teams.find((t) => t.name === name)?.color ?? '#F37021',
  selectedModel: externalSelectedModel,
  onModelChange,
  modelList = ['豆包2.0', 'DeepSeek', 'Qwen3.5'],
}: ChatInterfaceProps) {
  const { lang } = useTheme();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [internalTeam, setInternalTeam] = useState(teams[0]?.name ?? '');
  const [internalModel, setInternalModel] = useState('豆包2.0');

  const uploadedFiles = externalFiles ?? internalFiles;
  const selectedTeam = externalSelectedTeam ?? internalTeam;
  const selectedModel = externalSelectedModel ?? internalModel;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const simulateAIResponse = useCallback(
    (userContent: string) => {
      setIsLoading(true);
      timeoutRef.current = setTimeout(() => {
        const responses: Record<string, string> = {
          zh: `收到您的消息："${userContent.substring(0, 50)}${userContent.length > 50 ? '...' : ''}"

我是 GEO Agent，您的企业 GEO 优化助手。我可以基于知识库帮您生成稿件、优化内容、分析可见性。请告诉我接下来想做什么。`,
          en: `Received your message: "${userContent.substring(0, 50)}${userContent.length > 50 ? '...' : ''}"

I'm GEO Agent, your enterprise GEO optimization assistant. I can generate drafts, optimize content, and analyze visibility based on your knowledge base. What would you like to do next?`,
        };
        const reply: ChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: responses[lang] ?? responses.en,
        };
        setMessages((prev) => [...prev, reply]);
        setIsLoading(false);
      }, 1200);
    },
    [lang],
  );

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

      if (onFileUpload) {
        onFileUpload([]);
      } else {
        setInternalFiles([]);
      }

      simulateAIResponse(text);
    },
    [uploadedFiles.length, simulateAIResponse, onFileUpload],
  );

  const handleFileUpload = useCallback(
    (newFiles: UploadedFile[]) => {
      newFiles.forEach((file) => {
        if (file.url) objectUrlsRef.current.add(file.url);
      });
      if (onFileUpload) {
        onFileUpload([...uploadedFiles, ...newFiles]);
      } else {
        setInternalFiles((prev) => [...prev, ...newFiles]);
      }
    },
    [onFileUpload, uploadedFiles],
  );

  const handleRemoveFile = useCallback(
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
    [onRemoveFile, uploadedFiles],
  );

  const handleTeamChange = useCallback(
    (team: string) => {
      if (onTeamChange) onTeamChange(team);
      else setInternalTeam(team);
    },
    [onTeamChange],
  );

  const handleModelChange = useCallback(
    (model: string) => {
      if (onModelChange) onModelChange(model);
      else setInternalModel(model);
    },
    [onModelChange],
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  const handleSuggestionSelect = useCallback(
    (text: string) => {
      setInputText(text);
    },
    [],
  );

  const showWelcome = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto"
    >
      <div
        className="flex-1 min-h-0 overflow-y-auto w-full flex flex-col"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {showWelcome ? (
          <WelcomeScreen onSuggestionSelect={handleSuggestionSelect} />
        ) : messages.length === 0 ? (
          <EmptyChatState />
        ) : (
          <Conversation>
            <ConversationContent>
              <MessageList messages={messages} isLoading={isLoading} />
            </ConversationContent>
          </Conversation>
        )}
      </div>

      <div className="w-full shrink-0 pt-1 pb-2">
        <ChatInput
          inputText={inputText}
          onInputChange={setInputText}
          onSubmit={handleSubmit}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          isLoading={isLoading}
          onStop={() => setIsLoading(false)}
          selectedTeam={selectedTeam}
          onTeamChange={handleTeamChange}
          teamList={teamList}
          getTeamColor={getTeamColor}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          modelList={modelList}
        />
      </div>
    </div>
  );
}
