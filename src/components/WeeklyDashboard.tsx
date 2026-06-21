import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Plus,
  Compass,
  Plane,
  ShoppingBag,
  CreditCard,
  Briefcase,
  HelpCircle,
  Smartphone,
  Globe,
  Hotel,
  ShoppingCart,
  BookOpen,
  Check,
  CheckSquare,
  Square,
  X,
  Sparkles,
  ArrowUpRight,
  DollarSign
} from 'lucide-react';

interface WeeklyDashboardProps {
  lang: 'zh' | 'en';
  isDarkMode: boolean;
  onNavigateToAgent?: () => void;
}

interface WalletItem {
  id: string;
  currency: string;
  code: 'USD' | 'EUR' | 'GBP';
  flag: string;
  amount: string;
  limit: string;
  status: 'Active' | 'Inactive';
}

interface ActivityItem {
  id: string;
  orderId: string;
  type: string;
  icon: React.ComponentType<any>;
  iconBg: string;
  iconColor: string;
  price: string;
  priceNumeric: number;
  status: 'Completed' | 'Pending' | 'In Progress';
  date: string;
  checked: boolean;
}

export default function WeeklyDashboard({ lang, isDarkMode, onNavigateToAgent }: WeeklyDashboardProps) {
  // Translations
  const t = {
    title: lang === 'zh' ? '早上好，Sajibur' : 'Good morning, Sajibur',
    subtitle: lang === 'zh' ? '随时掌控您的任务，监控进度并追踪状态。' : 'Stay on top of your tasks, monitor progress, and track status.',
    totalBalance: lang === 'zh' ? '总余额' : 'Total Balance',
    transfer: lang === 'zh' ? '转账' : 'Transfer',
    request: lang === 'zh' ? '请求' : 'Request',
    wallets: lang === 'zh' ? '钱包 | 共 6 个钱包' : 'Wallets | Total 6 wallets',
    active: lang === 'zh' ? '已激活' : 'Active',
    inactive: lang === 'zh' ? '未激活' : 'Inactive',
    totalEarnings: lang === 'zh' ? '总收益' : 'Total Earnings',
    totalSpending: lang === 'zh' ? '总支出' : 'Total Spending',
    totalIncome: lang === 'zh' ? '总收入' : 'Total Income',
    totalRevenue: lang === 'zh' ? '总税收' : 'Total Revenue',
    thisMonth: lang === 'zh' ? '本月' : 'This month',
    thanLastMonth: lang === 'zh' ? '相比上个月' : 'than last month',
    profitAndLoss: lang === 'zh' ? '损益走势' : 'Profit and Loss',
    viewIncomePeriod: lang === 'zh' ? '在特定时间段内查看您的收入' : 'View your income in a certain period of time',
    profit: lang === 'zh' ? '利润' : 'Profit',
    loss: lang === 'zh' ? '亏损' : 'Loss',
    monthlySpendingLimit: lang === 'zh' ? '月度消费限额' : 'Monthly Spending Limit',
    spentOutOf: lang === 'zh' ? '已消费，限额：' : 'spent out of',
    myCards: lang === 'zh' ? '我的卡片' : 'My Cards',
    addNew: lang === 'zh' ? '添加新卡' : 'Add new',
    recentActivities: lang === 'zh' ? '最近活动记录' : 'Recent Activities',
    searchPlaceholder: lang === 'zh' ? '搜索活动或订单 ID...' : 'Search',
    filterLabel: lang === 'zh' ? '筛选' : 'Filter',
    completedBadge: lang === 'zh' ? '已完成' : 'Completed',
    pendingBadge: lang === 'zh' ? '待处理' : 'Pending',
    inProgressBadge: lang === 'zh' ? '进行中' : 'In Progress',
  };

  // State
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'GBP'>('USD');
  const [currencyDropdownOpen, setCurrencyDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Completed' | 'Pending' | 'In Progress'>('All');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  
  // Interactive Modal States
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);
  const [transferAmount, setTransferAmount] = useState('100.00');
  const [transferTo, setTransferTo] = useState('Kim Dokja');

  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [requestAmount, setRequestAmount] = useState('150.00');

  const [addCardModalOpen, setAddCardModalOpen] = useState(false);
  const [newCardNumber, setNewCardNumber] = useState('5432');
  const [newCardType, setNewCardType] = useState('VISA');

  // Wallets Data
  const [wallets, setWallets] = useState<WalletItem[]>([
    {
      id: 'w1',
      currency: '🇺🇸 USD',
      code: 'USD',
      flag: '🇺🇸',
      amount: '$22,678.00',
      limit: 'Limit is $10k a month',
      status: 'Active',
    },
    {
      id: 'w2',
      currency: '🇪🇺 EUR',
      code: 'EUR',
      flag: '🇪🇺',
      amount: '€18,345.00',
      limit: 'Limit is €8k a month',
      status: 'Active',
    },
    {
      id: 'w3',
      currency: '🇬🇧 GBP',
      code: 'GBP',
      flag: '🇬🇧',
      amount: '£15,000.00',
      limit: 'Limit is £7.5k a month',
      status: 'Inactive',
    },
  ]);

  // Handle wallet toggle state click
  const toggleWalletStatus = (id: string) => {
    setWallets(prev => prev.map(w => {
      if (w.id === id) {
        return { ...w, status: w.status === 'Active' ? 'Inactive' : 'Active' };
      }
      return w;
    }));
  };

  // Recent Activities list state
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: 'act1',
      orderId: 'INV_000076',
      type: 'Mobile App Purchase',
      icon: Smartphone,
      iconBg: 'bg-blue-50 dark:bg-blue-950/40',
      iconColor: 'text-blue-500',
      price: '$25,500',
      priceNumeric: 25500,
      status: 'Completed',
      date: '17 Apr, 2026 03:45 PM',
      checked: false,
    },
    {
      id: 'act2',
      orderId: 'INV_000075',
      type: 'Hotel Booking',
      icon: Hotel,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      iconColor: 'text-indigo-500',
      price: '$32,750',
      priceNumeric: 32750,
      status: 'Pending',
      date: '15 Apr, 2026 11:30 AM',
      checked: false,
    },
    {
      id: 'act3',
      orderId: 'INV_000074',
      type: 'Flight Ticket Booking',
      icon: Plane,
      iconBg: 'bg-sky-50 dark:bg-sky-950/40',
      iconColor: 'text-sky-500',
      price: '$40,200',
      priceNumeric: 40200,
      status: 'Completed',
      date: '15 Apr, 2026 12:00 PM',
      checked: false,
    },
    {
      id: 'act4',
      orderId: 'INV_000073',
      type: 'Grocery Purchase',
      icon: ShoppingCart,
      iconBg: 'bg-amber-50 dark:bg-amber-950/40',
      iconColor: 'text-amber-500',
      price: '$50,200',
      priceNumeric: 50200,
      status: 'In Progress',
      date: '14 Apr, 2026 09:15 PM',
      checked: true,
    },
    {
      id: 'act5',
      orderId: 'INV_000073',
      type: 'Software License',
      icon: Briefcase,
      iconBg: 'bg-rose-50 dark:bg-rose-955/40',
      iconColor: 'text-rose-500',
      price: '$15,900',
      priceNumeric: 15900,
      status: 'Completed',
      date: '10 Apr, 2026 06:00 AM',
      checked: false,
    },
  ]);

  // Handle checking row items
  const toggleRowCheck = (id: string) => {
    setActivities(prev =>
      prev.map(act => (act.id === id ? { ...act, checked: !act.checked } : act))
    );
  };

  // Filter activities dynamically
  const filteredActivities = useMemo(() => {
    return activities.filter(act => {
      const matchQuery =
        act.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = statusFilter === 'All' || act.status === statusFilter;
      return matchQuery && matchFilter;
    });
  }, [activities, searchQuery, statusFilter]);

  // Handle transfer process
  const performTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferAmount) return;
    
    // Add transaction locally
    const formattedDate = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newId = `new_tx_${Date.now()}`;
    const newTx: ActivityItem = {
      id: newId,
      orderId: `INV_0000${Math.floor(10 + Math.random() * 89)}`,
      type: `Transfer to ${transferTo}`,
      icon: ArrowUpRight,
      iconBg: 'bg-slate-100 dark:bg-slate-800',
      iconColor: 'text-slate-600',
      price: `-$${parseFloat(transferAmount).toLocaleString()}`,
      priceNumeric: parseFloat(transferAmount),
      status: 'Completed',
      date: formattedDate,
      checked: false,
    };

    setActivities(prev => [newTx, ...prev]);
    setTransferSuccess(true);
    setTimeout(() => {
      setTransferSuccess(false);
      setTransferModalOpen(false);
    }, 1500);
  };

  // Handle Request process
  const performRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestAmount) return;

    const formattedDate = new Date().toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const newId = `new_tx_${Date.now()}`;
    const newTx: ActivityItem = {
      id: newId,
      orderId: `REQ_0000${Math.floor(10 + Math.random() * 89)}`,
      type: 'Received Request Fund',
      icon: Plus,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      iconColor: 'text-emerald-500',
      price: `+$${parseFloat(requestAmount).toLocaleString()}`,
      priceNumeric: parseFloat(requestAmount),
      status: 'Pending',
      date: formattedDate,
      checked: false,
    };

    setActivities(prev => [newTx, ...prev]);
    setRequestSuccess(true);
    setTimeout(() => {
      setRequestSuccess(false);
      setRequestModalOpen(false);
    }, 1500);
  };

  // Handle adding card
  const [cards, setCards] = useState([
    {
      id: 'c1',
      number: '•••• •••• 6782',
      exp: '09/29',
      cvv: '611',
      type: 'mastercard',
      activeStatus: true,
      bg: 'bg-zinc-950 text-white dark:bg-zinc-900 border border-zinc-800'
    },
    {
      id: 'c2',
      number: '•••• •••• 4356',
      exp: '11/30',
      cvv: '542',
      type: 'visa',
      activeStatus: true,
      bg: 'bg-[#FF5A36] text-white'
    }
  ]);

  const performAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard = {
      id: `card_${Date.now()}`,
      number: `•••• •••• ${newCardNumber}`,
      exp: '12/32',
      cvv: '901',
      type: newCardType.toLowerCase(),
      activeStatus: true,
      bg: newCardType === 'VISA' ? 'bg-sky-750 text-white' : 'bg-slate-900 text-white'
    };
    setCards(prev => [...prev, newCard]);
    setAddCardModalOpen(false);
    setNewCardNumber('5432');
  };

  const currentThemeCardBg = isDarkMode ? 'bg-[#151518] border border-zinc-800/80 shadow-[0_4px_30px_rgba(0,0,0,0.15)] text-zinc-100' : 'bg-white border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.015)] text-zinc-800';

  return (
    <div className="w-full text-left py-4 sm:py-6">
      
      {/* HEADER ROW */}
      <div className="flex flex-col gap-1 mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
          {t.title}
        </h1>
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
          {t.subtitle}
        </p>
      </div>

      {/* DASHBOARD GRID CONTAINER */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        
        {/* ================= LEFT SECTION (xl:col-span-4 / 4 Column Area) ================= */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          {/* TOTAL BALANCE BLOCK */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between relative overflow-hidden transition-all duration-300 ${currentThemeCardBg}`}>
            
            {/* Top Row: Total Balance label & USD Select */}
            <div className="flex justify-between items-center w-full mb-3">
              <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight">
                {t.totalBalance}
              </span>

              {/* Pseudo currency selector dropdown */}
              <div className="relative">
                <button
                  onClick={() => setCurrencyDropdownOpen(!currencyDropdownOpen)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200/50 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all text-zinc-700 dark:text-zinc-200"
                >
                  <span className="text-xs mb-0.5">
                    {selectedCurrency === 'USD' ? '🇺🇸' : selectedCurrency === 'EUR' ? '🇪🇺' : '🇬🇧'}
                  </span>
                  <span>{selectedCurrency}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                <AnimatePresence>
                  {currencyDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1.5 z-40 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-lg rounded-xl py-1 md:w-28 text-left text-xs font-semibold"
                    >
                      {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                        <button
                          key={curr}
                          onClick={() => {
                            setSelectedCurrency(curr);
                            setCurrencyDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 text-left"
                        >
                          <span>{curr === 'USD' ? '🇺🇸' : curr === 'EUR' ? '🇪🇺' : '🇬🇧'}</span>
                          <span>{curr}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Middle Row: Big amount */}
            <div className="flex flex-col gap-1 items-start mb-6">
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-neutral-50">
                $689,372.00
              </h2>
              <div className="inline-flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full mt-1">
                <span>↑ 5%</span>
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">{t.thanLastMonth}</span>
              </div>
            </div>

            {/* Action Buttons: Transfer / Request */}
            <div className="flex gap-3 mb-6">
              <button 
                onClick={() => setTransferModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-black select-none transition-all duration-200 bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-150 shadow-xs active:scale-97"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 rotate-90" />
                <span>{t.transfer}</span>
              </button>
              <button 
                onClick={() => setRequestModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-black select-none border border-zinc-200/80 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-all text-zinc-800 dark:text-zinc-200 active:scale-97"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 rotate-270" />
                <span>{t.request}</span>
              </button>
            </div>

            <hr className="border-t border-neutral-100 dark:border-zinc-800/80 mb-5" />

            {/* Wallet Subsegment title */}
            <div className="mb-4">
              <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500">
                {t.wallets}
              </span>
            </div>

            {/* 3 Wallets Side-by-Side Flex Items */}
            <div className="flex flex-col sm:flex-row gap-3">
              {wallets.map((w) => (
                <div
                  key={w.id}
                  onClick={() => toggleWalletStatus(w.id)}
                  className={`flex-1 flex flex-col p-3 rounded-2xl border text-left cursor-pointer transition-all duration-200 relative group hover:border-blue-500 dark:hover:border-blue-500
                    ${w.status === 'Active'
                      ? 'bg-neutral-50/50 dark:bg-zinc-900/40 border-neutral-200/50 dark:border-zinc-800/80'
                      : 'bg-neutral-100/40 dark:bg-zinc-950/20 border-neutral-200/30 dark:border-zinc-900/40 opacity-70'}`}
                >
                  {/* Currency flag and dot indicator */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg leading-none">{w.flag}</span>
                    <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight font-mono">{w.code}</span>
                  </div>

                  <span className="text-[13px] font-extrabold text-zinc-900 dark:text-white leading-tight mb-1">
                    {w.amount}
                  </span>
                  
                  <span className="text-[9px] font-semibold text-zinc-400 leading-tight mb-2.5 lines-clamp-1">
                    {w.limit}
                  </span>

                  {/* Status chip */}
                  <div className="flex items-center gap-1 mt-auto">
                    <span className={`w-1.5 h-1.5 rounded-full ${w.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${w.status === 'Active' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {w.status === 'Active' ? t.active : t.inactive}
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* ================= MIDDLE SECTION (xl:col-span-4 / Grid of 4 statistic squares) ================= */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className="grid grid-cols-2 gap-4 h-full">

            {/* CARD 1: TOTAL EARNINGS (VIBRANT CHILI GRADIENT) */}
            <div className="rounded-3xl p-5 md:p-6 bg-[#FE501A] text-white flex flex-col justify-between shadow-sm relative overflow-hidden group cursor-pointer transition-transform hover:scale-101">
              {/* Abs grid bg */}
              <div className="absolute inset-0 bg-mesh-grid opacity-10 pointer-events-none" />
              
              <div className="flex justify-between items-start w-full">
                <span className="text-[13px] font-bold text-white/80 tracking-tight leading-normal">
                  {t.totalEarnings}
                </span>
                <div className="w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-white" />
                </div>
              </div>
              
              <div className="flex flex-col items-start gap-1 mt-6">
                <h3 className="text-3xl font-extrabold tracking-tight leading-none">$950</h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-white/95 mt-1 bg-white/20 px-2 py-0.5 rounded-full">
                  <span>↑ 7%</span>
                  <span className="font-normal text-white/85">{t.thisMonth}</span>
                </div>
              </div>
            </div>

            {/* CARD 2: TOTAL SPENDING */}
            <div className={`rounded-3xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 shadow-2xs group cursor-pointer hover:scale-101 ${currentThemeCardBg}`}>
              <div className="flex justify-between items-start w-full">
                <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-normal">
                  {t.totalSpending}
                </span>
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 mt-6">
                <h3 className="text-3xl font-extrabold tracking-tight leading-none text-zinc-900 dark:text-white">$700</h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-rose-600 dark:text-rose-400 mt-1 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full">
                  <span>↓ 5%</span>
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">{t.thisMonth}</span>
                </div>
              </div>
            </div>

            {/* CARD 3: TOTAL INCOME */}
            <div className={`rounded-3xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 shadow-2xs group cursor-pointer hover:scale-101 ${currentThemeCardBg}`}>
              <div className="flex justify-between items-start w-full">
                <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-normal">
                  {t.totalIncome}
                </span>
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-zinc-500 dark:text-zinc-300" />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 mt-6">
                <h3 className="text-3xl font-extrabold tracking-tight leading-none text-zinc-900 dark:text-white">$1,050</h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                  <span>↑ 8%</span>
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">{t.thisMonth}</span>
                </div>
              </div>
            </div>

            {/* CARD 4: TOTAL REVENUE */}
            <div className={`rounded-3xl p-5 md:p-6 flex flex-col justify-between transition-all duration-300 shadow-2xs group cursor-pointer hover:scale-101 ${currentThemeCardBg}`}>
              <div className="flex justify-between items-start w-full">
                <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight leading-normal">
                  {t.totalRevenue}
                </span>
                <div className="w-8 h-8 rounded-full bg-neutral-100 dark:bg-zinc-800 flex items-center justify-center">
                  <Briefcase className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                </div>
              </div>

              <div className="flex flex-col items-start gap-1 mt-6">
                <h3 className="text-3xl font-extrabold tracking-tight leading-none text-zinc-900 dark:text-white">$850</h3>
                <div className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full">
                  <span>↑ 4%</span>
                  <span className="font-normal text-zinc-400 dark:text-zinc-500">{t.thisMonth}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* ================= RIGHT SECTION (xl:col-span-4 / Profit & Loss Custom Graphic Chart) ================= */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          
          <div className={`rounded-3xl p-6 flex flex-col h-full transition-all duration-300 ${currentThemeCardBg}`}>
            
            {/* Legend row */}
            <div className="flex justify-between items-start mb-1 w-full gap-2">
              <div className="flex flex-col text-left">
                <h3 className="text-[15px] font-black text-zinc-800 dark:text-white tracking-tight">
                  {t.profitAndLoss}
                </h3>
                <span className="text-[10px] sm:text-[11px] text-zinc-400 font-semibold tracking-tight mt-0.5 leading-none">
                  {t.viewIncomePeriod}
                </span>
              </div>
              
              {/* Mini Legend markers */}
              <div className="flex items-center gap-3 shrink-0 text-[10px] font-extrabold tracking-tight">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FE501A]" />
                  <span className="text-zinc-500 dark:text-zinc-450">{t.profit}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-zinc-950 dark:bg-neutral-100" />
                  <span className="text-zinc-500 dark:text-zinc-450">{t.loss}</span>
                </div>
              </div>
            </div>

            {/* CHART CONTAINER: Custom structured high fidelity double column system */}
            <div className="flex-1 w-full min-h-[170px] mt-6 flex flex-col justify-between">
              
              {/* Graphic Matrix with horizontal scales */}
              <div className="flex-1 w-full flex relative items-end">
                
                {/* Horizontal dotted references */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none pb-2 select-none">
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-150 dark:border-zinc-800/60 pb-1">
                    <span className="text-[9px] font-bold text-zinc-400 font-mono leading-none">50k</span>
                  </div>
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-150 dark:border-zinc-800/60 pb-1">
                    <span className="text-[9px] font-bold text-zinc-400 font-mono leading-none">40k</span>
                  </div>
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-150 dark:border-zinc-800/60 pb-1">
                    <span className="text-[9px] font-bold text-zinc-400 font-mono leading-none">30k</span>
                  </div>
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-150 dark:border-zinc-800/60 pb-1">
                    <span className="text-[9px] font-bold text-zinc-400 font-mono leading-none">20k</span>
                  </div>
                  <div className="w-full flex items-center justify-between border-b border-dashed border-neutral-150 dark:border-zinc-800/60 pb-1">
                    <span className="text-[9px] font-bold text-zinc-400 font-mono leading-none">10k</span>
                  </div>
                </div>

                {/* SVG pattern overlay for diagonal hatching lines like the screenshot */}
                <svg className="absolute w-0 h-0">
                  <defs>
                    <pattern id="diagonalHatch" width="4" height="4" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="0" y2="4" stroke="#ff8255" strokeWidth="1.5" />
                    </pattern>
                  </defs>
                </svg>

                {/* Vertical aligned bar columns (Jan - Aug) */}
                <div className="w-full flex justify-between items-end h-[85%] relative z-10 pl-6.5 pr-1 select-none">
                  {[
                    { month: 'Jan', lossHeight: '44%', profitHeight: '32%' },
                    { month: 'Feb', lossHeight: '38%', profitHeight: '48%' },
                    { month: 'Mar', lossHeight: '28%', profitHeight: '44%' },
                    { month: 'Apr', lossHeight: '48%', profitHeight: '36%' },
                    { month: 'May', lossHeight: '40%', profitHeight: '52%' },
                    { month: 'Jun', lossHeight: '56%', profitHeight: '62%' },
                    { month: 'Jul', lossHeight: '44%', profitHeight: '40%' },
                    { month: 'Aug', lossHeight: '36%', profitHeight: '30%' },
                  ].map((bar, index) => (
                    <div key={bar.month} className="flex flex-col items-center flex-1 group">
                      
                      {/* Stacked overlapping visual column bars */}
                      <div className="w-[18px] sm:w-[22px] md:w-[24px] h-32 flex flex-col justify-end items-stretch relative rounded-md overflow-hidden bg-transparent cursor-help">
                        
                        {/* Upper Striped / Hatched Profit bar element */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: bar.profitHeight }}
                          transition={{ duration: 0.8, delay: index * 0.08 }}
                          style={{ backgroundImage: 'linear-gradient(135deg, #FE501A 25%, #ff7347 25%, #ff7347 50%, #FE501A 50%, #FE501A 75%, #ff7347 75%, #ff7347 100%)', backgroundSize: '6px 6px' }}
                          className="w-full rounded-t-md shrink-0 relative filter hover:brightness-105"
                        />

                        {/* Lower Dark Solid Loss bar element (stacked perfectly) */}
                        <motion.div
                          initial={{ height: 0 }}
                          animate={{ height: bar.lossHeight }}
                          transition={{ duration: 0.6, delay: index * 0.05 }}
                          className="w-full bg-[#18181A] dark:bg-white rounded-b-md shrink-0"
                        />
                        
                        {/* Mini tooltip */}
                        <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-1.5 transition-opacity px-2 py-1 bg-zinc-900 border border-zinc-800 text-white font-mono text-[9px] font-black rounded-md z-30 pointer-events-none text-center shadow-xs">
                          P: {parseFloat(bar.profitHeight) * 500}
                          <br />
                          L: {parseFloat(bar.lossHeight) * 500}
                        </div>
                      </div>

                      {/* X Axis Month */}
                      <span className="text-[10px] font-extrabold text-zinc-400 mt-2">
                        {bar.month}
                      </span>
                    </div>
                  ))}
                </div>

              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= SECOND ROW SYSTEM (xl:col-span-12 -> SPLIT INTO 4 + 8) ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch mt-6">
        
        {/* ================= BOTTOM LEFT CARD (COLUMNS: xl:col-span-4 / Monthly Spending Limit + Credit Cards) ================= */}
        <div className="xl:col-span-4 flex flex-col gap-6 justify-between">
          
          {/* MONTHLY SPENDING LIMIT BLOCK */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${currentThemeCardBg}`}>
            
            <div className="flex justify-between items-center mb-5">
              <span className="text-[13px] font-bold text-zinc-500 dark:text-zinc-400 tracking-tight">
                {t.monthlySpendingLimit}
              </span>
              <button className="text-zinc-400 hover:text-zinc-600">
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Custom linear progress slider/bar */}
            <div className="w-full h-3 bg-neutral-100 dark:bg-zinc-850 rounded-full overflow-hidden relative mb-4">
              <div 
                className="h-full bg-[#FE501A] rounded-full transition-all duration-1000"
                style={{ width: '25.45%' }}  // 1400 / 5500 = 25.45%
              />
            </div>

            <div className="flex justify-between items-center w-full">
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                <strong className="text-zinc-800 dark:text-zinc-200 font-extrabold">$1,400.00</strong> {t.spentOutOf}
              </span>
              <span className="text-xs font-extrabold text-zinc-500 dark:text-zinc-400">$5,500.00</span>
            </div>

          </div>

          {/* MY CARDS SCROLLABLE SECTION */}
          <div className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 ${currentThemeCardBg}`}>
            
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4.5 h-4.5 text-[#FE501A]" />
                <span className="text-sm font-extrabold text-zinc-800 dark:text-white">
                  {t.myCards}
                </span>
              </div>
              
              {/* Add New card trigger button */}
              <button 
                onClick={() => setAddCardModalOpen(true)}
                className="flex items-center gap-1 text-[11px] font-extrabold text-[#FE501A] bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100/40 px-3 py-1 rounded-full border border-orange-100/30 transition-all active:scale-97"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{t.addNew}</span>
              </button>
            </div>

            {/* Simulated Horizontal Scroll Carousel */}
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x" style={{ scrollbarWidth: 'none' }}>
              
              {cards.map((card, idx) => (
                <div 
                  key={card.id}
                  className={`w-64 shrink-0 snap-center rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-xs transition-transform hover:scale-[1.01] ${card.bg}`}
                >
                  {/* Decorative faint background matrix glow */}
                  <div className="absolute inset-0 bg-mesh-grid opacity-10 pointer-events-none" />
                  
                  {/* Chip & Active Status */}
                  <div className="flex justify-between items-center mb-6 relative z-10">
                    <div className="w-7 h-5.5 rounded-sm bg-amber-400/80 dark:bg-amber-400/40 border border-amber-300 flex items-center justify-center overflow-hidden">
                      {/* Chip pins */}
                      <span className="text-[5px] text-amber-900 border-b border-neutral-400 w-1/2 flex h-full"></span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                      <span className="text-[9px] font-black uppercase tracking-tight text-white">Active</span>
                    </div>
                  </div>

                  <div className="mb-4 relative z-10">
                    <div className="text-[14px] font-black font-mono tracking-widest text-shadow-sm">
                      {card.number}
                    </div>
                  </div>

                  {/* Exp CVV and card carrier icon flag logo */}
                  <div className="flex justify-between items-end relative z-10 mt-auto">
                    <div className="flex gap-4 text-left">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/60 uppercase">Exp</span>
                        <span className="text-[10px] font-black font-mono">{card.exp}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-white/60 uppercase">CVV</span>
                        <span className="text-[10px] font-black font-mono">{card.cvv}</span>
                      </div>
                    </div>

                    {/* Visa / MasterCard Circular dual overlap blobs logo */}
                    {card.type === 'visa' ? (
                      <span className="text-[13px] font-black tracking-tighter italic text-white/90">VISA</span>
                    ) : (
                      <div className="flex -space-x-2">
                        <div className="w-4 h-4 rounded-full bg-red-500 opacity-90" />
                        <div className="w-4 h-4 rounded-full bg-yellow-400 opacity-95" />
                      </div>
                    )}
                  </div>
                </div>
              ))}

            </div>

          </div>

        </div>

        {/* ================= BOTTOM RIGHT RECENT ACTIVITIES TABLE CARD (Columns: xl:col-span-8) ================= */}
        <div className="xl:col-span-8 flex flex-col justify-between">
          
          <div className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 h-full ${currentThemeCardBg}`}>
            
            {/* Table top toolbar menu head */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">
                {t.recentActivities}
              </h2>

              {/* Tool interactive buttons */}
              <div className="flex items-center gap-3">
                {/* Micro Input Search search element */}
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t.searchPlaceholder}
                    className="w-44 sm:w-56 text-xs font-semibold pl-9 pr-4 py-2 rounded-xl bg-neutral-50 dark:bg-zinc-900 focus:bg-white dark:focus:bg-zinc-950 focus:outline-hidden transition-all text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-800 focus:border-[#FE501A]"
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-650">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdown status Filter */}
                <div className="relative">
                  <button
                    onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-neutral-200/50 dark:border-zinc-800 bg-neutral-50 dark:bg-zinc-900/50 hover:bg-neutral-100 dark:hover:bg-zinc-800 text-xs font-bold transition-all text-zinc-700 dark:text-zinc-200"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-450" />
                    <span>{statusFilter === 'All' ? t.filterLabel : statusFilter}</span>
                    <ChevronDown className="w-3 h-3 text-zinc-400" />
                  </button>

                  <AnimatePresence>
                    {filterDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 5 }}
                        className="absolute right-0 mt-1.5 z-40 bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 shadow-lg rounded-xl py-1 md:w-36 text-left text-xs font-semibold"
                      >
                        {(['All', 'Completed', 'Pending', 'In Progress'] as const).map((filterOpt) => (
                          <button
                            key={filterOpt}
                            onClick={() => {
                              setStatusFilter(filterOpt);
                              setFilterDropdownOpen(false);
                            }}
                            className="w-full flex items-center justify-between px-3 py-2 hover:bg-neutral-50 dark:hover:bg-zinc-800/50 text-zinc-700 dark:text-zinc-200 text-left"
                          >
                            <span>{filterOpt === 'All' ? (lang === 'zh' ? '展示全部' : 'Show All') : filterOpt}</span>
                            {statusFilter === filterOpt && <Check className="w-3.5 h-3.5 text-[#FE501A]" />}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* DATAGRID / TABLE COMPONENT */}
            <div className="flex-1 overflow-x-auto w-full select-none" style={{ scrollbarWidth: 'thin' }}>
              <table className="w-full min-w-[700px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-neutral-100 dark:border-zinc-850/80 pb-3 text-xs font-extrabold tracking-tight text-zinc-400 dark:text-zinc-500 uppercase">
                    <th className="py-3 px-3 w-8">
                      <button 
                        onClick={() => {
                          const anyChecked = activities.some(a => a.checked);
                          setActivities(prev => prev.map(a => ({ ...a, checked: !anyChecked })));
                        }}
                        className="text-zinc-400 hover:text-zinc-650"
                      >
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      </button>
                    </th>
                    <th className="py-3 px-3">Order ID</th>
                    <th className="py-3 px-3">Activity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-3 text-right">Date</th>
                    <th className="py-3 px-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence initial={false}>
                    {filteredActivities.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-12 text-center text-xs font-bold text-zinc-400">
                          {lang === 'zh' ? '完美！未检索到符合条件的记录。' : 'Perfect! No matched activity log records.'}
                        </td>
                      </tr>
                    ) : (
                      filteredActivities.map((act) => {
                        const IconComponent = act.icon;
                        return (
                          <motion.tr
                            key={act.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className={`border-b border-neutral-100/60 dark:border-zinc-900/60 transition-colors
                              ${act.checked ? 'bg-neutral-50/50 dark:bg-zinc-950/20' : 'hover:bg-neutral-50/20 dark:hover:bg-zinc-950/10'}`}
                          >
                            {/* Checkbox */}
                            <td className="py-3.5 px-3">
                              <button 
                                onClick={() => toggleRowCheck(act.id)}
                                className="text-zinc-400 hover:text-zinc-650 shrink-0"
                              >
                                {act.checked ? (
                                  <div className="w-[17px] h-[17px] rounded bg-zinc-950 dark:bg-neutral-100 flex items-center justify-center text-white dark:text-zinc-950 border border-zinc-950 dark:border-neutral-150">
                                    <Check className="w-3 h-3 stroke-[3px]" />
                                  </div>
                                ) : (
                                  <div className="w-[17px] h-[17px] rounded border border-neutral-300 dark:border-zinc-700 bg-white dark:bg-zinc-900" />
                                )}
                              </button>
                            </td>

                            {/* Order ID */}
                            <td className="py-3.5 px-3 font-mono text-xs font-extrabold text-zinc-500 dark:text-zinc-455">
                              {act.orderId}
                            </td>

                            {/* Activity item with custom icon */}
                            <td className="py-3.5 px-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8.5 h-8.5 rounded-xl flex items-center justify-center shrink-0 ${act.iconBg}`}>
                                  <IconComponent className={`w-4 h-4 ${act.iconColor}`} />
                                </div>
                                <span className="text-[13px] font-black text-zinc-900 dark:text-white-90">
                                  {act.type}
                                </span>
                              </div>
                            </td>

                            {/* Price */}
                            <td className="py-3.5 px-4 font-mono text-[13px] font-black text-zinc-800 dark:text-zinc-200">
                              {act.price}
                            </td>

                            {/* Detailed color state badge exactly mimicking screenshot style */}
                            <td className="py-3.5 px-4">
                              <div className="flex justify-center">
                                <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black whitespace-nowrap text-center
                                  ${act.status === 'Completed'
                                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-[#27DAB7]'
                                    : act.status === 'Pending'
                                      ? 'bg-rose-50 dark:bg-rose-955/20 text-rose-500'
                                      : 'bg-amber-50 dark:bg-amber-950/20 text-yellow-500'}`}
                                >
                                  <span className={`w-1.5 h-1.5 rounded-full 
                                    ${act.status === 'Completed'
                                      ? 'bg-emerald-400'
                                      : act.status === 'Pending'
                                        ? 'bg-rose-400'
                                        : 'bg-yellow-405'}`} 
                                  />
                                  <span>{act.status === 'Completed' ? t.completedBadge : act.status === 'Pending' ? t.pendingBadge : t.inProgressBadge}</span>
                                </div>
                              </div>
                            </td>

                            {/* Date time */}
                            <td className="py-3.5 px-3 text-right text-xs font-semibold text-zinc-450 dark:text-zinc-500">
                              {act.date}
                            </td>

                            {/* Detailed dot dropdown launcher */}
                            <td className="py-3.5 px-3">
                              <button 
                                onClick={() => {
                                  // Prompt or alert interactive deletion or state mutation
                                  const confirmMsg = lang === 'zh' ? '您想删除这条最近的订单/转账记录吗？' : 'Do you want to delete this activity log record?';
                                  if (window.confirm && window.confirm(confirmMsg)) {
                                    setActivities(prev => prev.filter(p => p.id !== act.id));
                                  }
                                }}
                                className="text-zinc-400 hover:text-[#FE501A]"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </td>

                          </motion.tr>
                        );
                      })
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================== MODALS SECTION ======================================================== */}
      
      {/* 1. TRANSFER FUNDS DIALOG MODAL */}
      <AnimatePresence>
        {transferModalOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-neutral-100 dark:border-zinc-800 shadow-xl text-left relative"
            >
              <button 
                onClick={() => setTransferModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FE501A] rotate-90" />
                <span>{lang === 'zh' ? '发起瞬时转账' : 'Perform Instant Transfer'}</span>
              </h3>
              <p className="text-xs text-zinc-400 font-medium mb-6">
                {lang === 'zh' ? '向您的业务合作伙伴或绑定的外部银行账户瞬时拨付资金。' : 'Swiftly send cash balance to any of your verified contacts/accounts.'}
              </p>

              {transferSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                    ✓
                  </div>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {lang === 'zh' ? '转账成功交付！' : 'Funds Dispatched Successfully!'}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    Amount: ${transferAmount}
                  </span>
                </div>
              ) : (
                <form onSubmit={performTransfer} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Recipient ContactName</label>
                    <input
                      type="text"
                      required
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value)}
                      className="w-full text-xs font-semibold px-4 py-3 rounded-xl bg-neutral-50 dark:bg-zinc-950 focus:outline-hidden text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-855"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Amount to Transfer (USD)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-black text-zinc-400">$</span>
                      <input
                        type="number"
                        required
                        step="any"
                        value={transferAmount}
                        onChange={(e) => setTransferAmount(e.target.value)}
                        className="w-full text-xs font-mono font-bold pl-8 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-zinc-950 focus:outline-hidden text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-855"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl text-xs font-black select-none text-white bg-neutral-950 dark:bg-white dark:text-zinc-950 hover:opacity-90 active:scale-97 transition-all"
                  >
                    {lang === 'zh' ? '确认转出并入账' : 'Confirm & Dispatch Amount'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. REQUEST DIALOG PART */}
      <AnimatePresence>
        {requestModalOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-md border border-neutral-100 dark:border-zinc-800 shadow-xl text-left relative"
            >
              <button 
                onClick={() => setRequestModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-lg font-black text-zinc-900 dark:text-white mb-1 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#FE501A] rotate-270" />
                <span>{lang === 'zh' ? '发起账款请求' : 'Issue Payment Request'}</span>
              </h3>
              <p className="text-xs text-zinc-400 font-medium mb-6">
                {lang === 'zh' ? '向其他合伙企业或子商户发起一笔收回应收账款。' : 'Request incoming business settlement or personal transfer directly.'}
              </p>

              {requestSuccess ? (
                <div className="flex flex-col items-center justify-center py-6 text-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center text-2xl font-bold">
                    ✓
                  </div>
                  <span className="text-sm font-black text-zinc-900 dark:text-white">
                    {lang === 'zh' ? '请求发送成功！' : 'Settlement Request Delivered!'}
                  </span>
                  <span className="text-xs text-zinc-400 font-semibold">
                    Amount: ${requestAmount} (Pending state)
                  </span>
                </div>
              ) : (
                <form onSubmit={performRequest} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Request Settlement Amount (USD)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 text-xs font-black text-zinc-400">$</span>
                      <input
                        type="number"
                        required
                        step="any"
                        value={requestAmount}
                        onChange={(e) => setRequestAmount(e.target.value)}
                        className="w-full text-xs font-mono font-bold pl-8 pr-4 py-3 rounded-xl bg-neutral-50 dark:bg-zinc-950 focus:outline-hidden text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-855"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 mt-2 rounded-xl text-xs font-black select-none text-white bg-[#FE501A] hover:bg-orange-600 hover:opacity-95 active:scale-97 transition-all"
                  >
                    {lang === 'zh' ? '确认并发送请求' : 'Submit Settlement Request'}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. ADD NEW CARD DIALOG */}
      <AnimatePresence>
        {addCardModalOpen && (
          <div className="fixed inset-0 bg-neutral-900/60 dark:bg-neutral-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-zinc-900 rounded-3xl p-6 w-full max-w-sm border border-neutral-100 dark:border-zinc-800 shadow-xl text-left relative"
            >
              <button 
                onClick={() => setAddCardModalOpen(false)}
                className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-650"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-black text-zinc-900 dark:text-white mb-2">
                {t.addNew}
              </h3>
              
              <form onSubmit={performAddCard} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Card Provider Type</label>
                  <select 
                    value={newCardType}
                    onChange={(e) => setNewCardType(e.target.value)}
                    className="w-full text-xs font-bold px-3.5 py-3 rounded-xl bg-neutral-50 dark:bg-zinc-950 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-855 focus:outline-hidden"
                  >
                    <option value="VISA">VISA Express</option>
                    <option value="MASTERCARD">MasterCard Safe</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-black tracking-wider uppercase text-zinc-400">Last 4 Digits of Card Number</label>
                  <input
                    type="text"
                    required
                    maxLength={4}
                    pattern="[0-9]{4}"
                    placeholder="e.g. 5432"
                    value={newCardNumber}
                    onChange={(e) => setNewCardNumber(e.target.value)}
                    className="w-full text-xs font-mono font-bold px-4 py-3 rounded-xl bg-neutral-50 dark:bg-zinc-950 focus:outline-hidden text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-zinc-855"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-xl text-xs font-black select-none text-white bg-[#FE501A] hover:bg-orange-600 active:scale-97 transition-all"
                >
                  {lang === 'zh' ? '添加卡片并激活' : 'Add Card & Activate'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
