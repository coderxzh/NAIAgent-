import { LayoutDashboard, Settings, FileText, BookOpen, Globe, LogOut, ChevronRight, Plus, ChevronDown, X, PanelLeftClose } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../hooks/use-theme';
import { useState } from 'react';

export type View = 'dashboard' | 'aiAgent' | 'drafts' | 'autoLearning' | 'aiWebBuilder';

interface SidebarProps {
  activeView: View;
  onNavigate: (view: View) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const mainMenu: { id: View; icon: React.ComponentType<{ className?: string }>; labelKey: 'dashboard' | 'aiAgent' | 'drafts' | 'autoLearning' | 'aiWebBuilder' }[] = [
  { id: 'dashboard', icon: LayoutDashboard, labelKey: 'dashboard' },
  { id: 'aiAgent', icon: Settings, labelKey: 'aiAgent' },
  { id: 'drafts', icon: FileText, labelKey: 'drafts' },
  { id: 'autoLearning', icon: BookOpen, labelKey: 'autoLearning' },
  { id: 'aiWebBuilder', icon: Globe, labelKey: 'aiWebBuilder' },
];

const teamList = [
  { name: 'Thorafodi Web App', color: '#F37021' },
  { name: 'Corbe Mobile Application', color: '#f97316' },
  { name: 'Abuss Clothing Shop', color: '#2dd4bf' },
  { name: 'Bimjet Crypto Dashboard', color: '#3b82f6' },
  { name: 'Marketing', color: '#ef4444' },
  { name: 'Development', color: '#2dd4bf' },
  { name: 'Design System', color: '#f97316' },
  { name: 'Analytics Platform', color: '#7dd3fc' },
  { name: 'Customer Portal', color: '#2dd4bf' },
];

export default function Sidebar({ activeView, onNavigate, collapsed, onToggleCollapse, mobileOpen, onCloseMobile }: SidebarProps) {
  const { t, cls, lang } = useTheme();
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);

  const handleNavigate = (id: View) => {
    onNavigate(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 xl:hidden"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={cn(
          'fixed xl:static inset-y-0 left-0 z-50 h-full shrink-0 flex flex-col transition-all duration-300 ease-in-out border-r',
          cls('bg-[#f5f6f8] border-gray-200/50', 'bg-[#18181c] border-zinc-800/50'),
          collapsed ? 'xl:w-[88px] xl:px-3' : 'xl:w-[260px] xl:px-6',
          'w-[280px] px-6 py-8 xl:py-10',
          mobileOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'
        )}
      >
        {/* Logo + collapse */}
        <div
          className={cn(
            'flex items-center mb-10 px-2 transition-colors duration-300 relative',
            collapsed ? 'xl:justify-center xl:flex-col xl:gap-8' : 'justify-between'
          )}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#F37021]/10 text-[#F37021] flex items-center justify-center shrink-0 overflow-hidden relative">
              <div className="absolute bottom-0 w-6 h-6 bg-[#F37021] rounded-t-full flex items-end justify-center pb-1 gap-0.5">
                <span className="w-1 h-1 rounded-full bg-white opacity-40" />
                <span className="w-1 h-1 rounded-full bg-white opacity-70" />
                <span className="w-1 h-1 rounded-full bg-white opacity-100" />
              </div>
            </div>
            <div className={cn('flex items-start transition-all duration-300', cls('text-gray-900', 'text-white'))}>
              <span
                className={cn(
                  'font-black tracking-tight transition-all duration-300',
                  collapsed ? 'hidden xl:hidden' : 'text-[18px]'
                )}
                style={{ fontFamily: 'system-ui, sans-serif' }}
              >
                NAI Agent
              </span>
            </div>
          </div>

          <button
            aria-label={t.closeMenu ?? 'Close menu'}
            className={cn(
              'xl:hidden p-2 rounded-full shrink-0',
              cls('hover:bg-gray-200/50 text-gray-700', 'hover:bg-zinc-800 text-zinc-300')
            )}
            onClick={onCloseMobile}
          >
            <X className="w-5 h-5" />
          </button>

