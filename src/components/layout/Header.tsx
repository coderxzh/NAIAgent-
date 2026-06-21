import { Menu, Languages, Moon, Sun, Bell, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/use-theme';

interface HeaderProps {
  onOpenMobileMenu: () => void;
}

export default function Header({ onOpenMobileMenu }: HeaderProps) {
  const { isDarkMode, toggleDarkMode, lang, setLang, cls, t } = useTheme();

  return (
    <header className="flex justify-between items-center mb-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileMenu}
          aria-label={t.openMenu ?? 'Open menu'}
          className={cn(
            'xl:hidden p-2 rounded-lg',
            cls('hover:bg-gray-100 text-gray-600', 'hover:bg-[#3f3f46] text-gray-300')
          )}
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-sm font-medium text-muted-foreground">NAI Agent</span>
      </div>
      <div className="flex items-center gap-3">
        <button
          onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
          aria-label={t.toggleLanguage ?? 'Toggle language'}
          className={cn(
            'p-3 rounded-full',
            cls('bg-white text-gray-600', 'bg-[#18181b] text-gray-300')
          )}
        >
          <Languages className="h-5 w-5" />
        </button>
        <button
          onClick={toggleDarkMode}
          aria-label={t.toggleDarkMode ?? 'Toggle dark mode'}
          className={cn(
            'p-3 rounded-full',
            cls('bg-white text-gray-600', 'bg-[#18181b] text-gray-300')
          )}
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button
          aria-label={t.notifications ?? 'Notifications'}
          className={cn(
            'p-3 rounded-full',
            cls('bg-white text-gray-600', 'bg-[#18181b] text-gray-300')
          )}
        >
          <Bell className="h-5 w-5" />
        </button>
        <button
          aria-label={t.openSettings ?? 'Open settings'}
          className={cn(
            'p-3 rounded-full',
            cls('bg-white text-gray-600', 'bg-[#18181b] text-gray-300')
          )}
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
