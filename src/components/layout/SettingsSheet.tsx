import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import { cn } from '@/lib/utils';
import { Globe, Moon, Bell, Settings, Sparkles } from 'lucide-react';

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function SettingsSheet({ open, onOpenChange }: SettingsSheetProps) {
  const { t, isDarkMode, toggleDarkMode, lang, setLang, cls } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[360px] sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            {t.settings ?? '设置'}
          </SheetTitle>
          <SheetDescription>
            管理语言、主题、通知等应用偏好
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="general">{t.settingsGeneral ?? '通用'}</TabsTrigger>
            <TabsTrigger value="other">{t.settingsOther ?? '其他'}</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4 mt-4">
            {/* Language */}
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border',
                cls('bg-white border-gray-100', 'bg-[#1c1c1f] border-white/5'),
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/20 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.settingsLanguage ?? '语言'}</p>
                  <p className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
                    {lang === 'zh' ? '简体中文' : 'English'}
                  </p>
                </div>
              </div>
              <Select value={lang} onValueChange={(value) => setLang(value as 'zh' | 'en')}>
                <SelectTrigger className="w-28">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="zh">简体中文</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Dark Mode */}
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border',
                cls('bg-white border-gray-100', 'bg-[#1c1c1f] border-white/5'),
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-purple-50 dark:bg-purple-950/20 flex items-center justify-center">
                  <Moon className="w-4 h-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.settingsDarkMode ?? '深色模式'}</p>
                  <p className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
                    {isDarkMode ? '已开启' : '已关闭'}
                  </p>
                </div>
              </div>
              <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
            </div>

            <Separator />

            {/* Notifications */}
            <div
              className={cn(
                'flex items-center justify-between p-3 rounded-xl border',
                cls('bg-white border-gray-100', 'bg-[#1c1c1f] border-white/5'),
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-50 dark:bg-amber-950/20 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">{t.settingsNotifications ?? '通知'}</p>
                  <p className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
                    {notificationsEnabled ? '已开启' : '已关闭'}
                  </p>
                </div>
              </div>
              <Switch
                checked={notificationsEnabled}
                onCheckedChange={setNotificationsEnabled}
              />
            </div>
          </TabsContent>

          <TabsContent value="other" className="mt-4">
            <div
              className={cn(
                'p-6 rounded-xl border text-center',
                cls('bg-white border-gray-100', 'bg-[#1c1c1f] border-white/5'),
              )}
            >
              <Sparkles className={cn('w-8 h-8 mx-auto mb-3', cls('text-gray-400', 'text-zinc-500'))} />
              <p className="text-sm font-medium">更多设置即将到来</p>
              <p className={cn('text-xs mt-1', cls('text-gray-500', 'text-zinc-400'))}>
                模型选择、快捷键、数据管理等选项将在后续版本提供
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
