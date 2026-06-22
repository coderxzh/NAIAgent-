'use client';

import { motion } from 'motion/react';
import { useTheme } from '@/hooks/use-theme';

export default function ThinkingIndicator() {
  const { t } = useTheme();

  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#F37021]"
            animate={{
              opacity: [0.35, 1, 0.35],
              scale: [0.9, 1.1, 0.9],
            }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              delay: i * 0.18,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{t.chatThinking}</span>
    </div>
  );
}
