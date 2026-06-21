export const mockDashboardData = {
  stats: [
    { label: '项目数', value: '12', change: '8%', trend: 'up' as const },
    { label: '知识库', value: '34', change: '12%', trend: 'up' as const },
    { label: '生成稿件', value: '156', change: '5%', trend: 'up' as const },
    { label: '已发布', value: '89', change: '2%', trend: 'down' as const },
    { label: '可见性命中', value: '62%', change: '4%', trend: 'up' as const },
    { label: '待处理', value: '7', change: '1', trend: 'down' as const },
  ],
  trend: [
    { date: '06-03', value: 20 },
    { date: '06-05', value: 25 },
    { date: '06-07', value: 30 },
    { date: '06-09', value: 28 },
    { date: '06-11', value: 35 },
    { date: '06-13', value: 42 },
    { date: '06-15', value: 40 },
    { date: '06-17', value: 48 },
  ],
  actions: [
    { id: 'a1', title: '2 篇稿件待校对', description: '等待人工确认', priority: 'high' as const, done: false },
    { id: 'a2', title: '4 条规则待确认', description: '涉及标题、证据链、关键词密度', priority: 'high' as const, done: false },
    { id: 'a3', title: '补充知识库字段', description: '缺少改装案例、售后咨询通道', priority: 'medium' as const, done: false },
  ],
  activities: [
    { id: 'r1', title: 'GEO 运行完成', time: '10 分钟前', type: 'run' },
    { id: 'r2', title: '文章已发布到搜狐', time: '2 小时前', type: 'publish' },
  ],
  kbHealth: { health: 86, indexed: 141, pending: 1 },
  kbAssets: [
    { name: '企业基础信息集.pdf', status: 'indexed' as const, words: 1200 },
    { name: '改装方案库.docx', status: 'indexed' as const, words: 2100 },
    { name: '授权证书.pdf', status: 'pending' as const, words: 0 },
  ],
};
