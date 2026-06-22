'use client';

import { motion } from 'motion/react';
import {
  MessageResponse,
} from '@/components/ai-elements/message';
import { useTheme } from '@/hooks/use-theme';
import type { ChatMessage } from '@/lib/file-upload';

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
          <div className={`
            px-4 py-2.5 rounded-2xl rounded-tr-sm
            text-[15px] leading-relaxed
            bg-[#F37021] text-white shadow-sm
          `}
          >
            {message.content}
          </div>
        ) : (
          <div className={`
            px-4 py-2.5 rounded-2xl rounded-tl-sm border
            text-[15px] leading-relaxed
            ${cls(
              'bg-zinc-50/80 border-zinc-100 text-gray-900',
              'bg-zinc-900/40 border-white/[0.06] text-zinc-100'
            )}
          `}
          >
            <MessageResponse>{message.content}</MessageResponse>
          </div>
        )}
      </div>
    </motion.div>
  );
}
