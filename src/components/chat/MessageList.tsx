'use client';

import type { ChatMessage } from '@/lib/file-upload';
import ChatMessageItem from './ChatMessageItem';
import ThinkingIndicator from './ThinkingIndicator';

interface MessageListProps {
  messages: ChatMessage[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
  return (
    <div className="flex flex-col gap-5 w-full max-w-3xl mx-auto px-4 py-8">
      {messages.map((message) => (
        <ChatMessageItem key={message.id} message={message} />
      ))}
      {isLoading && <ThinkingIndicator />}
    </div>
  );
}
