import { useState, useRef, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { dialogApi } from '@/lib/electron-api';
import { useTheme } from '@/hooks/use-theme';
import { useView } from '@/context/ViewContext';
import { cn } from '@/lib/utils';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Building2,
  MapPin,
  Tag,
  Briefcase,
  Quote,
  Calendar,
  Phone,
  Users,
  Trash2,
} from 'lucide-react';

interface EnterpriseFact {
  id: string;
  field: string;
  label: string;
  value: string;
  source?: string;
}

const formFields = [
  { key: 'companyName', label: '公司名称', icon: Building2, placeholder: '如：阿里巴巴（中国）有限公司' },
  { key: 'address', label: '公司地址', icon: MapPin, placeholder: '如：杭州市余杭区文一西路969号' },
  { key: 'industry', label: '所属行业', icon: Briefcase, placeholder: '如：电子商务、云计算、人工智能' },
  { key: 'keywords', label: '关键词', icon: Tag, placeholder: '如：B2B、跨境电商、数字贸易' },
  { key: 'mainBusiness', label: '主营业务', icon: Briefcase, placeholder: '如：电商平台、云服务、金融科技' },
  { key: 'slogan', label: '品牌口号', icon: Quote, placeholder: '如：让天下没有难做的生意' },
  { key: 'foundedAt', label: '成立时间', icon: Calendar, placeholder: '如：1999年' },
  { key: 'contact', label: '联系方式', icon: Phone, placeholder: '如：400-800-8888' },
  { key: 'targetAudience', label: '目标受众', icon: Users, placeholder: '如：中小企业、品牌商家' },
];

const mockFacts: EnterpriseFact[] = [
  { id: '1', field: 'companyName', label: '公司名称', value: '阿里巴巴集团控股有限公司', source: '公司介绍.pdf' },
  { id: '2', field: 'address', label: '公司地址', value: '中国浙江省杭州市余杭区文一西路969号', source: '公司介绍.pdf' },
  { id: '3', field: 'industry', label: '所属行业', value: '电子商务、云计算、数字媒体及娱乐', source: '公司介绍.pdf' },
  { id: '4', field: 'keywords', label: '关键词', value: 'B2B、跨境电商、云计算、数字支付', source: '公司介绍.pdf' },
  { id: '5', field: 'mainBusiness', label: '主营业务', value: '淘宝、天猫、阿里云、菜鸟网络、蚂蚁集团', source: '公司介绍.pdf' },
  { id: '6', field: 'slogan', label: '品牌口号', value: '让天下没有难做的生意', source: '公司介绍.pdf' },
  { id: '7', field: 'foundedAt', label: '成立时间', value: '1999年', source: '公司介绍.pdf' },
];

