'use client';

import { motion } from 'motion/react';
import { useTheme } from '@/hooks/use-theme';
import SuggestionChips from './SuggestionChips';

interface WelcomeScreenProps {
  onSuggestionSelect: (text: string) => void;
}

export default function WelcomeScreen({ onSuggestionSelect }: WelcomeScreenProps) {
  const { t, cls } = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as const }}
      className="flex flex-col items-center justify-center flex-1 w-full max-w-2xl mx-auto px-4 py-8"
    >
      <div className="text-center mb-8">
        <h1 className={`
          text-2xl md:text-3xl font-bold tracking-tight mb-2
          ${cls('text-gray-900', 'text-white')}
        `}
        >
          {t.chatWelcomeTitle}
        </h1>
        <p className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed">
          {t.chatWelcomeSubtitle}
        </p>
      </div>

      <SuggestionChips onSelect={onSuggestionSelect} />
    </motion.div>
  );
}
