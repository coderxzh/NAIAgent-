'use client';

import { motion } from 'motion/react';
import { MessageResponse } from '@/components/ai-elements/message';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/file-upload';
import { FileText } from 'lucide-react';
import PendingFactChatCard from '../facts/PendingFactChatCard';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export default function ChatMessageItem({ message }: ChatMessageItemProps) {
  const { cls } = useTheme();
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] as const }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[88%] md:max-w-[78%]">
        {isUser ? (
          <div
            className={`
            px-4 py-2.5 rounded-2xl rounded-tr-sm
            text-[15px] leading-relaxed
            bg-[#F37021] text-white shadow-sm
          `}
          >
            {message.content}
          </div>
        ) : message.type === 'fact_review' && message.facts ? (
          <PendingFactChatCard content={message.content} facts={message.facts} />
        ) : (
          <div
            className={`
            px-4 py-2.5 rounded-2xl rounded-tl-sm border
            text-[15px] leading-relaxed
            ${cls(
              'bg-zinc-50/80 border-zinc-100 text-gray-900',
              'bg-zinc-900/40 border-white/[0.06] text-zinc-100',
            )}
          `}
          >
            <MessageResponse>{message.content}</MessageResponse>
          </div>
        )}

        {!isUser && message.sources && message.sources.length > 0 && message.type !== 'fact_review' && (
          <div className="mt-2 space-y-1">
            <p className={cls('text-xs text-gray-500', 'text-zinc-500')}>参考来源：</p>
            {message.sources.map((source, idx) => (
              <div
                key={source.chunkId}
                className={`
                  flex items-start gap-2 text-xs px-2 py-1.5 rounded-lg border
                  ${cls(
                    'bg-white border-gray-100 text-gray-600',
                    'bg-zinc-800/50 border-zinc-700/50 text-zinc-400',
                  )}
                `}
              >
                <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <span className="font-medium">[{idx + 1}] {source.entryTitle}</span>
                  <p className="truncate">{source.chunkText}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