export default function KbCreateView() {
  const { cls, t } = useTheme();
  const { navigateTo } = useView();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [files, setFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);
  const [facts, setFacts] = useState<EnterpriseFact[]>([]);
  const [newFactField, setNewFactField] = useState('');
  const [newFactValue, setNewFactValue] = useState('');

  const handleFileSelect = async () => {
    const paths = await dialogApi.openFile({
      multiple: true,
      filters: [
        { name: 'Documents', extensions: ['pdf', 'docx', 'doc', 'txt', 'md', 'markdown'] },
        { name: 'All files', extensions: ['*'] },
      ],
    });
    if (!paths) return;
    const newFiles = paths.map((path) => new File([''], path.split(/[\\/]/).pop() ?? path, { type: 'application/octet-stream' }));
    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleInputChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleParse = async () => {
    setStep(2);
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    setFacts(mockFacts);
    setStep(3);
  };

  const handleFactChange = (id: string, value: string) => {
    setFacts((prev) => prev.map((f) => (f.id === id ? { ...f, value } : f)));
  };

  const handleAddFact = () => {
    if (!newFactField.trim() || !newFactValue.trim()) return;
    setFacts((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        field: newFactField,
        label: newFactField,
        value: newFactValue,
        source: '用户补充',
      },
    ]);
    setNewFactField('');
    setNewFactValue('');
  };

  const handleDeleteFact = (id: string) => {
    setFacts((prev) => prev.filter((f) => f.id !== id));
  };

  const handleConfirm = () => {
    setStep(4);
    setTimeout(() => {
      navigateTo('projectList');
    }, 1500);
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <Card className={cn('p-6', cls('bg-white', 'bg-[#1c1c1f]'))}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[#F37021]" />
          上传企业资料
        </h3>
        <div
          onClick={handleFileSelect}
          className={cn(
            'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors',
            cls(
              'border-gray-200 hover:border-[#F37021] bg-gray-50/50',
              'border-zinc-700 hover:border-[#F37021] bg-zinc-800/30'
            ),
          )}
        >
          <Upload className={cn('w-10 h-10 mx-auto mb-3', cls('text-gray-400', 'text-zinc-500'))} />
          <p className="text-sm font-medium">点击或拖拽上传附件</p>
          <p className={cn('text-xs mt-1', cls('text-gray-500', 'text-zinc-400'))}>
            支持 PDF、Word、TXT、Markdown，可多选
          </p>
        </div>

        {files.length > 0 && (
          <div className="mt-4 space-y-2">
            {files.map((file, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border',
                  cls('bg-gray-50 border-gray-100', 'bg-zinc-800/50 border-zinc-700/50'),
                )}
              >
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#F37021]" />
                  <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                </div>
                <button
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className={cn('p-6', cls('bg-white', 'bg-[#1c1c1f]'))}>
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-[#F37021]" />
          企业基础信息
          <span className={cn('text-xs font-normal', cls('text-gray-500', 'text-zinc-400'))}>（所有字段可选）</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formFields.map(({ key, label, icon: Icon, placeholder }) => (
            <div key={key}>
              <label className="text-sm font-medium mb-1.5 flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5" />
                {label}
              </label>
              <Input
                value={formData[key] ?? ''}
                onChange={(e) => handleInputChange(key, e.target.value)}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleParse}
          disabled={files.length === 0 && Object.values(formData).every((v) => !v)}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          开始 AI 解析
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <Card className={cn('p-12 text-center', cls('bg-white', 'bg-[#1c1c1f]'))}>
      <div className="w-16 h-16 rounded-full bg-[#F37021]/10 flex items-center justify-center mx-auto mb-6">
        <Loader2 className="w-8 h-8 text-[#F37021] animate-spin" />
      </div>
      <h3 className="text-xl font-bold mb-2">AI 正在解析企业资料</h3>
      <p className={cn('text-sm mb-6', cls('text-gray-500', 'text-zinc-400'))}>
        正在执行：文档解析 → 结构化事实抽取 → 切片 → 向量化
      </p>
      <div className="max-w-md mx-auto">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm font-medium">{progress}%</p>
      </div>
    </Card>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Card className={cn('p-6', cls('bg-white', 'bg-[#1c1c1f]'))}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#F37021]" />
            结构化事实抽取结果
          </h3>
          <Badge variant="secondary">共 {facts.length} 条</Badge>
        </div>
        <p className={cn('text-sm mb-4', cls('text-gray-500', 'text-zinc-400'))}>
          请核对以下抽取结果，可直接修改、补充或删除。
        </p>

        <div className="space-y-3">
          {facts.map((fact) => (
            <div
              key={fact.id}
              className={cn(
                'p-4 rounded-lg border',
                cls('bg-gray-50 border-gray-100', 'bg-zinc-800/50 border-zinc-700/50'),
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">{fact.label}</label>
                <div className="flex items-center gap-2">
                  {fact.source && (
                    <span className={cn('text-xs', cls('text-gray-500', 'text-zinc-400'))}>
                      来源：{fact.source}
                    </span>
                  )}
                  <button
                    onClick={() => handleDeleteFact(fact.id)}
                    className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-500" />
                  </button>
                </div>
              </div>
              <Textarea
                value={fact.value}
                onChange={(e) => handleFactChange(fact.id, e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          ))}

          <div
            className={cn(
              'p-4 rounded-lg border border-dashed',
              cls('bg-gray-50/50 border-gray-200', 'bg-zinc-800/30 border-zinc-700'),
            )}
          >
            <p className="text-sm font-medium mb-2">补充事实</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              <Input
                value={newFactField}
                onChange={(e) => setNewFactField(e.target.value)}
                placeholder="字段名，如：核心产品"
              />
              <Input
                value={newFactValue}
                onChange={(e) => setNewFactValue(e.target.value)}
                placeholder="字段值"
                className="md:col-span-2"
              />
            </div>
            <Button onClick={handleAddFact} variant="outline" size="sm" className="mt-2">
              添加
            </Button>
          </div>
        </div>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          返回修改
        </Button>
        <Button onClick={handleConfirm} className="gap-2">
          <CheckCircle2 className="w-4 h-4" />
          确认并建立知识库
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <Card className={cn('p-12 text-center', cls('bg-white', 'bg-[#1c1c1f]'))}>
      <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-6">
        <CheckCircle2 className="w-8 h-8 text-emerald-500" />
      </div>
      <h3 className="text-xl font-bold mb-2">企业知识库已建立</h3>
      <p className={cn('text-sm', cls('text-gray-500', 'text-zinc-400'))}>
        共确认 {facts.length} 条结构化事实，资料已切片并完成向量化。
      </p>
      <p className={cn('text-xs mt-4', cls('text-gray-400', 'text-zinc-500'))}>
        即将跳转到知识库列表...
      </p>
    </Card>
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">创建企业知识库</h1>
        <p className={cn('text-sm mt-1', cls('text-gray-500', 'text-zinc-400'))}>
          上传企业资料，AI 将自动解析并抽取结构化事实。
        </p>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: '上传资料' },
          { num: 2, label: 'AI 解析' },
          { num: 3, label: '核对事实' },
          { num: 4, label: '完成建立' },
        ].map((s) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors',
                step >= s.num
                  ? 'bg-[#F37021]/10 text-[#F37021]'
                  : cls('bg-gray-100 text-gray-500', 'bg-zinc-800 text-zinc-500'),
              )}
            >
              <span className="w-5 h-5 rounded-full bg-current/20 flex items-center justify-center text-xs">
                {s.num}
              </span>
              {s.label}
            </div>
            {s.num < 4 && <ArrowRight className="w-4 h-4 text-gray-300 dark:text-zinc-700" />}
          </div>
        ))}
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}
