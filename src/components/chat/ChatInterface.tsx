'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Conversation,
  ConversationContent,
} from '@/components/ai-elements/conversation';
import { useTheme } from '@/hooks/use-theme';
import { useAppState } from '@/context/AppStateContext';
import { chatService } from '@/services/chatService';
import { projectService } from '@/services/projectService';
import { agentTaskApi } from '@/lib/electron-api';
import type { UploadedFile, ChatMessage as UiChatMessage } from '@/lib/file-upload';
import type { ChatSession } from '@/types/domain';
import WelcomeScreen from './WelcomeScreen';
import EmptyChatState from './EmptyChatState';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import ChatHistoryDrawer from './ChatHistoryDrawer';
import { Button } from '@/components/ui/button';
import type { Project } from '@/types/domain';
import { Plus, History } from 'lucide-react';

interface ChatInterfaceProps {
  uploadedFiles?: UploadedFile[];
  onRemoveFile?: (id: string) => void;
  onFileUpload?: (files: UploadedFile[]) => void;
  selectedProject?: string;
  onProjectChange?: (project: string) => void;
  projectList?: Project[];
  getProjectColor?: (name: string) => string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  modelList?: string[];
}

export default function ChatInterface({
  uploadedFiles: externalFiles,
  onRemoveFile,
  onFileUpload,
  selectedProject: externalSelectedProject,
  onProjectChange,
  projectList: externalProjectList,
  getProjectColor = () => '#F37021',
  selectedModel: externalSelectedModel,
  onModelChange,
  modelList = ['豆包2.0', 'DeepSeek', 'Qwen3.5'],
}: ChatInterfaceProps) {
  const { lang, t, cls } = useTheme();
  const { currentProject, setCurrentProject, currentChatSession, setCurrentChatSession } = useAppState();
  const [messages, setMessages] = useState<UiChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [internalFiles, setInternalFiles] = useState<UploadedFile[]>([]);
  const [internalProject, setInternalProject] = useState('');
  const [internalModel, setInternalModel] = useState('豆包2.0');
  const [internalProjectList, setInternalProjectList] = useState<Project[]>([]);

  const uploadedFiles = externalFiles ?? internalFiles;
  const selectedProject = externalSelectedProject ?? internalProject;
  const selectedModel = externalSelectedModel ?? internalModel;
  const projectList = externalProjectList ?? internalProjectList;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());

  const loadSessions = useCallback(async () => {
    try {
      const data = await chatService.getSessions();
      setSessions(data);
    } catch {
      setSessions([]);
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: number) => {
    try {
      const data = await chatService.getMessages(sessionId);
      setMessages(
        data.map((m) => ({
          id: `msg_${m.id}`,
          role: m.role as 'user' | 'assistant',
          content: m.content,
          sources: undefined,
        })),
      );
    } catch {
      setMessages([]);
    }
  }, []);

  useEffect(() => {
    projectService.getAll().then((projects) => {
      setInternalProjectList(projects);
    }).catch(() => {
      setInternalProjectList([]);
    });
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (currentProject) {
      setInternalProject(currentProject.name);
    }
  }, [currentProject]);

  useEffect(() => {
    if (currentChatSession) {
      loadMessages(currentChatSession.id);
    } else {
      setMessages([]);
    }
  }, [currentChatSession, loadMessages]);

  const ensureSession = useCallback(
    async (firstMessageText: string): Promise<ChatSession> => {
      if (currentChatSession) return currentChatSession;
      const title = firstMessageText.slice(0, 30) || t.chatNewSession;
      const id = await chatService.createSession(title);
      const session: ChatSession = {
        id,
        title,
        session_type: 'public',
        created_at: new Date().toISOString(),
      };
      setCurrentChatSession(session);
      await loadSessions();
      return session;
    },
    [currentChatSession, loadSessions, setCurrentChatSession, t.chatNewSession],
  );

  const saveMessage = useCallback(
    async (sessionId: number, role: 'user' | 'assistant', content: string, model?: string) => {
      await chatService.addMessage({
        session_id: sessionId,
        project_id: currentProject?.id ?? null,
        role,
        content,
        model: model ?? null,
      });
    },
    [currentProject],
  );

  const generateResponse = useCallback(
    async (sessionId: number, userContent: string) => {
      setIsLoading(true);
      try {
        const task = await agentTaskApi.run({
          sessionId: sessionId,
          projectId: currentProject?.id,
          title: userContent.slice(0, 80),
          userGoal: userContent,
        });

        let answer = 'Agent 未返回有效回答';
        if (task.status === 'completed') {
          const artifacts = await agentTaskApi.artifacts(task.id);
          const responseArtifact = (artifacts as Array<{artifact_type: string; content: string}>).find(
            (a) => a.artifact_type === 'agent_response',
          );
          answer = responseArtifact?.content ?? answer;
        } else if (task.status === 'failed') {
          answer = task.current_objective ?? '任务执行失败';
        }

        const reply: UiChatMessage = {
          id: `assistant_${Date.now()}`,
          role: 'assistant',
          content: answer,
        };
        await saveMessage(sessionId, 'assistant', answer);

        setMessages((prev) => [...prev, reply]);
      } finally {
        setIsLoading(false);
      }
    },
    [currentProject, saveMessage],
  );

  const handleSubmit = useCallback(
    async (message: { text: string; files: unknown[] }) => {
      const text = message.text.trim();
      if (!text && uploadedFiles.length === 0) return;

      const session = await ensureSession(text);

      const userMsg: UiChatMessage = {
        id: `user_${Date.now()}`,
        role: 'user',
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInputText('');

      await saveMessage(session.id, 'user', text);

      if (onFileUpload) {
        onFileUpload([]);
      } else {
        setInternalFiles([]);
      }

      await generateResponse(session.id, text);
    },
    [uploadedFiles.length, ensureSession, generateResponse, onFileUpload, saveMessage],
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

  const handleProjectChange = useCallback(
    (projectName: string) => {
      if (onProjectChange) {
        onProjectChange(projectName);
      } else {
        setInternalProject(projectName);
      }
      const project = projectList.find((p) => p.name === projectName);
      if (project) {
        setCurrentProject(project);
      }
    },
    [onProjectChange, projectList, setCurrentProject],
  );

  const handleModelChange = useCallback(
    (model: string) => {
      if (onModelChange) onModelChange(model);
      else setInternalModel(model);
    },
    [onModelChange],
  );

  const handleNewChat = useCallback(() => {
    setCurrentChatSession(null);
    setMessages([]);
    setInputText('');
  }, [setCurrentChatSession]);

  const handleSelectSession = useCallback(
    (session: ChatSession) => {
      setCurrentChatSession(session);
      setHistoryOpen(false);
    },
    [setCurrentChatSession],
  );

  const handleDeleteSession = useCallback(
    async (sessionId: number) => {
      await chatService.deleteSession(sessionId);
      if (currentChatSession?.id === sessionId) {
        setCurrentChatSession(null);
        setMessages([]);
      }
      await loadSessions();
    },
    [currentChatSession, loadSessions, setCurrentChatSession],
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
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto">
      <div className="flex items-center gap-2 pb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleNewChat}
          className="gap-1"
        >
          <Plus className="w-4 h-4" />
          {t.chatNewSession}
        </Button>
        <ChatHistoryDrawer
          sessions={sessions}
          currentSessionId={currentChatSession?.id}
          onSelect={handleSelectSession}
          onNewChat={handleNewChat}
          onDelete={handleDeleteSession}
          open={historyOpen}
          onOpenChange={setHistoryOpen}
        >
          <Button variant="outline" size="sm" className="gap-1">
            <History className="w-4 h-4" />
            {t.chatHistory}
          </Button>
        </ChatHistoryDrawer>
      </div>
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
          selectedProject={selectedProject}
          onProjectChange={handleProjectChange}
          projectList={projectList}
          getProjectColor={getProjectColor}
          selectedModel={selectedModel}
          onModelChange={handleModelChange}
          modelList={modelList}
        />
      </div>
    </div>
  );
}
