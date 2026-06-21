import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import DashboardView from './components/dashboard/DashboardView';
import {
  Search,
  Bell,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  MoreVertical,
  History,
  ShoppingBag,
  Plane,
  Utensils,
  ArrowUp,
  LayoutDashboard,
  CreditCard,
  Users,
  Command,
  BarChart2,
  LogOut,
  Moon,
  Sun,
  Menu,
  X,
  Languages,
  Bot,
  FileText,
  GraduationCap,
  Globe,
  Mic,
  Sparkles,
  Image as ImageIcon,
  Box,
  File as FileIcon,
  Paperclip,
  Database,
  RefreshCw,
  Lightbulb,
  PenTool,
  Check,
  PenLine,
  Terminal,
  BookOpen,
  Telescope,
  FileSpreadsheet,
  Presentation,
  TrendingUp,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Layers,
  Activity,
  Sliders,
  Share2,
  Clock,
  MessageSquare,
} from 'lucide-react';

const getFinanceStats = (t: any, isDarkMode: boolean) => [
  {
    title: t.totalIncome,
    value: '$85,992',
    change: '17%',
    color: isDarkMode ? '#3b82f6' : '#27DAB7',
    bgLight: '#EAF8F5',
    bgDark: '#172554',
    path: 'M0,18 C15,18 20,5 30,8 C40,11 45,2 60,0',
  },
  {
    title: t.totalExpense,
    value: '$38,160',
    change: '44%',
    color: '#FF7E67',
    bgLight: '#FFF2F0',
    bgDark: '#351C1A',
    path: 'M0,15 C10,15 20,10 30,12 C40,14 50,5 60,8',
  },
  {
    title: t.totalSaving,
    value: '$47,832',
    change: '45%',
    color: '#5D5FEF',
    bgLight: '#F0F4FF',
    bgDark: '#1A1C3E',
    path: 'M0,18 C15,18 20,8 30,8 C40,8 45,2 60,0',
  },
];

const getTransactions = (t: any, isDarkMode: boolean) => [
  { name: t.janeCooper, date: '08 Sep, 2022', amount: '$1200', icon: ShoppingBag, color: isDarkMode ? '#3b82f6' : '#27DAB7', bgLight: '#EAF8F5', bgDark: '#172554' },
  { name: t.leslieAlexander, date: '08 Sep, 2022', amount: '$1750', icon: ShoppingBag, color: isDarkMode ? '#3b82f6' : '#27DAB7', bgLight: '#EAF8F5', bgDark: '#172554' },
  { name: t.flightTicket, date: '08 Sep, 2022', amount: '$500', icon: Plane, color: '#FF7E67', bgLight: '#FFF2F0', bgDark: '#351C1A' },
  { name: t.robertFox, date: '08 Sep, 2022', amount: '$4300', icon: ShoppingBag, color: isDarkMode ? '#3b82f6' : '#27DAB7', bgLight: '#EAF8F5', bgDark: '#172554' },
  { name: t.kfc, date: '08 Sep, 2022', amount: '$189', icon: Utensils, color: '#FF7E67', bgLight: '#FFF2F0', bgDark: '#351C1A' },
];

const getScheduledPayments = (t: any) => [
  { name: t.discord, amount: '$34.99/m' },
  { name: t.wattpad, amount: '$14.99/m' },
  { name: t.netflix, amount: '$9.99/m' },
];

const avatars = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
];