          <button
            aria-label={collapsed ? (t.expandSidebar ?? 'Expand sidebar') : (t.collapseSidebar ?? 'Collapse sidebar')}
            className={cn(
              'hidden xl:flex p-1.5 shrink-0 rounded-lg transition-colors shadow-xs absolute -right-[36px]',
              cls(
                'text-gray-400 border border-gray-200/60 hover:text-black bg-white hover:bg-gray-50',
                'text-gray-300 border border-zinc-700/80 hover:text-white bg-[#27272a] hover:bg-[#343438]'
              )
            )}
            onClick={onToggleCollapse}
          >
            {collapsed ? (
              <ChevronRight className="w-3.5 h-3.5" />
            ) : (
              <PanelLeftClose className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        <div className="flex-1 flex flex-col gap-8 min-h-0">
          {/* Main menu */}
          <div className="shrink-0">
            <h3
              className={cn(
                'text-[12px] font-medium mb-4 px-4 transition-colors duration-300 text-gray-500',
                collapsed ? 'xl:hidden' : ''
              )}
            >
              {lang === 'zh' ? '主菜单' : 'Main Menu'}
            </h3>
            <nav className="flex flex-col gap-1">
              {mainMenu.map(({ id, icon: Icon, labelKey }) => (
                <button
                  key={id}
                  onClick={() => handleNavigate(id)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl font-bold text-[14px] transition-colors',
                    activeView === id
                      ? cls(
                          'bg-white shadow-xs border border-gray-200/50 text-gray-900',
                          'bg-[#1c1c1f] border border-white/5 text-white'
                        )
                      : cls(
                          'border border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                          'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        )
                  )}
                >
                  <Icon className="w-[18px] h-[18px] shrink-0" />
                  <span className={cn('truncate text-left flex-1', collapsed ? 'xl:hidden' : 'block')}>
                    {t[labelKey]}
                  </span>
                </button>
              ))}
            </nav>
          </div>

          {/* Teams section */}
          <div className={cn('flex-1 min-h-0 flex flex-col', collapsed ? 'xl:hidden' : '')}>
            <div
              onClick={() => setIsTeamsExpanded((v) => !v)}
              aria-label={isTeamsExpanded ? (t.collapseTeams ?? 'Collapse team list') : (t.expandTeams ?? 'Expand team list')}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setIsTeamsExpanded((v) => !v); } }}
              className={cn(
                'shrink-0 cursor-pointer select-none flex items-center justify-between px-3.5 py-1.5 rounded-[14px] border transition-all mb-3',
                cls(
                  'bg-gray-100 hover:bg-gray-200/50 border-gray-200/20 text-gray-900 shadow-xs',
                  'bg-white/[0.04] hover:bg-white/[0.07] border-white/5 text-white'
                )
              )}
            >
              <div className="flex items-center gap-2">
                <ChevronDown
                  className={cn(
                    'w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-300',
                    isTeamsExpanded ? '' : '-rotate-90'
                  )}
                />
                <span className="text-[13px] font-extrabold tracking-tight">{t.teams}</span>
              </div>
              <button
                onClick={(e) => e.stopPropagation()}
                aria-label={t.addTeam ?? 'Add team'}
                className={cn(
                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                  cls(
                    'bg-white text-gray-800 hover:text-black border border-gray-200/30 hover:bg-gray-50 shadow-xs',
                    'bg-[#27272a] text-gray-300 hover:text-white border border-white/5 hover:bg-zinc-700'
                  )
                )}
              >
                <Plus className="w-3 h-3 stroke-[2.5]" />
              </button>
            </div>

            {isTeamsExpanded && (
              <div
                className="overflow-y-auto min-h-0 flex-1 mt-2"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <nav className="flex flex-col gap-1 pb-4">
                  {teamList.map((team) => (
                    <button
                      key={team.name}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl font-bold text-[14px] transition-colors',
                        cls(
                          'border border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50',
                          'border border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                        )
                      )}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: team.color }}
                      />
                      <span className={cn('truncate text-left flex-1', collapsed ? 'xl:hidden' : 'block')}>
                        {team.name}
                      </span>
                    </button>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-auto pt-8 flex flex-col gap-1">
          <button
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl font-bold text-[14px] transition-colors',
              cls('text-gray-500 hover:bg-gray-50', 'text-gray-400 hover:bg-white/5')
            )}
          >
            <Settings className="w-[18px] h-[18px]" />
            <span className={cn(collapsed ? 'xl:hidden' : 'block')}>{t.settings}</span>
          </button>
          <button
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 w-full rounded-2xl font-bold text-[14px] transition-colors',
              cls('text-gray-500 hover:bg-gray-50', 'text-gray-400 hover:bg-white/5')
            )}
          >
            <LogOut className="w-[18px] h-[18px]" />
            <span className={cn(collapsed ? 'xl:hidden' : 'block')}>{t.logOut}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
