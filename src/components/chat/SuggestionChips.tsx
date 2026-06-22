'use client';

import { motion } from 'motion/react';
import {
  FileText,
  Database,
  Sparkles,
  Share2,
  type LucideIcon,
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';

interface Suggestion {
  icon: LucideIcon;
  titleKey: 'chatSuggestionWritingTitle' | 'chatSuggestionAnalysisTitle' | 'chatSuggestionOptimizeTitle' | 'chatSuggestionPublishTitle';
  descKey: 'chatSuggestionWritingDesc' | 'chatSuggestionAnalysisDesc' | 'chatSuggestionOptimizeDesc' | 'chatSuggestionPublishDesc';
}

interface SuggestionChipsProps {
  onSelect: (text: string) => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const },
  },
} as const;

export default function SuggestionChips({ onSelect }: SuggestionChipsProps) {
  const { t, cls } = useTheme();

  const suggestions: Suggestion[] = [
    {
      icon: FileText,
      titleKey: 'chatSuggestionWritingTitle',
      descKey: 'chatSuggestionWritingDesc',
    },
    {
      icon: Database,
      titleKey: 'chatSuggestionAnalysisTitle',
      descKey: 'chatSuggestionAnalysisDesc',
    },
    {
      icon: Sparkles,
      titleKey: 'chatSuggestionOptimizeTitle',
      descKey: 'chatSuggestionOptimizeDesc',
    },
    {
      icon: Share2,
      titleKey: 'chatSuggestionPublishTitle',
      descKey: 'chatSuggestionPublishDesc',
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full"
    >
      {suggestions.map((item) => (
        <motion.button
          key={item.titleKey}
          variants={itemVariants}
          whileHover={{ y: -2, transition: { duration: 0.15 } }}
          whileTap={{ scale: 0.99 }}
          onClick={() => onSelect(t[item.descKey])}
          className={cn(
            'flex items-start gap-3.5 p-3.5 text-left rounded-2xl border transition-colors duration-200',
            cls(
              'bg-white border-gray-200/60 hover:border-[#F37021]/35 hover:bg-gray-50/40',
              'bg-[#1c1c1f]/40 border-white/[0.06] hover:border-[#F37021]/35 hover:bg-[#1c1c1f]/60'
            )
          )}
        >
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#F37021]/8 text-[#F37021] shrink-0">
            <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </span>
          <div className="min-w-0 pt-0.5">
            <p className={cn('font-semibold text-sm', cls('text-gray-900', 'text-white'))}>
              {t[item.titleKey]}
            </p>
            <p className="text-sm text-muted-foreground mt-0.5 leading-relaxed">
              {t[item.descKey]}
            </p>
          </div>
        </motion.button>
      ))}
    </motion.div>
  );
}