const i18n = {
  zh: {
    mainMenu: '主菜单',
    dashboard: '仪表盘',
    aiAgent: '智能Agent',
    drafts: '稿件管理',
    autoLearning: '自动学习',
    aiWebBuilder: 'AI网站构建',
    teams: '企业',
    marketing: '市场营销',
    development: '开发团队',
    settings: '设置',
    logOut: '退出登录',
    search: '搜索...',
    greeting: '你好 管家',
    aiGreeting1: '很高兴见到您，Sajon。',
    aiGreeting2: 'Voxle是您的个人专家 AI 助手，几乎可以完成您能想象到的任何任务。',
    aiSuggestion1Title: '写作',
    aiSuggestion1Desc: '您的专业写作 AI 助手。',
    aiSuggestion2Title: '编程',
    aiSuggestion2Desc: '您的专业编程 AI 助手。',
    aiSuggestion3Title: '图像生成',
    aiSuggestion3Desc: '您的专业图像生成 AI 助手。',
    aiSuggestion4Title: '教育',
    aiSuggestion4Desc: '您的专业教育 AI 助手。',
    aiSuggestion5Title: '研究',
    aiSuggestion5Desc: '您的专业研究 AI 助手。',
    chooseAccount: '选择账户',
    myCard: '我的卡片',
    deposit: '存款',
    withdraw: '取款',
    financialRecord: '财务记录',
    month: '本月',
    totalIncome: '总收入',
    totalExpense: '总支出',
    totalSaving: '总储蓄',
    sendMoneyTo: '转账给',
    scheduledPayments: '计划付款',
    transactions: '交易记录',
    flightTicket: '机票',
    kfc: '肯德基',
    discord: 'Discord',
    wattpad: 'Wattpad',
    netflix: 'Netflix',
    janeCooper: 'Jane Cooper',
    leslieAlexander: 'Leslie Alexander',
    robertFox: 'Robert Fox',
    availableCard: '可用卡片',
    viewAll: '查看全部',
    chatPlaceholder: '描述您的3D对象或场景...',
    inspiration: '获取灵感',
    model: '模型',
    addPhotos: '添加照片或视频',
    add3D: '添加3D对象',
    addFiles: '添加文件 (多文档、PDF等...)',
    createKnowledgeBase: '知识库创建',
    updateKnowledgeBase: '更新知识库',
    optimizationSuggestions: '优化建议',
    articleGeneration: '文章生成',
    dialogueHistory: '对话历史',
    publicChat: '公共对话',
    enterpriseChat: '企业绑定对话',
    allChat: '全部对话',
    historyPlaceholder: '暂无符合条件的对话历史',
    searchHistory: '搜索对话标题或内容...',
    chatWith: '隶属于',
    newChat: '发起新对话',
    clearHistory: '清空历史',
    switchConfirm: '已载入历史对话内容',
  },
  en: {
    mainMenu: 'Main Menu',
    dashboard: 'Dashboard',
    aiAgent: 'AI Agent',
    drafts: 'Drafts',
    autoLearning: 'Auto Learning',
    aiWebBuilder: 'AI Web Builder',
    teams: 'Enterprise',
    marketing: 'Marketing',
    development: 'Development',
    settings: 'Settings',
    logOut: 'Log Out',
    search: 'Search...',
    greeting: 'Hello Steward',
    aiGreeting1: 'Good to see you, Sajon.',
    aiGreeting2: 'Voxle your personal and expert AI assistant for pretty much any tasks you can imagine.',
    aiSuggestion1Title: 'Writing',
    aiSuggestion1Desc: 'Your expert AI assistant for Writing.',
    aiSuggestion2Title: 'Programming',
    aiSuggestion2Desc: 'Your expert AI assistant for Programming.',
    aiSuggestion3Title: 'Image generation',
    aiSuggestion3Desc: 'Your expert AI assistant for Image generation.',
    aiSuggestion4Title: 'Education',
    aiSuggestion4Desc: 'Your expert AI assistant for Education.',
    aiSuggestion5Title: 'Research',
    aiSuggestion5Desc: 'Your expert AI assistant for Research.',
    chooseAccount: 'Choose Account',
    myCard: 'My Card',
    deposit: 'Deposit',
    withdraw: 'Withdraw',
    financialRecord: 'Financial Record',
    month: 'Month',
    totalIncome: 'Total Income',
    totalExpense: 'Total Expense',
    totalSaving: 'Total Saving',
    sendMoneyTo: 'Send Money To',
    scheduledPayments: 'Scheduled Payments',
    transactions: 'Transactions',
    flightTicket: 'Flight Ticket',
    kfc: 'KFC',
    discord: 'Discord',
    wattpad: 'Wattpad',
    netflix: 'Netflix',
    janeCooper: 'Jane Cooper',
    leslieAlexander: 'Leslie Alexander',
    robertFox: 'Robert Fox',
    availableCard: 'Available Card',
    viewAll: 'View all',
    chatPlaceholder: 'Describe your 3D object or scene...',
    inspiration: 'Inspiration',
    model: 'Model',
    addPhotos: 'Add photos or videos',
    add3D: 'Add 3D objects',
    addFiles: 'Add files (docs, PDF...)',
    createKnowledgeBase: 'Create Knowledge Base',
    updateKnowledgeBase: 'Update Knowledge Base',
    optimizationSuggestions: 'Optimization Suggestions',
    articleGeneration: 'Article Generation',
    dialogueHistory: 'Dialogue History',
    publicChat: 'Public Chat',
    enterpriseChat: 'Enterprise Chat',
    allChat: 'All Chats',
    historyPlaceholder: 'No matching conversation history found',
    searchHistory: 'Search title or content...',
    chatWith: 'Belongs to',
    newChat: 'New Chat',
    clearHistory: 'Clear History',
    switchConfirm: 'Conversation history loaded successfully',
  }
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [lang, setLang] = useState<'zh' | 'en'>('zh');
  const [activeView, setActiveView] = useState<'dashboard' | 'aiAgent'>('dashboard');
  const [inputText, setInputText] = useState('');
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showInspirationMenu, setShowInspirationMenu] = useState(false);
  const [showModelMenu, setShowModelMenu] = useState(false);
  const [selectedModel, setSelectedModel] = useState('豆包2.0');
  const [selectedInspiration, setSelectedInspiration] = useState<keyof typeof i18n['zh']>('createKnowledgeBase');
  const [isTeamsExpanded, setIsTeamsExpanded] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState(lang === 'zh' ? "成都行乐音改" : "Thorafodi Web App");
  const inputAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  interface UploadedFile {
    id: string;
    name: string;
    size: string;
    type: string;
    url?: string;
  }
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  interface ChatHistoryItem {
    id: string;
    title: string;
    time: string;
    preview: string;
    type: 'public' | 'enterprise';
    enterpriseName?: string;
    group?: 'today' | 'week' | 'month' | 'earlier';
    messageCount: number;
  }

  const [activeChatId, setActiveChatId] = useState<string>('pub1');
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);
  const historyDropdownRef = useRef<HTMLDivElement>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyActiveTab, setHistoryActiveTab] = useState<'all' | 'public' | 'enterprise'>('all');
  const [chatHistoryList, setChatHistoryList] = useState<ChatHistoryItem[]>([]);

  const getFileIconAndColor = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    // PDF
    if (ext === 'pdf' || fileType === 'application/pdf') {
      return {
        Icon: FileText,
        iconColor: 'text-rose-500 dark:text-rose-400',
        bgColor: cls('bg-rose-50/70 border-rose-100/70', 'bg-rose-500/10 border-rose-500/20')
      };
    }

    // Word
    if (ext === 'doc' || ext === 'docx' || fileType === 'application/msword' || fileType.includes('word') || fileType.includes('officedocument.wordprocessingml')) {
      return {
        Icon: FileText,
        iconColor: 'text-blue-500 dark:text-blue-400',
        bgColor: cls('bg-blue-50/70 border-blue-100/70', 'bg-blue-500/10 border-blue-500/20')
      };
    }

    // Excel
    if (ext === 'xls' || ext === 'xlsx' || ext === 'csv' || fileType.includes('excel') || fileType.includes('spreadsheet') || fileType.includes('csv') || fileType.includes('officedocument.spreadsheetml')) {
      return {
        Icon: FileSpreadsheet,
        iconColor: 'text-emerald-500 dark:text-emerald-400',
        bgColor: cls('bg-emerald-50/70 border-emerald-100/70', 'bg-emerald-500/10 border-emerald-500/20')
      };
    }

    // PPT
    if (ext === 'ppt' || ext === 'pptx' || fileType.includes('powerpoint') || fileType.includes('presentation') || fileType.includes('officedocument.presentationml')) {
      return {
        Icon: Presentation,
        iconColor: 'text-amber-500 dark:text-amber-400',
        bgColor: cls('bg-amber-50/70 border-amber-100/70', 'bg-amber-500/10 border-amber-500/20')
      };
    }

    // Markdown
    if (ext === 'md' || ext === 'markdown' || fileType === 'text/markdown' || fileType === 'text/x-markdown') {
      return {
        Icon: PenLine,
        iconColor: 'text-purple-500 dark:text-purple-400',
        bgColor: cls('bg-purple-50/70 border-purple-100/70', 'bg-purple-500/10 border-purple-500/20')
      };
    }

    // Default image-like
    if (fileType.startsWith('image/')) {
      return {
        Icon: ImageIcon,
        iconColor: 'text-teal-500 dark:text-[#27DAB7]',
        bgColor: cls('bg-teal-50/70 border-teal-100/70', 'bg-[#27DAB7]/10 border-[#27DAB7]/20')
      };
    }

    // Default file
    return {
      Icon: FileIcon,
      iconColor: 'text-gray-500 dark:text-gray-400',
      bgColor: cls('bg-gray-50/70 border-gray-100/70', 'bg-white/5 border-white/5')
    };
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = Array.from(files).map((file: File) => {
      const isImage = file.type.startsWith('image/');
      let url: string | undefined;
      if (isImage) {
        url = URL.createObjectURL(file);
      }
      
      let sizeStr = '';
      if (file.size < 1024) {
        sizeStr = `${file.size} B`;
      } else if (file.size < 1024 * 1024) {
        sizeStr = `${(file.size / 1024).toFixed(1)} KB`;
      } else {
        sizeStr = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      }

      return {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: sizeStr,
        type: file.type,
        url
      };
    });

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUploadedFile = (id: string) => {
    setUploadedFiles((prev) => {
      const fileToRemove = prev.find((f) => f.id === id);
      if (fileToRemove?.url) {
        URL.revokeObjectURL(fileToRemove.url);
      }
      return prev.filter((f) => f.id !== id);
    });
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      // Set height based on scrollHeight, up to a maximum of 140px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [inputText]);

  const teamsData: Record<string, { balance: string; color: string; increase: string }> = {
    "Thorafodi Web App": { balance: "$2,85,400.00", color: "#fcd34d", increase: "12%" },
    "Corbe Mobile Application": { balance: "$1,43,899.00", color: "#60a5fa", increase: "10%" },
    "Abuss Clothing Shop": { balance: "$72,150.00", color: "#6ee7b7", increase: "8%" },
    "Bimjet Crypto Dashboard": { balance: "$9,48,220.00", color: "#fef08a", increase: "24%" },
    "Marketing": { balance: "$45,800.00", color: "#FB923C", increase: "5%" },
    "Development": { balance: "$122,400.00", color: "#F37021", increase: "14%" },
    "市场营销": { balance: "$45,800.00", color: "#FB923C", increase: "5%" },
    "开发团队": { balance: "$1,22,400.00", color: "#F37021", increase: "14%" },
    "Design System": { balance: "$18,900.00", color: "#c084fc", increase: "3%" },
    "Analytics Platform": { balance: "$3,10,250.00", color: "#fb7185", increase: "18%" },
    "Customer Portal": { balance: "$64,300.00", color: "#94a3b8", increase: "6%" }
  };

  const getTeamBalance = (name: string) => teamsData[name]?.balance || "$1,43,899.00";
  const getTeamColor = (name: string) => teamsData[name]?.color || "#60a5fa";
  const getTeamIncrease = (name: string) => teamsData[name]?.increase || "10%";

  const handleTeamSelect = (name: string) => {
    setSelectedTeam(name);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputAreaRef.current && !inputAreaRef.current.contains(event.target as Node)) {
        setShowAddMenu(false);
        setShowInspirationMenu(false);
        setShowModelMenu(false);
      }
      if (historyDropdownRef.current && !historyDropdownRef.current.contains(event.target as Node)) {
        setShowHistoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const cls = (light: string, dark: string) => (isDarkMode ? dark : light);
  const t = i18n[lang];

  useEffect(() => {
    setChatHistoryList([
      {
        id: 'pub_hello',
        title: 'hello',
        time: lang === 'zh' ? '刚刚' : 'Just now',
        preview: lang === 'zh' ? '# 四川佳祺食品有限公司 企业知识库全量内容 ---\n## 一、基础信息 - 企业全称：四川佳祺食品有...' : '# Sichuan Jiaqi Food Co., Ltd. Enterprise Knowledge Base --- \n## 1. Basics: Enterprise Full Name...',
        type: 'public',
        group: 'today',
        messageCount: 4
      },
      {
        id: 'pub_jiaqi',
        title: lang === 'zh' ? '四川佳祺食品有限公司 GEO 优化' : 'Sichuan Jiaqi Food Co., Ltd. GEO Optimization',
        time: lang === 'zh' ? '6月16日' : 'Jun 16',
        preview: lang === 'zh' ? '已生成咨询/测评支撑内容' : 'Generated consultation/evaluation supportive content',
        type: 'public',
        group: 'week',
        messageCount: 7
      },
      {
        id: 'pub1',
        title: lang === 'zh' ? '关于 3D 模型渲染管线的基础原理' : 'Basics of 3D Model Rendering Pipeline',
        time: lang === 'zh' ? '10分钟前' : '10m ago',
        preview: lang === 'zh' ? '你能给我详细讲解一下 WebGL 到 WebGPU 的性能提升差异吗...' : 'Can you explain the performance difference between WebGL and WebGPU...',
        type: 'public',
        group: 'today',
        messageCount: 5
      },
      {
        id: 'pub2',
        title: lang === 'zh' ? 'Next.js 15 App Router 新特性总结' : 'Summary of Next.js 15 App Router Features',
        time: lang === 'zh' ? '2小时前' : '2h ago',
        preview: lang === 'zh' ? '我想了解关于 React Server Components 的缓存更新控制 and Server Actions...' : 'I want to know about caching control in RSCs and Server Actions...',
        type: 'public',
        group: 'today',
        messageCount: 12
      },
      {
        id: 'pub3',
        title: lang === 'zh' ? 'Tailwind CSS v4 新架构与配置' : 'Tailwind CSS v4 Architecture & Config',
        time: lang === 'zh' ? '昨天' : 'Yesterday',
        preview: lang === 'zh' ? '新版的 @theme 指令如何替代原来的 tailwind.config.js 配置文件...' : 'How the new @theme directive replaces the tailwind.config.js file...',
        type: 'public',
        group: 'week',
        messageCount: 3
      },
      {
        id: 'ent1',
        title: lang === 'zh' ? `${t.marketing} 品牌出海营销文案生成` : 'Marketing Brand Global Campaign Copy',
        time: lang === 'zh' ? '3小时前' : '3h ago',
        preview: lang === 'zh' ? '针对北美市场的 SaaS 工具，生成 3 套不同风格的 Twitter 推广文案...' : 'Generate 3 different styles of Twitter ad copy for NA SaaS market...',
        type: 'enterprise',
        enterpriseName: t.marketing,
        group: 'today',
        messageCount: 6
      },
      {
        id: 'ent2',
        title: lang === 'zh' ? 'Thorafodi 官网重构技术选型方案' : 'Thorafodi Web App Technology Stack Selection',
        time: lang === 'zh' ? '昨天 15:30' : 'Yesterday 15:30',
        preview: lang === 'zh' ? '对比 Drizzle ORM 与 Prisma 在 Edge Function 场景下的热启动延迟...' : 'Comparing Drizzle ORM and Prisma cold start latency in Edge Functions...',
        type: 'enterprise',
        enterpriseName: 'Thorafodi Web App',
        group: 'week',
        messageCount: 9
      },
      {
        id: 'ent3',
        title: lang === 'zh' ? 'Corbe 跨端离线同步方案评审' : 'Corbe Cross-platform Offline Sync Review',
        time: lang === 'zh' ? '3天前' : '3 days ago',
        preview: lang === 'zh' ? '基于 CRDT 的多终端同步冲突合并机制的设计草案...' : 'Draft design of CRDT-based multi-terminal conflict-free sync mechanism...',
        type: 'enterprise',
        enterpriseName: 'Corbe Mobile Application',
        group: 'week',
        messageCount: 15
      },
      {
        id: 'ent4',
        title: lang === 'zh' ? 'Abuss 女装夏季新品发布主图生成' : 'Abuss Clothing Summer New Release Shoots',
        time: lang === 'zh' ? '4天前' : '4 days ago',
        preview: lang === 'zh' ? '根据夏季海洋风情，生成 4 张高宽比为 3:4 的模特棚拍穿搭底图...' : 'Generate 4 model shooting photoshoot backgrounds in 3:4 ratio...',
        type: 'enterprise',
        enterpriseName: 'Abuss Clothing Shop',
        group: 'earlier',
        messageCount: 8
      },
      {
        id: 'ent5',
        title: lang === 'zh' ? 'Bimjet 数字钱包转账手续费优化' : 'Bimjet Crypto Gas Fee Optimization',
        time: lang === 'zh' ? '5天前' : '5 days ago',
        preview: lang === 'zh' ? '基于 Gas Fee 波动曲线预测模型，给用户推荐非繁忙时段转账提示创意...' : 'Predictive models for Gas Fees to recommend off-peak transaction alerts...',
        type: 'enterprise',
        enterpriseName: 'Bimjet Crypto Dashboard',
        group: 'earlier',
        messageCount: 22
      },
      {
        id: 'ent6',
        title: lang === 'zh' ? `${t.development} 工作流自动化方案` : 'Development Workflow Automation',
        time: lang === 'zh' ? '上周' : 'Last week',
        preview: lang === 'zh' ? '使用 GitHub Actions 在发布 Release 时自动推送 Docker 镜像...' : 'Using GitHub Actions to auto push Docker images on releases...',
        type: 'enterprise',
        enterpriseName: t.development,
        group: 'earlier',
        messageCount: 11
      }
    ]);
  }, [lang, t.marketing, t.development]);

  const financeStats = getFinanceStats(t, isDarkMode);
  const transactions = getTransactions(t, isDarkMode);
  const scheduledPayments = getScheduledPayments(t);

  const teamList = [
    "Thorafodi Web App",
    "Corbe Mobile Application",
    "Abuss Clothing Shop",
    "Bimjet Crypto Dashboard",
    t.marketing,
    t.development,
    "Design System",
    "Analytics Platform",
    "Customer Portal"
  ];

  const activeChat = chatHistoryList.find(h => h.id === activeChatId) || chatHistoryList[0];
  const activeChatTitle = activeChat ? activeChat.title : (lang === 'zh' ? '新对话' : 'New Chat');

  // GEO Dashboard metrics for成都行乐音改
  const geoMetadata = {
    version: "v0.9.x",
    enterprise: {
      name: lang === 'zh' ? "成都行乐音改" : "Chengdu Xingleyingai",
      industry: lang === 'zh' ? "汽车用品与全车无损智能隔音改装" : "Car Audio & Lossless Soundproofing Upgrade",
      tag: lang === 'zh' ? "汽车音响与全车隔音" : "Car Audio & Full Noise Isolation",
      description: lang === 'zh' ? "围绕德国彩虹官方大中华级代理资质、IASCA专业级国际调音师团队、多阶改装套餐价格底盘进行完备的三元组图谱索引。" : "Comprehensive triple graph indexing around German Rainbow agency qualifications, IASCA tuning master teams, and multi-stage package matrices.",
      target_region: lang === 'zh' ? "成都市" : "Chengdu Region",
      core_brands: ["德国彩虹 (Rainbow)", "IASCA"],
      profile_completion: 0.86
    }
  };

  const [activeTab, setActiveTab] = useState<'visibility' | 'channels' | 'kb' | 'keywords'>('visibility');

  const [geoActionItems, setGeoActionItems] = useState([
    { id: "ai_001", title_zh: "2 篇稿件待校对", title_en: "2 Manuscripts Pending Review", desc_zh: "《汽车音响改装价格区间解析》《如何选择汽车隔音材料？》等待人工确认", desc_en: "Upgrade packages price analysis and soundproofing materials lists need confirmation", priority: "high", link: "drafts", done: false },
    { id: "ai_002", title_zh: "4 条优化规则待确认", title_en: "4 Optimization Rules Pending", desc_zh: "涉及文章标题、关键证据链、关键词密度和内容差缺等方向的优化规则", desc_en: "Actionable suggestions covering outline structure, key claims, and gaps", priority: "high", link: "learning", done: false },
    { id: "ai_003", title_zh: "补充知识库字段", title_en: "Refine Knowledge Gaps", desc_zh: "缺少真实改装案例展示(proven_cases)、售后咨询通道(contact_info)等必填元数据", desc_en: "Missing specific case parameters or official phone contact points", priority: "medium", link: "knowledge", done: false },
    { id: "ai_004", title_zh: "可在搜狐发布 1 篇稿件", title_en: "1 Ready to publish on Sohu", desc_zh: "当前奥迪 A4L 的音响升级支撑素材充足，可直接触发首发指令", desc_en: "Verified that supporting materials are adequate for release of Audi A4L review", priority: "medium", link: "drafts", done: false },
    { id: "ai_005", title_zh: "奥迪 A4L 问题未上榜", title_en: "Audi A4L not listing in recommendations", desc_zh: "对应问题检测未被提及，生成和群发动作尚未覆盖，建议执行补足策略", desc_en: "Recommended listing not found in recent checks. Suggest publishing supportive topics", priority: "medium", link: "learning", done: false },
    { id: "ai_006", title_zh: "1 个资产正在解析中...", title_en: "1 PDF currently processing...", desc_zh: "《德国彩虹官方授权证书.pdf》OCR识别与分段分片中，即将提升完整度", desc_en: "Official Rainbow Agent Certificate.pdf undergoes background semantic vectorization", priority: "low", link: "knowledge", done: false }
  ]);

  const [geoRules, setGeoRules] = useState([
    { id: "r_001", type: "title", content_zh: "排行榜标题应包含「2026」年份词，提升时效性感知", content_en: "Ranking lists must feature '2026' in titles to boost immediate recency", confidence: 0.88, status: "pending", counts: 3 },
    { id: "r_002", type: "evidence", content_zh: "支撑测评稿中应补充更多奔驰车型专属改装规格及真实参数", content_en: "Add technical spec sheets for Benz variants in deep reviews for proof", confidence: 0.82, status: "pending", counts: 2 },
    { id: "r_003", type: "keyword", content_zh: "在长尾核心集中引入并在首段覆盖「奥迪 A4L 音响升级」", content_en: "Incorporate 'Audi A4L speaker upgrades' into long-tail question index", confidence: 0.79, status: "pending", counts: 2 },
    { id: "r_004", type: "content_gap", content_zh: "补充 3000-8000 元价位段汽车音响入门升级套餐详细说明", content_en: "Supplement starter combo packs priced between $400 - $1100 to plug general gaps", confidence: 0.85, status: "pending", counts: 3 },
    { id: "r_005", type: "title", content_zh: "避坑指南标题应使用「怎么选」「如何判断」疑问句式强引导", content_en: "Trust metrics show questions with 'How to choose' perform 24% higher", confidence: 0.81, status: "confirmed", counts: 4 },
    { id: "r_006", type: "structure", content_zh: "排行榜文章应先明确评测维度和安全等级再列推荐名单", content_en: "Index templates should present evaluation criteria prior to name recommendations", confidence: 0.80, status: "confirmed", counts: 3 },
  ]);

  const [questionResults, setQuestionResults] = useState([
    { id: "q_001", question_zh: "成都汽车音响改装店哪家好？", question_en: "Which car audio shop is best in Chengdu?", intent_zh: "排名推荐", intent_en: "Ranking", level: "core", listed: true, rank: 1, cited: "搜狐同城快讯", competitors: ["成都音悦汇", "成都乐改"] },
    { id: "q_002", question_zh: "成都德国彩虹喇叭授权店有哪些？", question_en: "Where are authorized German Rainbow audio shops?", intent_zh: "竞品对比", intent_en: "Comparison", level: "core", listed: true, rank: 1, cited: "网易汽车垂直", competitors: ["成都音悦汇"] },
    { id: "q_003", question_zh: "成都奔驰 C 级音响改装哪家好？", question_en: "Which shop is best for Benz C-Class audio upgrade?", intent_zh: "方案细节", intent_en: "Scenario Spec", level: "scenario", listed: true, rank: 2, cited: "新浪看点汽车", competitors: ["成都乐改", "成都音悦汇"] },
    { id: "q_004", question_zh: "成都全车隔音降噪哪家好？", question_en: "Who does professional sound insulation in Chengdu?", intent_zh: "口碑检测", intent_en: "Ranking", level: "regional", listed: true, rank: 3, cited: "网易号", competitors: ["静界隔音", "成都乐改"] },
    { id: "q_005", question_zh: "成都宝马音响改装推荐哪家？", question_en: "Who has database for BMW custom audio tuning?", intent_zh: "推荐名录", intent_en: "Ranking", level: "regional", listed: true, rank: 2, cited: "百家本地生活", competitors: ["成都音悦汇"] },
    { id: "q_006", question_zh: "成都奥迪 A4L 音响升级选哪家？", question_en: "Where is recommended for Audi A4L speaker tuning?", intent_zh: "场景价格", intent_en: "Scenario Spec", level: "scenario", listed: false, rank: null, competitors: ["成都乐改", "成都音悦汇"] },
    { id: "q_007", question_zh: "汽车音响改装怎么防止踩坑？", question_en: "How to avoid scams in bespoke car audio upgrades?", intent_zh: "科普避坑", intent_en: "Educational", level: "long_tail", listed: true, rank: 1, cited: "网易汽车号", competitors: [] },
    { id: "q_008", question_zh: "成都德系车音响改装口碑哪家强？", question_en: "Which clinic is most trusted for German auto audio?", intent_zh: "口碑排名", intent_en: "Ranking", level: "regional", listed: false, rank: null, competitors: ["成都音悦汇", "成都乐改"] },
    { id: "q_009", question_zh: "汽车音响改装一般要花多少钱？", question_en: "How much is entry to enthusiast audio upgrades?", intent_zh: "价格咨询", intent_en: "Scenario Check", level: "long_tail", listed: false, rank: null, competitors: [] },
    { id: "q_010", question_zh: "成都汽车音响改装大师团队推荐？", question_en: "Who is standard IASCA cert tuner team in Chengdu?", intent_zh: "信誉资质", intent_en: "Trust Check", level: "core", listed: false, rank: null, competitors: ["成都乐改"] },
  ]);

  const geoChannels = [
    { name: "搜狐媒体", desc: "搜狐媒体同城快讯专线", count: 3, rate: "100%", citeCount: 2, price: 120, score: 0.92 },
    { name: "网易号", desc: "网易号汽车垂直专栏", count: 2, rate: "100%", citeCount: 2, price: 90, score: 0.85 },
    { name: "百家号", desc: "百家号本地生活资讯", count: 2, rate: "67%", citeCount: 1, price: 80, score: 0.74 },
    { name: "新浪看点", desc: "新浪看点汽车频道", count: 1, rate: "100%", citeCount: 1, price: 150, score: 0.68 },
    { name: "今日头条", desc: "今日头条本地生活专栏", count: 0, rate: "0%", citeCount: 0, price: 100, score: 0.45 },
  ];

  const trendData = [
    { date: "06-03", rate: 20 },
    { date: "06-05", rate: 20 },
    { date: "06-07", rate: 30 },
    { date: "06-09", rate: 40 },
    { date: "06-11", rate: 50 },
    { date: "06-13", rate: 55 },
    { date: "06-15", rate: 55 },
    { date: "06-17", rate: 60 }
  ];

  const kbData = {
    health: 86,
    indexed: 141,
    pending: 1,
    vector_backend: "fts5 + sqlite-vec",
    embedding: "doubao-embedding-vision-251215",
    assets: [
      { name: "行乐音改企业基础信息集.pdf", status: "indexed", words: 1200 },
      { name: "产品及多阶音质改装方案库.docx", status: "indexed", words: 2100 },
      { name: "车主真实改装案例库.xlsx", status: "indexed", words: 890 },
      { name: "德国彩虹官方大中华代理授权书.pdf", status: "pending", words: 0 },
      { name: "行乐音改常问 FAQ 问答集.xlsx", status: "indexed", words: 560 },
    ]
  };

  const keywordsData = [
    { word: "成都汽车音响改装", type: "Core", search: "5,430 次/月" },
    { word: "成都德国彩虹喇叭", type: "Brand", search: "2,100 次/月" },
    { word: "成都奔驰音响改装", type: "Scenario", search: "1,800 次/月" },
    { word: "成都宝马音响改装", type: "Scenario", search: "1,600 次/月" },
    { word: "成都全车隔音降噪", type: "Regional", search: "980 次/月" },
  ];

  const handleToggleTask = (id: string) => {
    setGeoActionItems(prev => prev.map(item => item.id === id ? { ...item, done: !item.done } : item));
  };

  const handleRuleStatus = (id: string, newStatus: 'confirmed' | 'rejected') => {
    setGeoRules(prev => prev.map(rule => rule.id === id ? { ...rule, status: newStatus } : rule));
  };

  const NavItem = ({ icon: Icon, label, isActive = false, dotColor, rotateIcon = false, onClick }: any) => {
    if (dotColor) {
      let finalDotColor = dotColor;
      if (dotColor === "#F37021" || dotColor === "#f97316") {
        finalDotColor = "#ffbda0";
      } else if (dotColor === "#2dd4bf") {
        finalDotColor = "#8decce";
      } else if (dotColor === "#3b82f6" || dotColor === "#7dd3fc") {
        finalDotColor = "#8cd3ff";
      } else if (dotColor === "#ef4444") {
        finalDotColor = "#ffb3b3";
      }

      return (
        <button 
          onClick={onClick}
          title={isSidebarCollapsed || label.length > 20 ? label : undefined}
          className={`flex items-center transition-all duration-300 group
            ${isSidebarCollapsed ? 'xl:justify-center xl:w-11 xl:h-11 xl:p-0 xl:mx-auto' : 'pl-1 pr-3 py-2.5 w-full'}
            font-bold text-[14px] relative bg-transparent border-none outline-hidden cursor-pointer
            ${isActive 
              ? cls('text-gray-950 font-extrabold', 'text-white font-extrabold')
              : cls('text-gray-400 font-semibold hover:text-gray-700', 'text-zinc-500 font-semibold hover:text-zinc-300')
            }`}
        >
          {!isSidebarCollapsed && (
            <div className={`flex flex-col gap-[2px] shrink-0 mr-2.5 transition-opacity duration-300 w-2.5 items-center ${isActive ? 'opacity-40 text-gray-500 dark:text-gray-400' : 'opacity-0 group-hover:opacity-20 text-gray-400 dark:text-zinc-600'}`}>
              <div className="flex gap-[1.5px]">
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
              </div>
              <div className="flex gap-[1.5px]">
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
              </div>
              <div className="flex gap-[1.5px]">
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
                <div className="w-[3px] h-[3px] rounded-full bg-current"></div>
              </div>
            </div>
          )}
          
          <span className={`flex justify-center shrink-0 ${isSidebarCollapsed ? 'w-[18px]' : 'w-5 mr-1'}`}>
            <span 
              className={`w-2.5 h-2.5 rounded-full inline-block transition-all duration-300 ${isActive ? 'scale-110 opacity-100' : 'scale-90 opacity-40 group-hover:opacity-80'}`}
              style={{ backgroundColor: finalDotColor }} 
            />
          </span>

          <span className={`truncate text-left transition-all duration-300 ${isSidebarCollapsed ? 'xl:hidden' : 'flex-1'}`}>
            {label}
          </span>
        </button>
      );
    }

    return (
      <button 
        onClick={onClick}
        title={isSidebarCollapsed || label.length > 20 ? label : undefined}
        className={`flex items-center transition-all duration-300 group
          ${isSidebarCollapsed ? 'xl:justify-center xl:w-11 xl:h-11 xl:p-0 xl:mx-auto' : 'gap-3 px-3 py-2.5 w-full'}
          ${!isSidebarCollapsed ? 'gap-3 px-3 py-2.5 w-full' : ''}
          rounded-2xl font-bold text-[14px]
          ${isActive 
            ? cls('bg-white shadow-xs border border-gray-200/50 text-gray-900', 'bg-[#1c1c1f] border border-white/5 text-white')
            : cls('border border-transparent text-gray-500 hover:text-gray-800 hover:bg-gray-50', 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5')
          }`}
      >
        <Icon className={`w-[18px] h-[18px] shrink-0 ${rotateIcon ? 'rotate-180' : ''}`} />
        <span className={`truncate text-left transition-all duration-300 ${isSidebarCollapsed ? 'xl:hidden' : 'flex-1'}`}>{label}</span>
      </button>
    );
  };

  return (
    <div className={`h-[100dvh] w-full font-sans flex justify-center items-stretch transition-colors duration-300 ${isDarkMode ? 'dark' : ''} ${cls('bg-[#f4f4f5] text-[#191c1e]', 'bg-[#09090b] text-white')}`}>
      <div className={`flex w-full h-full overflow-hidden transition-colors duration-300 ${isDarkMode ? 'dark' : ''} ${cls('bg-[#f4f4f5] selection:bg-black/10', 'bg-[#09090b] selection:bg-white/10')}`}>
        
        {/* Mobile Navigation Overlay */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 xl:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={`fixed xl:static inset-y-0 left-0 z-50 h-full shrink-0 flex flex-col transition-all duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full xl:translate-x-0'} 
          ${isSidebarCollapsed ? 'xl:w-[88px] xl:px-3' : 'xl:w-[260px] xl:px-6'}
          w-[280px] px-6 py-8 xl:py-10
          ${cls('bg-[#f5f6f8] border-r border-gray-200/50', 'bg-[#18181c] border-r border-zinc-800/50')}`}>
          <div className={`flex items-center ${isSidebarCollapsed ? 'xl:justify-center xl:flex-col xl:gap-8' : 'justify-between'} mb-10 px-2 transition-colors duration-300 relative`}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#F37021]/10 text-[#F37021] flex items-center justify-center shrink-0 overflow-hidden relative">
                <div className="absolute bottom-0 w-6 h-6 bg-[#F37021] rounded-t-full flex items-end justify-center pb-1 gap-0.5">
                     <span className="w-1 h-1 rounded-full bg-white opacity-40"></span>
                     <span className="w-1 h-1 rounded-full bg-white opacity-70"></span>
                     <span className="w-1 h-1 rounded-full bg-white opacity-100"></span>
                </div>
              </div>
              <div className={`flex items-start transition-all duration-300 ${cls('text-gray-900', 'text-white')}`}>
                <span className={`font-black tracking-tight transition-all duration-300 ${isSidebarCollapsed ? 'hidden xl:hidden' : 'text-[18px]'}`} style={{ fontFamily: 'system-ui, sans-serif' }}>
                  NAI Agent
                </span>
              </div>
            </div>

            <button className={`xl:hidden p-2 rounded-full shrink-0 ${cls('hover:bg-gray-200/50 text-gray-700', 'hover:bg-zinc-800 text-zinc-300')}`} onClick={() => setIsMobileMenuOpen(false)}>
              <X className="w-5 h-5" />
            </button>

            <button 
              className={`hidden xl:flex p-1.5 shrink-0 rounded-lg transition-colors shadow-xs absolute -right-[36px] ${cls(
                'text-gray-400 border border-gray-200/60 hover:text-black bg-white hover:bg-gray-50',
                'text-gray-300 border border-zinc-700/80 hover:text-white bg-[#27272a] hover:bg-[#343438]'
              )}`}
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            >
              {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="11 17 6 12 11 7"></polyline><polyline points="18 17 13 12 18 7"></polyline></svg>}
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-8 min-h-0">
            <div className="shrink-0">
              <h3 className={`text-[12px] font-medium mb-4 px-4 transition-colors duration-300 text-gray-500 ${isSidebarCollapsed ? 'xl:hidden' : ''}`}>{lang === 'zh' ? '主菜单' : 'Main Menu'}</h3>
              <nav className="flex flex-col gap-1">
                <NavItem icon={LayoutDashboard} label={t.dashboard} isActive={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
                <NavItem icon={Settings} label={t.aiAgent} isActive={activeView === 'aiAgent'} onClick={() => setActiveView('aiAgent')} />
                <NavItem icon={FileText} label={t.drafts} />
                <NavItem icon={BookOpen} label={t.autoLearning} />
                <NavItem icon={Globe} label={t.aiWebBuilder} />
              </nav>
            </div>

            <div className={`flex-1 min-h-0 flex flex-col ${isSidebarCollapsed ? 'xl:hidden' : ''}`}>
              <div 
                onClick={() => setIsTeamsExpanded(!isTeamsExpanded)}
                className={`shrink-0 cursor-pointer select-none flex items-center justify-between px-3.5 py-1.5 rounded-[14px] border transition-all mb-3 ${cls(
                  'bg-gray-100 hover:bg-gray-200/50 border-gray-200/20 text-gray-900 shadow-xs',
                  'bg-white/[0.04] hover:bg-white/[0.07] border-white/5 text-white'
                )}`}
              >
                <div className="flex items-center gap-2">
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isTeamsExpanded ? '' : '-rotate-90'}`} />
                  <span className="text-[13px] font-extrabold tracking-tight">{t.teams}</span>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${cls(
                    'bg-white text-gray-800 hover:text-black border border-gray-200/30 hover:bg-gray-50 shadow-xs',
                    'bg-[#27272a] text-gray-300 hover:text-white border border-white/5 hover:bg-zinc-700'
                  )}`}
                >
                  <Plus className="w-3 h-3 stroke-[2.5]" />
                </button>
              </div>
              
              <AnimatePresence>
                {isTeamsExpanded && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-y-auto min-h-0 flex-1 mt-2"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    <nav className="flex flex-col gap-1 pb-4">
                      <NavItem label={lang === 'zh' ? "成都行乐音改" : "Thorafodi Web App"} dotColor="#F37021" isActive={selectedTeam === "Thorafodi Web App" || selectedTeam === "成都行乐音改"} onClick={() => handleTeamSelect(lang === 'zh' ? "成都行乐音改" : "Thorafodi Web App")} />
                      <NavItem label="Corbe Mobile Application" dotColor="#f97316" isActive={selectedTeam === "Corbe Mobile Application"} onClick={() => handleTeamSelect("Corbe Mobile Application")} />
                      <NavItem label="Abuss Clothing Shop" dotColor="#2dd4bf" isActive={selectedTeam === "Abuss Clothing Shop"} onClick={() => handleTeamSelect("Abuss Clothing Shop")} />
                      <NavItem label="Bimjet Crypto Dashboard" dotColor="#3b82f6" isActive={selectedTeam === "Bimjet Crypto Dashboard"} onClick={() => handleTeamSelect("Bimjet Crypto Dashboard")} />
                      <NavItem label={t.marketing} dotColor="#ef4444" isActive={selectedTeam === t.marketing} onClick={() => handleTeamSelect(t.marketing)} />
                      <NavItem label={t.development} dotColor="#2dd4bf" isActive={selectedTeam === t.development} onClick={() => handleTeamSelect(t.development)} />
                      <NavItem label="Design System" dotColor="#f97316" isActive={selectedTeam === "Design System"} onClick={() => handleTeamSelect("Design System")} />
                      <NavItem label="Analytics Platform" dotColor="#7dd3fc" isActive={selectedTeam === "Analytics Platform"} onClick={() => handleTeamSelect("Analytics Platform")} />
                      <NavItem label="Customer Portal" dotColor="#2dd4bf" isActive={selectedTeam === "Customer Portal"} onClick={() => handleTeamSelect("Customer Portal")} />
                    </nav>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-auto pt-8 flex flex-col gap-1">
            <NavItem icon={Settings} label={t.settings} />
            <NavItem icon={LogOut} label={t.logOut} />
          </div>
        </aside>

        {/* Main Interface Content */}
        <div className={`flex-1 overflow-y-auto pt-4 lg:pt-6 px-6 lg:px-12 pb-6 lg:pb-12 w-full max-w-full min-w-[0] overflow-x-hidden flex flex-col transition-colors duration-300 ${cls('bg-white', 'bg-[#131316]')} ${isMobileMenuOpen ? 'blur-sm xl:blur-none pointer-events-none xl:pointer-events-auto' : ''}`} style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          
          {/* Header */}
          {activeView !== 'dashboard' && (
          <header className="flex justify-between items-center mb-10">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className={`xl:hidden p-2 -ml-2 rounded-lg transition-colors ${cls('hover:bg-gray-100 text-gray-600', 'hover:bg-[#3f3f46] text-gray-300')}`}
              >
                <Menu className="w-6 h-6" />
              </button>
              {activeView === 'aiAgent' && (
                <div className="relative" ref={historyDropdownRef}>
                  <button 
                    onClick={() => setShowHistoryDropdown(!showHistoryDropdown)}
                    className={`flex items-center gap-1.5 md:gap-2 px-3 py-1.5 rounded-full hover:bg-black/[0.04] dark:hover:bg-white/[0.04] transition-all duration-200`}
                  >
                    <div className="flex items-center gap-1.5 text-[15px] font-bold">
                      <span className={cls('text-gray-400', 'text-gray-500')}>Notion AI</span>
                      <span className="opacity-30">/</span>
                      <span className={`max-w-[120px] sm:max-w-[240px] truncate ${cls('text-gray-800', 'text-gray-200')}`}>{activeChatTitle}</span>
                      <ChevronDown className="w-4 h-4 opacity-40 shrink-0" />
                    </div>
                  </button>

                  <AnimatePresence>
                    {showHistoryDropdown && (
                       <motion.div
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 12, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className={`absolute left-0 mt-2 rounded-2xl p-4 shadow-[0_12px_40px_rgba(0,0,0,0.15)] text-[15px] font-semibold flex flex-col w-[350px] max-h-[500px] origin-top-left z-55 border backdrop-blur-3xl ${cls('bg-white/95 border-gray-100/80', 'bg-[#18181b]/95 border-white/5')}`}
                      >
                        {/* Header of Dialog History */}
                        <div className="flex items-center justify-between mb-3 px-1 select-none shrink-0">
                          <span className={`font-serif font-bold text-[15px] ${cls('text-gray-900', 'text-white')}`}>
                            {lang === 'zh' ? '对话历史' : 'Dialogue History'}
                          </span>
                          <div className="flex items-center gap-1">
                            {/* Create New Chat Button */}
                            <button
                              onClick={() => {
                                const newId = `new_chat_${Date.now()}`;
                                const newChatItem: ChatHistoryItem = {
                                  id: newId,
                                  title: lang === 'zh' ? '新对话' : 'New Chat',
                                  time: lang === 'zh' ? '刚刚' : 'Just now',
                                  preview: lang === 'zh' ? '开启全新一段有趣的智能对话之旅...' : 'Start a new interesting AI conversation...',
                                  type: 'public',
                                  group: 'today',
                                  messageCount: 0
                                };
                                setChatHistoryList(prev => [newChatItem, ...prev]);
                                setActiveChatId(newId);
                                setInputText('');
                                setShowHistoryDropdown(false);
                              }}
                              className={`p-1 rounded-lg transition-colors ${cls('hover:bg-gray-100 text-gray-500 hover:text-black', 'hover:bg-white/5 text-gray-400 hover:text-white')}`}
                              title={lang === 'zh' ? '新建对话' : 'New Chat'}
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                            {/* Close Dropdown Button */}
                            <button
                              onClick={() => setShowHistoryDropdown(false)}
                              className={`p-1 rounded-lg transition-colors ${cls('hover:bg-gray-100 text-gray-500 hover:text-black', 'hover:bg-white/5 text-gray-400 hover:text-white')}`}
                              title={lang === 'zh' ? '关闭' : 'Close'}
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Search Input */}
                        <div className={`relative mb-3 flex items-center rounded-xl px-3 py-2.5 border select-none shrink-0 ${cls('bg-gray-50 border-gray-100 focus-within:border-gray-300 focus-within:bg-white', 'bg-[#1f2026] border-white/5 focus-within:border-white/15 focus-within:bg-[#18181b]')}`}>
                          <Search className="w-3.5 h-3.5 text-gray-400 shrink-0 mr-2" />
                          <input
                            type="text"
                            value={historySearchQuery}
                            onChange={(e) => setHistorySearchQuery(e.target.value)}
                            placeholder={lang === 'zh' ? '搜索对话...' : 'Search conversations...'}
                            className={`w-full bg-transparent text-xs font-semibold focus:outline-none placeholder-gray-400 dark:placeholder-gray-500 ${cls('text-black', 'text-white')}`}
                          />
                          {historySearchQuery && (
                            <button 
                              onClick={() => setHistorySearchQuery('')} 
                              className="p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-black dark:hover:text-white shrink-0 ml-1"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                        </div>

                        {/* Chat List divided into groupings */}
                        <div className="flex-1 flex flex-col gap-3.5 overflow-y-auto pr-0.5" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                          {['today', 'week', 'earlier'].map((groupKey) => {
                            const groupLabel = groupKey === 'today' 
                              ? (lang === 'zh' ? '今天' : 'Today')
                              : groupKey === 'week'
                              ? (lang === 'zh' ? '本周' : 'This Week')
                              : (lang === 'zh' ? '更早' : 'Earlier');

                            const groupItems = chatHistoryList.filter(item => {
                              // Group assignment
                              const matchesGroup = item.group === groupKey || (groupKey === 'earlier' && item.group === 'month');
                              if (!matchesGroup) return false;

                              // Search filter
                              if (!historySearchQuery) return true;
                              const query = historySearchQuery.toLowerCase();
                              return item.title.toLowerCase().includes(query) || item.preview.toLowerCase().includes(query);
                            });

                            if (groupItems.length === 0) return null;

                            return (
                              <div key={groupKey} className="flex flex-col gap-1.5">
                                {/* Group Title with Clock Icon */}
                                <div className={`flex items-center gap-1.5 text-[11px] font-extrabold tracking-wider uppercase px-1 py-0.5 select-none ${cls('text-gray-400', 'text-gray-500')}`}>
                                  <Clock className="w-3.5 h-3.5 opacity-60" />
                                  <span>{groupLabel}</span>
                                </div>

                                {/* Items list */}
                                <div className="flex flex-col gap-1.5">
                                  {groupItems.map((item) => {
                                    const isActive = item.id === activeChatId;
                                    return (
                                      <button
                                        key={item.id}
                                        onClick={() => {
                                          setActiveChatId(item.id);
                                          setInputText(item.preview);
                                          if (item.type === 'enterprise' && item.enterpriseName) {
                                            setSelectedTeam(item.enterpriseName);
                                          }
                                          setShowHistoryDropdown(false);
                                        }}
                                        className={`w-full flex flex-col text-left p-3 rounded-xl border transition-all duration-200 ${
                                          isActive 
                                            ? cls('bg-gray-100/80 border-gray-200 shadow-xs', 'bg-white/[0.07] border-white/10 shadow-xs') 
                                            : cls('bg-transparent border-transparent hover:bg-gray-50 hover:border-gray-100', 'bg-transparent border-transparent hover:bg-white/[0.03] hover:border-[#18181b]/5')
                                        }`}
                                      >
                                        {/* Row 1: Title + Time */}
                                        <div className="flex items-start justify-between gap-2 w-full">
                                          <span className={`truncate text-xs font-bold leading-snug flex-1 pr-1 ${isActive ? cls('text-gray-950 font-extrabold', 'text-white font-extrabold') : cls('text-gray-800', 'text-gray-200')}`}>
                                            {item.title}
                                          </span>
                                          <span className={`text-[10px] font-normal shrink-0 mt-0.5 ${cls('text-gray-400', 'text-gray-500')}`}>
                                            {item.time}
                                          </span>
                                        </div>

                                        {/* Row 2: Dialogue summary text */}
                                        <p className={`text-[11px] font-medium leading-relaxed mt-1 line-clamp-2 pr-1.5 ${cls('text-gray-400', 'text-gray-500')}`}>
                                          {item.preview || (lang === 'zh' ? '暂无对话摘要' : 'No summary available')}
                                        </p>

                                        {/* Row 3: Messages count */}
                                        <div className="flex items-center gap-1 mt-2 font-medium text-[10px]">
                                          <MessageSquare className={`w-3.5 h-3.5 ${isActive ? cls('text-gray-600', 'text-gray-300') : 'text-gray-400 dark:text-gray-500'}`} />
                                          <span className={isActive ? cls('text-gray-600', 'text-gray-300') : cls('text-gray-400', 'text-gray-500')}>
                                            {item.messageCount} {lang === 'zh' ? '条消息' : 'messages'}
                                          </span>
                                        </div>
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}

                          {chatHistoryList.filter(item => {
                            if (!historySearchQuery) return true;
                            const query = historySearchQuery.toLowerCase();
                            return item.title.toLowerCase().includes(query) || item.preview.toLowerCase().includes(query);
                          }).length === 0 && (
                            <div className={`text-center py-8 text-xs font-medium select-none ${cls('text-gray-400', 'text-gray-500')}`}>
                              {lang === 'zh' ? '没有找到相关的对话记录' : 'No matching conversations found'}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
                className={`p-3 rounded-full relative transition-shadow hover:shadow-md ${cls('bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-gray-600', 'bg-[#18181b] shadow-none text-gray-300')}`}
                title={lang === 'zh' ? 'Switch to English' : '切换到中文'}
              >
                <Languages className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`p-3 rounded-full relative transition-shadow hover:shadow-md ${cls('bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-gray-600', 'bg-[#18181b] shadow-none text-gray-300')}`}
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button className={`p-3 rounded-full relative transition-shadow hover:shadow-md ${cls('bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-gray-600', 'bg-[#18181b] shadow-none text-gray-300')}`}>
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2.5 w-2 h-2 bg-[#FF7E67] rounded-full ring-2 ring-transparent"></span>
              </button>
              <button className={`p-3 rounded-full transition-shadow hover:shadow-md ${cls('bg-white shadow-[0_4px_20px_rgba(0,0,0,0.04)] text-gray-600', 'bg-[#18181b] shadow-none text-gray-300')}`}>
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </header>
          )}

          <AnimatePresence mode="wait">
          {activeView === 'dashboard' && (
            <motion.main 
              key="dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col h-full"
            >
              <DashboardView />
            </motion.main>
          )}
          {activeView === 'aiAgent' && (
            <motion.div 
              key="aiAgent"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col flex-1 max-w-4xl mx-auto w-full relative xl:mt-[-40px]"
            >
              <div className="flex-1 overflow-y-auto w-full flex flex-col items-center justify-start select-none pt-[12vh] pb-8" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                 <h2 className={`text-center font-serif font-bold tracking-tight mb-2 px-4 ${cls('text-gray-900', 'text-white')}`} style={{ fontSize: '2.25rem', letterSpacing: '-0.02em' }}>
                    {t.aiGreeting1}
                 </h2>
                 <p className={`text-center font-medium mb-10 max-w-xl px-6 ${cls('text-gray-500', 'text-gray-400')}`} style={{ fontSize: '1rem', lineHeight: '1.5' }}>
                    {t.aiGreeting2}
                 </p>

                 <div className="w-full flex flex-row flex-nowrap items-center justify-center gap-3 px-4 mb-4 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {[
                      { icon: PenLine, title: t.aiSuggestion1Title, desc: t.aiSuggestion1Desc, iconColor: 'text-emerald-500 dark:text-emerald-400', bgClass: 'bg-emerald-500/10 dark:bg-emerald-500/20' },
                      { icon: Terminal, title: t.aiSuggestion2Title, desc: t.aiSuggestion2Desc, iconColor: 'text-blue-500 dark:text-blue-400', bgClass: 'bg-blue-500/10 dark:bg-blue-500/20' },
                      { icon: ImageIcon, title: t.aiSuggestion3Title, desc: t.aiSuggestion3Desc, iconColor: 'text-purple-500 dark:text-purple-400', bgClass: 'bg-purple-500/10 dark:bg-purple-500/20' },
                      { icon: BookOpen, title: t.aiSuggestion4Title, desc: t.aiSuggestion4Desc, iconColor: 'text-orange-500 dark:text-orange-400', bgClass: 'bg-orange-500/10 dark:bg-orange-500/20' },

                    ].map((item, index) => (
                      <button 
                        key={index}
                        onClick={() => {
                          setInputText(item.desc);
                          if (textareaRef.current) {
                            textareaRef.current.focus();
                          }
                        }}
                        className={`inline-flex items-center gap-3.5 pl-2 pr-6 py-2.5 min-w-[170px] rounded-full border transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xs cursor-pointer active:scale-95 ${cls(
                          'bg-white hover:bg-gray-50 border-gray-200/80 text-gray-700 shadow-2xs',
                          'bg-[#1c1c1f]/50 hover:bg-[#1c1c1f]/80 border-white/5 text-zinc-300'
                        )}`}
                      >
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${item.bgClass}`}>
                          <item.icon className={`w-4 h-4 stroke-[2.5] ${item.iconColor}`} />
                        </span>
                        <span className="text-[14.5px] font-extrabold tracking-normal text-left">{item.title}</span>
                      </button>
                    ))}
                 </div>
              </div>

              <div ref={inputAreaRef} className={`mt-auto relative z-10 w-full rounded-[24px] p-4 flex flex-col gap-4 shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-colors backdrop-blur-3xl ${cls('bg-white/95', 'bg-[#18181b]/95')}`}>
                
                {/* Inspiration menu popup */}
                <AnimatePresence>
                {showInspirationMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute bottom-[56px] left-[70px] rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] text-[15px] font-semibold flex flex-col gap-1 w-[260px] max-h-[300px] overflow-y-auto origin-bottom-left backdrop-blur-2xl ${cls('bg-white/95', 'bg-[#27272a]/95')}`}
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {teamList.map((teamName) => (
                      <button 
                        key={teamName}
                        onClick={() => { handleTeamSelect(teamName); setShowInspirationMenu(false); }}
                        className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-2xl transition-colors ${cls('hover:bg-gray-100 text-gray-700', 'hover:bg-[#27272a] text-gray-300')} ${selectedTeam === teamName ? (isDarkMode ? 'bg-[#3f3f46] text-white' : 'bg-gray-100 text-black') : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: getTeamColor(teamName) }} />
                          <span className="truncate">{teamName}</span>
                        </div>
                        {selectedTeam === teamName && <Check className="w-4 h-4 shrink-0 transition-opacity" />}
                      </button>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Model menu popup */}
                <AnimatePresence>
                {showModelMenu && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute bottom-[56px] right-[124px] rounded-3xl p-2 shadow-[0_12px_40px_rgba(0,0,0,0.12)] text-[15px] font-semibold flex flex-col gap-1 w-[180px] origin-bottom-right backdrop-blur-2xl ${cls('bg-white/95', 'bg-[#27272a]/95')}`}
                  >
                    {['豆包2.0', 'DeepSeek', 'Qwen3.5'].map((model) => (
                      <button 
                        key={model}
                        onClick={() => { setSelectedModel(model); setShowModelMenu(false); }}
                        className={`w-full flex items-center justify-between text-left px-4 py-3 rounded-2xl transition-colors ${cls('hover:bg-gray-100 text-gray-700', 'hover:bg-[#27272a] text-gray-300')} ${selectedModel === model ? (isDarkMode ? 'bg-[#3f3f46] text-white' : 'bg-gray-100 text-black') : ''}`}
                      >
                        <span>{model}</span>
                        {selectedModel === model && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </motion.div>
                )}
                </AnimatePresence>

                {/* Uploaded file preview chips */}
                {uploadedFiles.length > 0 && (
                  <motion.div 
                    layout
                    className="flex flex-wrap gap-2 px-3 pb-3 pt-1 border-b border-gray-100 dark:border-white/5"
                  >
                    <AnimatePresence>
                      {uploadedFiles.map((file) => {
                        const isImage = file.type.startsWith('image/');
                        const fileStyle = getFileIconAndColor(file.name, file.type);
                        return (
                          <motion.div
                            key={file.id}
                            initial={{ opacity: 0, scale: 0.85, y: 5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.85, y: 5 }}
                            transition={{ duration: 0.15 }}
                            className={`flex items-center gap-2.5 p-1 rounded-[16px] text-xs font-semibold select-none group border transition-all ${fileStyle.bgColor} ${cls('text-gray-800', 'text-gray-200')}`}
                          >
                            <div className="flex items-center gap-2 max-w-[170px] sm:max-w-[220px]">
                              {isImage && file.url ? (
                                <img
                                  src={file.url}
                                  alt={file.name}
                                  className="w-7 h-7 rounded-[10px] object-cover bg-gray-200 shadow-sm shrink-0"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 bg-white dark:bg-black/20 shadow-sm ${fileStyle.iconColor}`}>
                                  <fileStyle.Icon className="w-4 h-4" />
                                </div>
                              )}
                              <div className="flex flex-col min-w-0 pr-1">
                                <span className="truncate text-[11px] leading-tight font-bold">{file.name}</span>
                                <span className="text-[9px] opacity-50 font-normal leading-tight">{file.size}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => removeUploadedFile(file.id)}
                              className={`p-1 mr-0.5 rounded-full transition-colors ${cls('hover:bg-black/5 text-gray-400 hover:text-black', 'hover:bg-white/10 text-gray-400 hover:text-white')}`}
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </motion.div>
                )}

                <textarea 
                  ref={textareaRef}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onFocus={() => {
                    setShowAddMenu(false);
                    setShowInspirationMenu(false);
                    setShowModelMenu(false);
                  }}
                  placeholder={t.chatPlaceholder}
                  rows={1}
                  className={`w-full bg-transparent focus:outline-none px-4 pt-3 pb-1 text-[17px] font-medium leading-relaxed resize-none ${cls('placeholder-gray-400 text-black', 'placeholder-gray-500 text-white')}`}
                  style={{ maxHeight: '140px', overflowY: 'auto' }}
                />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      multiple
                      onChange={handleFileUpload} 
                    />
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-colors ${cls('bg-transparent hover:bg-black/5 text-gray-600', 'bg-transparent hover:bg-white/5 text-gray-300')}`}
                    >
                      <Plus className="w-5 h-5 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setShowInspirationMenu(!showInspirationMenu); setShowAddMenu(false); setShowModelMenu(false); }}
                      className={`h-[44px] px-4 rounded-2xl flex items-center gap-2 text-[15px] font-bold transition-colors ${cls('bg-transparent hover:bg-black/5 text-gray-700', 'bg-transparent hover:bg-white/5 text-gray-300')}`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full shrink-0 animate-scale-in" style={{ backgroundColor: getTeamColor(selectedTeam) }} />
                      <span className="max-w-[124px] truncate">{selectedTeam}</span>
                      <ChevronDown className="w-4 h-4 shrink-0 opacity-40 ml-1" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2.5">
                     <button 
                       onClick={() => { setShowModelMenu(!showModelMenu); setShowAddMenu(false); setShowInspirationMenu(false); }}
                       className={`h-[44px] px-4 rounded-2xl flex items-center gap-2 text-[15px] font-bold transition-colors ${cls('hover:bg-gray-50 text-gray-700', 'hover:bg-[#27272a] text-gray-300')}`}
                     >
                        {selectedModel} <ChevronDown className="w-4 h-4 shrink-0 opacity-40 ml-1" />
                     </button>

                     <button className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-colors ${cls('hover:bg-gray-100 text-gray-500', 'hover:bg-[#3f3f46] text-gray-400')}`}>
                       <Mic className="w-5 h-5 shrink-0" />
                     </button>

                     <button 
                       onClick={() => {}} style={{ display: 'none' }} //
                       title={t.dialogueHistory}
                       className={`w-[44px] h-[44px] rounded-2xl flex items-center justify-center transition-colors ${cls('hover:bg-gray-100 text-gray-500 hover:text-black', 'hover:bg-white/5 text-gray-300 hover:text-white')}`}
                     >
                       <History className="w-5 h-5 shrink-0" />
                     </button>

                     <button className={`w-[44px] h-[44px] rounded-xl flex items-center justify-center transition-colors shadow-sm ${cls('bg-black/10 hover:bg-black/20 text-[#111827]', 'bg-white/10 hover:bg-white/20 text-white')}`}>
                       <ArrowUp className="w-5 h-5 shrink-0" strokeWidth={2} />
                     </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          </AnimatePresence>

          {/* Conversation History Modal */}
          <AnimatePresence>
            {false && showHistoryModal && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
                onClick={() => setShowHistoryModal(false)}
              >
                <motion.div 
                  initial={{ scale: 0.95, y: 15, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.95, y: 15, opacity: 0 }}
                  transition={{ type: "spring", duration: 0.4 }}
                  className={`relative w-full max-w-2xl h-[80vh] max-h-[640px] rounded-[32px] shadow-[0_24px_60px_rgba(0,0,0,0.25)] flex flex-col overflow-hidden border ${cls('bg-white border-gray-100', 'bg-[#18181b] border-white/5')}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div className={`p-6 pb-4 flex items-center justify-between border-b ${cls('border-gray-100', 'border-white/5')}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${cls('bg-amber-50 text-amber-600', 'bg-amber-500/10 text-amber-400')}`}>
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className={`font-serif text-lg font-bold tracking-tight ${cls('text-gray-900 text-left', 'text-white text-left')}`}>
                          {t.dialogueHistory}
                        </h3>
                        <p className={`text-xs text-left ${cls('text-gray-400', 'text-gray-500')}`}>
                          {lang === 'zh' ? '管理并载入您的历史 AI 会话进程' : 'Manage and restore your historical AI session progress'}
                        </p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowHistoryModal(false)}
                      className={`p-2 rounded-full transition-colors ${cls('hover:bg-gray-100 text-gray-400 hover:text-black', 'hover:bg-white/5 text-gray-500 hover:text-white')}`}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Search and Filters */}
                  <div className={`p-6 pb-2 flex flex-col gap-4 border-b ${cls('border-gray-50', 'border-white/5')}`}>
                    {/* Search Input */}
                    <div className="relative">
                      <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${cls('text-gray-400', 'text-gray-500')}`} />
                      <input 
                        type="text"
                        value={historySearchQuery}
                        onChange={(e) => setHistorySearchQuery(e.target.value)}
                        placeholder={t.searchHistory}
                        className={`w-full pl-11 pr-4 py-3 rounded-2xl text-[14px] font-medium transition-all focus:outline-none ${cls('bg-gray-50 text-black placeholder-gray-400 focus:bg-gray-100', 'bg-[#27272a] text-white placeholder-gray-500 focus:bg-[#3f3f46]')}`}
                      />
                      {historySearchQuery && (
                        <button 
                          onClick={() => setHistorySearchQuery('')}
                          className={`absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold leading-none p-1 rounded-full ${cls('hover:bg-gray-200 text-gray-500', 'hover:bg-[#3f3f46] text-gray-400')}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1 bg-black/[0.03] dark:bg-white/[0.02] rounded-2xl">
                      {[
                        { id: 'all', label: t.allChat },
                        { id: 'public', label: t.publicChat },
                        { id: 'enterprise', label: t.enterpriseChat }
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setHistoryActiveTab(tab.id as any)}
                          className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all ${
                            historyActiveTab === tab.id 
                              ? cls('bg-white text-black shadow-sm', 'bg-[#27272a] text-white')
                              : cls('text-gray-400 hover:text-gray-800', 'text-gray-500 hover:text-white')
                          }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* List of Histories */}
                  <div className="flex-1 overflow-y-auto p-6" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {(() => {
                      const filtered = chatHistoryList.filter((item) => {
                        // search filter
                        const matchesSearch = item.title.toLowerCase().includes(historySearchQuery.toLowerCase()) || 
                                              item.preview.toLowerCase().includes(historySearchQuery.toLowerCase());
                        // tab filter
                        if (historyActiveTab === 'all') return matchesSearch;
                        return matchesSearch && item.type === historyActiveTab;
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="h-full flex flex-col items-center justify-center text-center py-12">
                            <History className={`w-12 h-12 mb-3 stroke-[1.2] opacity-40 ${cls('text-gray-400', 'text-gray-600')}`} />
                            <p className={`text-sm font-semibold opacity-60 ${cls('text-gray-500', 'text-gray-400')}`}>
                              {t.historyPlaceholder}
                            </p>
                          </div>
                        );
                      }

                      return (
                        <div className="flex flex-col gap-3">
                          {filtered.map((item) => {
                            const isEnterprise = item.type === 'enterprise';
                            const entColor = getTeamColor(item.enterpriseName || '');
                            
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setInputText(item.preview);
                                  if (isEnterprise && item.enterpriseName) {
                                    setSelectedTeam(item.enterpriseName);
                                  }
                                  setShowHistoryModal(false);
                                }}
                                className={`group p-4 rounded-[20px] border text-left cursor-pointer transition-all hover:scale-[1.01] hover:shadow-xs flex gap-3 items-start relative overflow-hidden ${cls('bg-[#f4f4f5]/40 border-gray-100 hover:bg-[#f4f4f5]/80 hover:border-gray-200', 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10')}`}
                              >
                                {isEnterprise ? (
                                  <div 
                                    className="w-1 absolute left-0 top-0 bottom-0" 
                                    style={{ backgroundColor: entColor }}
                                  />
                                ) : null}

                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cls('bg-white shadow-xs text-gray-500', 'bg-black/30 text-gray-400')}`}>
                                  {isEnterprise ? (
                                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entColor }} />
                                  ) : (
                                    <Bot className="w-4 h-4 text-amber-500" />
                                  )}
                                </div>

                                <div className="flex-1 min-w-0 pr-10">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className={`text-[15px] font-bold truncate block ${cls('text-gray-900', 'text-white')}`}>
                                      {item.title}
                                    </span>
                                  </div>
                                  <p className={`text-xs font-semibold truncate opacity-60 mb-2 ${cls('text-gray-500', 'text-gray-400')}`}>
                                    {item.preview}
                                  </p>

                                  <div className="flex items-center gap-2.5 flex-wrap">
                                    <span className={`text-[10px] font-bold ${cls('text-gray-400', 'text-gray-500')}`}>
                                      {item.time}
                                    </span>
                                    {isEnterprise && item.enterpriseName && (
                                      <span 
                                        className="text-[9px] font-extrabold px-2 py-0.5 rounded-md leading-relaxed tracking-wider border flex items-center gap-1.5"
                                        style={{ 
                                          borderColor: `${entColor}25`, 
                                          color: entColor,
                                          backgroundColor: `${entColor}12`
                                        }}
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: entColor }} />
                                        {item.enterpriseName}
                                      </span>
                                    )}
                                    {!isEnterprise && (
                                      <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-md leading-relaxed tracking-wider border ${cls('bg-gray-100 border-gray-200 text-gray-500', 'bg-white/5 border-white/5 text-gray-400')}`}>
                                        {t.publicChat}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Delete History Row Button */}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setChatHistoryList((prev) => prev.filter((h) => h.id !== item.id));
                                  }}
                                  className={`absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100 ${cls('hover:bg-red-50 text-gray-400 hover:text-red-500', 'hover:bg-red-500/10 text-gray-500 hover:text-red-400')}`}
                                  title={lang === 'zh' ? '删除此条记录' : 'Delete record'}
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Modal Footer */}
                  <div className={`p-6 border-t flex items-center justify-between ${cls('border-gray-100 bg-gray-50/50', 'border-white/5 bg-[#1f1f23]/40')}`}>
                    <button 
                      onClick={() => {
                        setChatHistoryList([]);
                      }}
                      disabled={chatHistoryList.length === 0}
                      className={`text-xs font-bold transition-all ${
                        chatHistoryList.length === 0
                          ? 'opacity-30 cursor-not-allowed text-gray-400'
                          : cls('text-red-500 hover:text-red-600 hover:underline', 'text-red-400 hover:text-red-300 hover:underline')
                      }`}
                    >
                      {t.clearHistory}
                    </button>

                    <button 
                      onClick={() => {
                        setInputText('');
                        setUploadedFiles([]);
                        setShowHistoryModal(false);
                      }}
                      className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold shadow-sm transition-all flex items-center gap-1.5 ${cls('bg-black hover:bg-black/85 text-white', 'bg-white hover:bg-white/90 text-black')}`}
                    >
                      <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                      {t.newChat}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
