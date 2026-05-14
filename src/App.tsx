/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Waves, 
  BluetoothConnected, 
  LayoutDashboard, 
  Wind, 
  TrendingUp, 
  User, 
  ChevronRight, 
  ChevronUp,
  ChevronDown,
  PlayCircle,
  Activity,
  UserRound,
  ShieldCheck,
  Droplets,
  Thermometer,
  Headphones,
  Bell,
  ShieldAlert,
  ExternalLink,
  Edit3,
  Unlink,
  Square,
  CheckCircle2,
  ListChecks,
  ShoppingBag,
  Sun,
  Moon,
  Trophy,
  Zap,
  Loader2,
  LogOut,
  HelpCircle,
  Settings,
  Bluetooth
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  ResponsiveContainer, 
  Cell,
  Tooltip
} from 'recharts';

// --- Types ---
type ViewState = 'home' | 'therapy' | 'journey' | 'profile';

// --- Static Data ---
const CHART_DATA = [
  { day: '周一', score: 80, duration: 7.2, ahi: 1.5, leak: 2.5 },
  { day: '周二', score: 70, duration: 6.5, ahi: 2.1, leak: 3.2 },
  { day: '周三', score: 85, duration: 7.8, ahi: 1.1, leak: 2.0 },
  { day: '周四', score: 75, duration: 7.0, ahi: 1.8, leak: 2.8 },
  { day: '周五', score: 60, duration: 5.5, ahi: 3.2, leak: 4.5 },
  { day: '周六', score: 82, duration: 7.5, ahi: 1.4, leak: 2.2 },
  { day: '周日', score: 95, duration: 8.2, ahi: 0.8, leak: 1.8, current: true },
];

const TREND_METRICS = [
  { id: 'score', label: '评分', unit: '分' },
  { id: 'duration', label: '时长', unit: '时' },
  { id: 'ahi', label: 'AHI', unit: '事件' },
  { id: 'leak', label: '漏气', unit: 'L/min' },
] as const;

const JOURNEY_CALENDAR = Array.from({ length: 42 }, (_, i) => {
  const dayIndex = i - 5; 
  const value = dayIndex >= 1 && dayIndex <= 30 ? dayIndex : (dayIndex < 1 ? dayIndex + 31 : dayIndex - 30);
  const isSept = dayIndex >= 1 && dayIndex <= 30;
  
  // Deterministic metrics based on dayIndex
  const duration = isSept ? (8.2 + (Math.sin(dayIndex * 0.5) * 1.6)).toFixed(1) : "0";
  const ahi = isSept ? Math.abs(0.4 + Math.cos(dayIndex) * 0.5).toFixed(1) : "0";
  const leak = isSept ? Math.abs(1.0 + Math.sin(dayIndex * 2) * 1.5).toFixed(1) : "0";
  
  // Status based on duration
  const dNum = parseFloat(duration);
  const status = !isSept ? 'none' : (dNum >= 7 ? 'full' : (dNum >= 4 ? 'partial' : 'none'));

  return {
    id: i,
    value,
    isSept,
    status,
    metrics: {
      duration: `${duration}h`,
      ahi: ahi,
      leak: `${leak}`
    }
  };
});

// --- Components ---

const BottomNav = ({ active, onChange }: { active: ViewState, onChange: (v: ViewState) => void }) => {
  const tabs = [
    { id: 'home', label: '首页', Icon: LayoutDashboard },
    { id: 'therapy', label: '设备', Icon: Wind },
    { id: 'journey', label: '数据', Icon: TrendingUp },
    { id: 'profile', label: '我的', Icon: UserRound },
  ] as const;

  return (
    <nav className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-40px)] max-w-[350px] z-50 flex justify-around items-center px-4 py-3 bg-white/80 backdrop-blur-3xl rounded-[32px] border border-white shadow-[0_25px_50px_-12px_rgba(0,0,0,0.15),inset_0_1px_1px_rgba(255,255,255,1)]">
      {tabs.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button 
            key={id}
            onClick={() => onChange(id)}
            className={`flex flex-col items-center justify-center px-4 py-1.5 transition-all duration-300 ease-out active:scale-90 relative ${
              isActive 
                ? 'text-primary' 
                : 'text-on-surface-variant opacity-40 hover:opacity-100 hover:text-primary transition-opacity'
            }`}
          >
            {isActive && (
              <motion.div 
                layoutId="nav-bg"
                className="absolute inset-0 bg-primary/5 rounded-2xl -z-10 shadow-[0_0_20px_rgba(0,163,255,0.1)]"
              />
            )}
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'drop-shadow-[0_0_8px_rgba(0,163,255,0.3)]' : ''} />
            <span className={`font-sans text-[9px] font-black tracking-widest uppercase mt-1 ${isActive ? 'opacity-100' : 'opacity-40'}`}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

const Header = ({ title }: { title: string }) => (
  <header className="absolute top-0 w-full z-40 bg-white/40 backdrop-blur-xl px-7 py-5 pt-12 flex justify-between items-center left-1/2 -translate-x-1/2 border-b border-black/[0.03]">
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,163,255,0.1)]">
        <Waves className="text-primary" size={20} />
      </div>
      <h1 className="font-sans font-black text-xl text-on-surface tracking-tight">{title}</h1>
    </div>
    <div className="flex items-center gap-3 px-3 py-1.5 rounded-full bg-black/5 border border-black/5">
      <span className="text-[9px] font-black uppercase tracking-widest text-primary/60">已连接</span>
      <BluetoothConnected size={16} className="text-primary animate-pulse" />
    </div>
  </header>
);

const MetricCard = ({ title, value, subValue, Icon, status, progress, className = "" }: { title: string, value: string, subValue?: string, Icon: any, status?: string, progress?: number, className?: string }) => (
  <div className={`liquid-glass p-5 rounded-[32px] flex flex-col justify-between aspect-square w-full ${className}`}>
    <div>
      <div className="flex items-start justify-between mb-2">
        <div className="p-2.5 bg-primary/10 rounded-2xl w-fit shadow-[0_0_15px_rgba(0,163,255,0.1)]">
          <Icon size={20} className="text-primary" />
        </div>
        {status ? (
          <span className="text-[10px] font-black px-2.5 py-1 bg-primary/10 text-primary border border-primary/20 rounded-xl uppercase tracking-widest">
            {status}
          </span>
        ) : (
          <div className="h-6" />
        )}
      </div>
      <p className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-[0.15em] leading-none mb-1">{title}</p>
    </div>
    
    <div>
      <div className="flex flex-col">
        <p className="text-xl font-black text-on-surface leading-tight tracking-tight">{value}</p>
        <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wide mt-1 min-h-[14px]">
          {subValue || ""}
        </p>
      </div>
      <div className="mt-3 h-1.5 relative">
        {progress !== undefined && (
          <div className="w-full h-full bg-black/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-secondary to-primary shadow-[0_0_10px_rgba(0,163,255,0.4)]" 
            />
          </div>
        )}
      </div>
    </div>
  </div>
);

const INSIGHTS = [
  {
    id: 1,
    title: '湿度调节',
    content: '恒定的湿度水平改善了您昨晚的面罩密封效果。',
    icon: Droplets,
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
    image: '/G5.jpg'
  },
  {
    id: 2,
    title: '治疗效果',
    content: '您昨晚的AHI值控制在1.0以下，这是极佳且稳定的表现。',
    icon: Zap,
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
    image: '/G3.jpg'
  },
  {
    id: 3,
    title: '佩戴小贴士',
    content: '尝试稍微调松头带，可能会提高佩戴舒适度而不产生漏气。',
    icon: ShieldCheck,
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
    image: '/G4.jpg'
  }
];

const HomeView = () => {
  const [activeMetric, setActiveMetric] = useState<typeof TREND_METRICS[number]['id']>('score');
  const [activeInsight, setActiveInsight] = useState(0);
  const [scoreDisplay, setScoreDisplay] = useState(0);

  useEffect(() => {
    // Simple count-up animation for the score
    const duration = 1500;
    const target = 85;
    const start = 0;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Power 3 ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.floor(start + (target - start) * easeProgress);
      
      setScoreDisplay(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, []);

  return (
    <div className="space-y-6 pb-40">
      {/* Score Section */}
      <section className="relative overflow-hidden rounded-[40px] bg-white p-9 border border-black/[0.03] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.05)]">
        <div className="flex flex-col items-center text-center relative z-10">
          <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em] mb-10">昨夜睡眠评分</p>
          
          <div className="relative w-80 h-80 flex items-center justify-center mb-6">
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              src="/GT2.png"
              className="w-full h-full object-contain pointer-events-none mix-blend-multiply"
              style={{ filter: 'brightness(1.02) contrast(1.02)' }}
              alt="睡眠评分"
            />
          </div>
          
          <h2 className="text-2xl font-black text-on-surface mb-1 tracking-tight">恢复性睡眠</h2>
          <p className="text-sm text-on-surface-variant/70 px-8 font-medium">面罩佩戴完美，治疗效果极佳。</p>
        </div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
      </section>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        <MetricCard title="使用时长" value="7小时 24分" progress={85} Icon={Activity} className="aspect-square" />
        <MetricCard title="面罩密封性" value="完美" subValue="L/min: 2.1" Icon={ShieldCheck} className="aspect-square" />
        <MetricCard title="AHI" value="1.2" subValue="事件/小时" Icon={Wind} className="aspect-square" />
        <MetricCard title="面罩事件" value="1次" subValue="佩戴/摘取" Icon={Square} className="aspect-square" />
      </div>

      {/* Insights */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold">睡眠见解</h3>
          <div className="flex gap-1.5">
            {INSIGHTS.map((_, i) => (
              <button 
                key={i}
                onClick={() => setActiveInsight(i)}
                className={`w-1.5 h-1.5 rounded-full transition-all ${activeInsight === i ? 'bg-primary w-4' : 'bg-primary/20'}`}
              />
            ))}
          </div>
        </div>

        <motion.div 
          key={activeInsight}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="relative rounded-[32px] overflow-hidden min-h-[160px] flex items-center shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-black/5 liquid-glass"
        >
          {/* Background Image with Overlay */}
          <div className="absolute inset-0">
            <img 
              src={INSIGHTS[activeInsight].image} 
              className="w-full h-full object-cover opacity-60" 
              alt="Insight background"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 to-transparent" />
          </div>
          
          <div className="relative z-10 p-7 max-w-[85%] flex flex-col items-start gap-3">
            {(() => {
              const InsightIcon = INSIGHTS[activeInsight].icon;
              return (
                <div className={`flex items-center gap-2 px-3 py-1 bg-black/5 backdrop-blur-sm rounded-full border border-black/10`}>
                  <InsightIcon size={14} className={INSIGHTS[activeInsight].color} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface/50">
                    {INSIGHTS[activeInsight].title}
                  </span>
                </div>
              );
            })()}
            <p className="text-[15px] text-on-surface font-bold leading-relaxed tracking-tight">
              {INSIGHTS[activeInsight].content}
            </p>
          </div>

          <button 
            onClick={() => setActiveInsight((prev) => (prev + 1) % INSIGHTS.length)}
            className="absolute right-6 w-10 h-10 rounded-full bg-black/5 backdrop-blur-md border border-black/5 flex items-center justify-center text-primary active:scale-90 transition-all z-20"
          >
            <ChevronRight size={20} />
          </button>
        </motion.div>
      </section>

      {/* Trends */}
      <section className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-7">
          <h3 className="text-lg font-black text-on-surface tracking-tight">7日趋势分析</h3>
          <button className="text-primary text-[11px] font-black flex items-center gap-1.5 uppercase tracking-[0.2em] opacity-80 hover:opacity-100">
            深度详情 <ChevronRight size={14} />
          </button>
        </div>
        
        <div className="flex bg-black/5 p-1.5 rounded-[20px] mb-9 border border-black/[0.03]">
          {TREND_METRICS.map((metric) => (
            <button 
              key={metric.id}
              onClick={() => setActiveMetric(metric.id)}
              className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                activeMetric === metric.id ? 'bg-primary text-white shadow-[0_4px_15px_rgba(0,163,255,0.2)]' : 'text-on-surface/20 hover:text-on-surface/60'
              }`}
            >
              {metric.label}
            </button>
          ))}
        </div>

        <div className="h-44 w-full px-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={CHART_DATA}>
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 900, fill: 'rgba(0,0,0,0.2)', letterSpacing: '0.1em' }}
              />
              <Bar dataKey={activeMetric} radius={[6, 6, 0, 0]} barSize={18}>
                {CHART_DATA.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.current ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)'} 
                  />
                ))}
              </Bar>
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }} 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const metric = TREND_METRICS.find(m => m.id === activeMetric);
                    return (
                      <div className="bg-white/80 backdrop-blur-xl px-5 py-4 rounded-3xl shadow-2xl border border-black/5 ring-1 ring-black/5">
                        <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1.5">
                          {payload[0].payload.day}
                        </p>
                        <p className="text-lg font-black text-on-surface tracking-tight">
                          {payload[0].value} <span className="text-[10px] text-primary/60 font-black uppercase tracking-widest ml-1">{metric?.unit}</span>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Metric Summary */}
        <div className="mt-8 flex justify-between items-center px-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">
              7日平均值 ({TREND_METRICS.find(m => m.id === activeMetric)?.label})
            </span>
            <span className="text-2xl font-black text-on-surface tracking-tight">
              {(CHART_DATA.reduce((acc, curr) => acc + (curr[activeMetric] as number), 0) / CHART_DATA.length).toFixed(1)}
              <span className="text-xs ml-2 text-primary font-black uppercase tracking-widest opacity-60">
                {TREND_METRICS.find(m => m.id === activeMetric)?.unit}
              </span>
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] mb-1">活跃趋势</span>
            <div className="flex items-center gap-1.5 text-primary font-black text-sm tracking-tight drop-shadow-[0_4px_10px_rgba(45,124,255,0.15)]">
              <TrendingUp size={18} />
              <span>+12.5%</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const TherapyView = () => {
  const [humidity, setHumidity] = useState(4);
  const [temp, setTemp] = useState(27);
  const [epr, setEpr] = useState(2);
  const [isTherapyActive, setIsTherapyActive] = useState(false);
  const [livePressure, setLivePressure] = useState(12.4);
  const [seconds, setSeconds] = useState(0);
  const [isTestingMaskFit, setIsTestingMaskFit] = useState(false);
  const [maskFitResult, setMaskFitResult] = useState<'none' | 'perfect' | 'poor'>('none');
  const [testProgress, setTestProgress] = useState(0);

  useEffect(() => {
    let timer: any;
    if (isTestingMaskFit) {
      setTestProgress(0);
      setMaskFitResult('none');
      
      const startTime = Date.now();
      const duration = 5000; // 5 second test

      timer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / duration) * 100, 100);
        setTestProgress(progress);

        if (progress >= 100) {
          clearInterval(timer);
          setIsTestingMaskFit(false);
          setMaskFitResult('perfect');
        }
      }, 50);
    }
    return () => clearInterval(timer);
  }, [isTestingMaskFit]);

  useEffect(() => {
    let interval: any;
    if (isTherapyActive) {
      interval = setInterval(() => {
        setSeconds(s => s + 1);
        // Subtle pressure fluctuation
        setLivePressure(p => {
          const change = (Math.random() - 0.5) * 0.4;
          return Math.min(Math.max(p + change, 11.8), 13.0);
        });
      }, 1000);
    } else {
      setSeconds(0);
      setLivePressure(12.4);
    }
    return () => clearInterval(interval);
  }, [isTherapyActive]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 pb-44">
      {/* Device Hero */}
      <section className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 border border-black/[0.03] flex flex-col items-center text-center relative overflow-hidden transition-all duration-700 shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)]">
        <AnimatePresence>
          {isTherapyActive && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 pointer-events-none"
            >
              {/* Central Breathing Glow */}
              <motion.div 
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.05, 0.15, 0.05]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-primary rounded-full blur-[120px] h-64 w-64 mx-auto"
              />
              
              {/* Inner Border Breathing */}
              <motion.div 
                animate={{ 
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-0 border-[3px] border-primary/10 rounded-[40px]"
              />

              {/* Subtle Particles/Dust rhythm */}
              <div className="absolute inset-0 overflow-hidden opacity-30">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-32 bg-gradient-to-b from-transparent via-primary-container/20 to-transparent"
                    style={{ left: `${15 + i * 15}%`, top: '-20%' }}
                    animate={{ 
                      y: ['0%', '200%'],
                      opacity: [0, 1, 0]
                    }}
                    transition={{ 
                      duration: 3 + i, 
                      repeat: Infinity, 
                      delay: i * 0.5,
                      ease: "linear" 
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="px-4 py-1.5 bg-primary/5 rounded-full border border-primary/10 mb-4 inline-flex items-center gap-2 relative z-10">
          <div className={`w-2 h-2 rounded-full ${isTherapyActive ? 'bg-amber-500 animate-pulse' : 'bg-primary-container animate-pulse'}`} />
          <span className="text-[10px] font-black text-primary uppercase tracking-widest">
            {isTherapyActive ? '正在治疗 : 气流输送中' : '运行状态 : AutoCPAP'}
          </span>
        </div>
        
        <h2 className="text-4xl font-extrabold text-on-surface mb-1 relative z-10">BreathSync</h2>
        <p className="text-sm font-bold text-on-surface-variant/60 relative z-10 uppercase tracking-widest">
          {isTherapyActive ? `已运行 ${formatTime(seconds)}` : '设备运行良好 • 滤棉已就绪'}
        </p>
        
      <div className="mt-6 relative w-full flex justify-center">
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 bg-primary/5 rounded-full blur-[100px] h-64 w-64 mx-auto pointer-events-none" />
        <motion.img 
          initial={{ opacity: 0, y: 20 }}
          animate={isTherapyActive ? { 
            opacity: 1, y: 0,
            scale: [1, 1.05, 1],
            filter: ["brightness(1)", "brightness(1.1)", "brightness(1)"]
          } : { opacity: 1, y: 0 }}
          transition={{ 
            opacity: { duration: 0.8 },
            y: { duration: 0.8 },
            scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            filter: { duration: 4, repeat: Infinity, ease: "easeInOut" }
          }}
          src="/Group 1.png" 
          className="w-[300px] drop-shadow-[0_25px_50px_rgba(0,0,0,0.15)] relative z-10"
          alt="BreathSync"
        />
      </div>

      {/* Therapy Action Button moved here */}
      <div className="mt-6 mb-4 w-full px-4 relative z-20">
        <button 
          onClick={() => setIsTherapyActive(!isTherapyActive)}
          className={`w-full h-18 rounded-[32px] font-black flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all text-lg uppercase tracking-widest ${
            isTherapyActive 
              ? 'bg-amber-500 text-white shadow-[0_12px_40px_rgba(245,158,11,0.3)]' 
              : 'bg-primary text-white shadow-[0_12px_40px_rgba(45,124,255,0.3)]'
          }`}
        >
          {isTherapyActive ? (
            <>
              <motion.div animate={{ rotate: 180 }} transition={{ duration: 0.5 }}>
                <Square size={24} className="fill-current" />
              </motion.div>
              <span>结束治疗</span>
            </>
          ) : (
            <>
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }}>
                <PlayCircle size={28} className="fill-current" />
              </motion.div>
              <span>开始治疗</span>
            </>
          )}
        </button>
      </div>
      </section>

      {/* Parameter Panels */}
      <div className="space-y-4">
        {/* TOP: Prescription Pressure */}
        <div className="liquid-glass p-7 rounded-[40px] flex items-center gap-6 min-h-[140px] relative overflow-hidden border border-black/[0.03] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)]">
          <div className={`w-14 h-14 rounded-3xl shrink-0 transition-colors flex items-center justify-center ${isTherapyActive ? 'bg-amber-500/10' : 'bg-primary/10'} shadow-[0_4px_15px_rgba(0,163,255,0.05)]`}>
            <Activity size={32} className={isTherapyActive ? 'text-amber-500' : 'text-primary'} />
          </div>

          <div className="flex-1 min-w-0 pr-4">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] italic whitespace-nowrap">运行数值 CMH2O</p>
          </div>
          
          <div className="text-right shrink-0">
            <div className="flex items-baseline justify-end gap-1.5">
              <p className="text-4xl font-black text-on-surface tracking-tighter tabular-nums leading-none">
                {isTherapyActive ? livePressure.toFixed(1) : '0.0'}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM: Mask Fit */}
        <div className="liquid-glass p-6 rounded-[40px] flex items-center gap-5 min-h-[120px] relative overflow-hidden border border-black/[0.03] shadow-[0_15px_35px_-10px_rgba(0,0,0,0.05)]">
          <div className="relative shrink-0">
            <div className={`p-4 rounded-[24px] transition-colors ${isTestingMaskFit ? 'bg-amber-500/10' : 'bg-primary/10'}`}>
              <UserRound size={28} className={isTestingMaskFit ? 'text-amber-500' : 'text-primary'} />
            </div>
            {maskFitResult === 'perfect' && !isTestingMaskFit && !isTherapyActive && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-1 -right-1 bg-secondary text-white w-6 h-6 rounded-full border-2 border-white flex items-center justify-center shadow-lg"
              >
                <ShieldCheck size={14} strokeWidth={4} />
              </motion.div>
            )}
          </div>

          <div className="flex-1 min-w-0 pr-2">
            <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1 italic whitespace-nowrap">
              {isTherapyActive ? '实时漏气速率' : '面罩佩戴测试'}
            </p>
            <p className={`text-base font-black whitespace-nowrap ${isTherapyActive || maskFitResult === 'perfect' ? 'text-secondary' : 'text-on-surface/30'}`}>
              {isTherapyActive ? '2.4' : maskFitResult === 'perfect' ? '检测通过' : '未就绪'}
              {isTherapyActive && <span className="text-[10px] ml-1 opacity-40 font-black tracking-wide">L/min</span>}
            </p>
          </div>

          <div className="shrink-0 min-w-[100px] flex justify-end">
            {isTestingMaskFit ? (
              <div className="w-24 text-right">
                <p className="text-[9px] font-black text-amber-500 animate-pulse mb-1.5 uppercase tracking-widest">检测中 {Math.floor(testProgress)}%</p>
                <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.3)]" 
                    initial={{ width: 0 }}
                    animate={{ width: `${testProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsTestingMaskFit(true)}
                disabled={isTherapyActive}
                className={`px-5 h-11 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-0 disabled:pointer-events-none ${
                   maskFitResult === 'perfect' 
                    ? 'bg-secondary/10 text-secondary border border-secondary/20' 
                    : 'bg-primary text-white shadow-[0_4px_15px_rgba(45,124,255,0.2)]'
                }`}
              >
                {maskFitResult === 'perfect' ? '重新检测' : '开始测试'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Therapy Parameters (Read-only Panel) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-on-surface">治疗方案</h3>
          <span className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">医生处方参数</span>
        </div>
        
        <div className="space-y-4">
          <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-on-surface/30 border border-black/5 shadow-sm">
                  <Activity size={24} />
                </div>
                <span className="text-base font-black text-on-surface opacity-80 tracking-tight">处方压力</span>
              </div>
              <span className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest whitespace-nowrap">
                4.0 - 15.0 CMH2O
              </span>
            </div>
          </div>
          
          <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-on-surface/30 border border-black/5 shadow-sm">
                  <ShieldCheck size={24} />
                </div>
                <span className="text-base font-black text-on-surface opacity-80 tracking-tight">治疗模式</span>
              </div>
              <span className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">AutoSet CPAP</span>
            </div>
          </div>

          <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-on-surface/30 border border-black/5 shadow-sm">
                  <Zap size={24} />
                </div>
                <span className="text-base font-black text-on-surface opacity-80 tracking-tight">起始压力</span>
              </div>
              <span className="text-xs font-black text-on-surface-variant/60 uppercase tracking-widest">4.0 CMH2O</span>
            </div>
          </div>
        </div>
      </section>

      {/* Comfort Settings */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-on-surface">舒适度设置</h3>
          <button className="text-primary text-xs font-bold">自动调整</button>
        </div>

        <div className="space-y-4">
        {/* Humidity */}
        <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shadow-[0_4px_15px_rgba(0,163,255,0.05)]">
                <Droplets size={24} />
              </div>
              <div>
                <p className="font-black text-base text-on-surface tracking-tight">加湿等级</p>
                <p className="text-[10px] font-bold text-primary/40 uppercase tracking-widest mt-0.5">建议加湿等级：5级</p>
              </div>
            </div>
            <span className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,163,255,0.2)]">{humidity}</span>
          </div>
          <div className="px-1">
            <input 
              type="range" 
              min="1" 
              max="8" 
              value={humidity} 
              disabled={isTherapyActive}
              onChange={(e) => setHumidity(parseInt(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer disabled:opacity-30 appearance-none bg-black/5 rounded-full" 
            />
          </div>
          <div className="flex justify-between mt-4 text-[11px] font-black text-on-surface/20 px-2">
            {['1','2','3','4','5','6','7','8'].map(n => (
              <span key={n} className={parseInt(n) === humidity ? 'text-primary scale-110' : ''}>
                {n}
              </span>
            ))}
          </div>
        </div>

        {/* Temp */}
        <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_4px_15px_rgba(0,122,255,0.05)]">
                <Thermometer size={24} />
              </div>
              <div>
                <p className="font-black text-base text-on-surface tracking-tight">管路温度</p>
                <p className="text-[10px] font-bold text-secondary/40 uppercase tracking-widest mt-0.5">建议温度：27°C</p>
              </div>
            </div>
            <span className="text-2xl font-black text-primary drop-shadow-[0_0_10px_rgba(0,163,255,0.2)]">{temp}°C</span>
          </div>
          <div className="px-1">
            <input 
              type="range" 
              min="16" 
              max="30" 
              value={temp} 
              disabled={isTherapyActive}
              onChange={(e) => setTemp(parseInt(e.target.value))}
              className="w-full accent-primary h-2 cursor-pointer disabled:opacity-30 appearance-none bg-black/5 rounded-full" 
            />
          </div>
          <div className="flex justify-between mt-4 text-[11px] font-black text-on-surface/20 px-2 tracking-widest">
            <span>16°C</span><span>30°C</span>
          </div>
        </div>

        {/* EPR */}
        <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_15px_30px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-black/5 flex items-center justify-center text-on-surface/60">
              <Wind size={24} />
            </div>
            <div>
              <p className="font-black text-base text-on-surface tracking-tight">EPR (呼气减压)</p>
              <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest">降低呼气时的阻力</p>
            </div>
          </div>
          <div className="flex bg-white/40 p-1.5 rounded-2xl gap-2 border border-black/[0.03]">
            {['关', '1', '2', '3'].map((val, i) => (
              <button 
                key={val} 
                disabled={isTherapyActive}
                onClick={() => setEpr(i)}
                className={`flex-1 py-3.5 rounded-xl text-[11px] font-black transition-all ${
                  i === epr ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-on-surface/20 hover:opacity-100'
                } disabled:opacity-30`}
              >
                {val}
              </button>
            ))}
          </div>
        </div>
        </div>
      </section>
    </div>
  );
};

const JourneyView = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportReady, setReportReady] = useState(false);
  // Find the index for Sept 21 as the default selected day. 
  // Sept 1 is at index 6 (dayIndex 1). So Sept 21 is at index 6 + 20 = 26.
  const [selectedDayIdx, setSelectedDayIdx] = useState<number | null>(26);

  const selectedDay = selectedDayIdx !== null ? JOURNEY_CALENDAR[selectedDayIdx] : null;

  // Calculate real metrics from the calendar
  const septDays = useMemo(() => JOURNEY_CALENDAR.filter(d => d.isSept), []);
  const reachedDays = useMemo(() => septDays.filter(d => d.status === 'full').length, [septDays]);
  const complianceRate = useMemo(() => Math.round((reachedDays / septDays.length) * 100), [reachedDays, septDays]);

  const handleGenerateReport = () => {
    setIsGenerating(true);
    setReportReady(false);
    setTimeout(() => {
      setIsGenerating(false);
      setReportReady(true);
      // Reset after 3 seconds
      setTimeout(() => setReportReady(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-6 pb-40">
      {/* Monthly Performance Dashboard (First Section) */}
      <section className="relative overflow-hidden rounded-[40px] liquid-glass p-7 border border-black/[0.03] shadow-[0_30px_60px_-12px_rgba(0,0,0,0.08)]">
        <div className="flex justify-between items-start mb-6">
          <div className="space-y-1">
            <h3 className="text-xl font-black text-on-surface tracking-tight">本月概览</h3>
            <p className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-widest">2024年9月 · 已达标 {reachedDays}/{septDays.length}天</p>
          </div>
          <button 
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2 ${
              reportReady ? 'bg-secondary text-white shadow-[0_4px_15px_rgba(0,163,255,0.2)]' : 'bg-primary/10 text-primary border border-primary/20'
            }`}
          >
            {isGenerating ? (
              <>
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <Activity size={14} />
                </motion.div>
                正在生成...
              </>
            ) : reportReady ? (
              <>
                <CheckCircle2 size={14} />
                已存入相册
              </>
            ) : (
              <>
                <ExternalLink size={14} />
                生成报告
              </>
            )}
          </button>
        </div>

        <div className="flex items-center gap-10 mb-8">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90 drop-shadow-[0_4px_15px_rgba(0,163,255,0.05)]" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" stroke="rgba(0,0,0,0.05)" strokeWidth="6" fill="transparent" />
              <motion.circle 
                cx="50" cy="50" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="263.89" 
                initial={{ strokeDashoffset: 263.89 }}
                animate={{ strokeDashoffset: 263.89 - (263.89 * (complianceRate / 100)) }}
                transition={{ duration: 2, ease: "easeOut" }}
                strokeLinecap="round" 
                className="text-primary"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-on-surface tracking-tighter">{complianceRate}</span>
              <span className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest mt-1">依从率 %</span>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            {/* AHI Block */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">平均 AHI</p>
              <p className="text-xl font-black text-on-surface leading-none py-1">
                1.2<span className="text-[9px] text-primary font-black uppercase tracking-widest ml-1">事件/小时</span>
              </p>
              <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mt-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "80%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-secondary rounded-full shadow-[0_2px_8px_rgba(0,163,255,0.15)]" 
                />
              </div>
            </div>
            
            {/* Leak Block */}
            <div className="flex flex-col gap-1.5">
              <p className="text-[9px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">平均 漏气</p>
              <p className="text-xl font-black text-on-surface leading-none py-1">
                2.4<span className="text-[9px] text-primary font-black uppercase tracking-widest ml-1">L/min</span>
              </p>
              <div className="w-full h-1.5 bg-black/5 rounded-full overflow-hidden mt-0.5">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: "40%" }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="h-full bg-amber-500 rounded-full shadow-[0_2px_8px_rgba(245,158,11,0.15)]" 
                />
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-black/5 rounded-3xl flex items-center gap-5 border border-black/[0.03]">
          <div className="p-3 bg-primary/10 rounded-2xl shadow-[0_4px_10px_rgba(0,163,255,0.1)]">
            <Moon size={22} className="text-primary" />
          </div>
          <div>
            <p className="text-[12px] font-black text-on-surface tracking-tight">您的睡眠一致性提高了 14%</p>
            <p className="text-[10px] text-on-surface-variant/60 font-medium uppercase tracking-wide mt-0.5">相比 8 月份，您入睡时间更固定了。</p>
          </div>
        </div>
      </section>

      {/* Calendar Heatmap */}
      <section className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.06)]">
      <div className="flex justify-between items-center mb-8">
        <h3 className="text-lg font-black text-on-surface tracking-tight">依从性日历</h3>
        <div className="flex gap-4">
          <div className="flex items-center gap-2 text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-primary shadow-[0_2px_8px_rgba(45,124,255,0.1)]" /> 达标
          </div>
          <div className="flex items-center gap-2 text-[9px] font-black text-on-surface-variant/60 uppercase tracking-widest">
            <div className="w-2.5 h-2.5 rounded-full bg-primary/20 border border-primary/20" /> 部分
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-y-5 gap-x-2 text-center">
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <span key={d} className="text-[10px] font-black text-on-surface-variant/60 tracking-widest">{d}</span>)}
        {JOURNEY_CALENDAR.map(({ value, status, isSept, id }, i) => (
          <button 
            key={i} 
            onClick={() => isSept && setSelectedDayIdx(i)}
            className="flex justify-center active:scale-90 transition-transform"
          >
            <div className={`w-9 h-9 aspect-square shrink-0 rounded-full flex items-center justify-center text-[11px] font-black transition-all relative ${
              status === 'full' ? 'bg-primary text-white shadow-[0_4px_10px_rgba(45,124,255,0.15)]' :
              status === 'partial' ? 'bg-primary/20 text-primary border border-primary/20' :
              isSept ? 'text-on-surface/80 hover:bg-black/5' : 'text-on-surface-variant/20'
            } ${selectedDayIdx === i ? 'ring-2 ring-primary ring-offset-2 ring-offset-white' : ''}`}>
              {value}
            </div>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {selectedDay && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-7 border-t border-black/[0.03] overflow-hidden"
          >
            <div className="flex justify-between items-center mb-5">
              <h4 className="text-base font-black text-on-surface tracking-tight">9月 {selectedDay.value}日 睡眠详报</h4>
              <button 
                onClick={() => setSelectedDayIdx(null)}
                className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] hover:text-primary transition-colors"
              >
                关闭详情
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: '治疗时长', value: selectedDay.metrics.duration, icon: Activity },
                { label: '呼吸事件', value: selectedDay.metrics.ahi, icon: Wind },
                { label: '系统漏气', value: selectedDay.metrics.leak, icon: ShieldCheck },
              ].map((item, idx) => (
                <div key={idx} className="bg-black/5 p-4 rounded-3xl border border-black/[0.03] flex flex-col items-center gap-1.5">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center mb-1">
                    <item.icon size={14} className="text-primary/60" />
                  </div>
                  <span className="text-base font-black text-on-surface tracking-tight">{item.value}</span>
                  <span className="text-[8px] font-black text-on-surface-variant/60 uppercase tracking-widest text-center">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>

      {/* Achievements */}
    <section className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-on-surface tracking-tight">成就</h3>
        <span className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">已获得 2/4</span>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: '早起鸟', Icon: Sun, description: '连续3天早起', earned: true },
          { label: '完美贴合', Icon: CheckCircle2, description: '完成首次测试', earned: true },
          { label: '100晚俱乐部', Icon: Moon, description: '累计治疗100晚', earned: false },
          { label: '治疗精英', Icon: Trophy, description: '月度依从率95%+', earned: false },
        ].map(({ label, Icon, description, earned }) => (
          <div 
            key={label} 
            className={`liquid-glass p-6 rounded-[32px] flex flex-col items-center text-center gap-3 transition-all duration-500 border border-white/60 ${
              earned 
                ? 'opacity-100 shadow-[0_15px_30px_-10px_rgba(0,163,255,0.15)] ring-1 ring-black/5' 
                : 'opacity-100 shadow-[0_15px_30px_-10px_rgba(0,0,0,0.1)] ring-1 ring-black/5'
            }`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
              earned ? 'bg-primary/10 text-primary shadow-[0_4px_10px_rgba(0,163,255,0.1)]' : 'bg-black/10 text-black/40'
            }`}>
              <Icon size={28} className={earned ? '' : 'grayscale'} />
            </div>
            <div className="space-y-1">
              <span className={`text-[11px] font-black uppercase tracking-widest block ${earned ? 'text-on-surface' : 'text-on-surface/60'}`}>
                {label}
              </span>
              <p className={`text-[9px] font-bold leading-tight uppercase tracking-tighter ${earned ? 'text-on-surface-variant/40' : 'text-black/30'}`}>
                {description}
              </p>
            </div>
            {!earned && (
              <div className="mt-1 px-3 py-1 rounded-full bg-black/5 text-[8px] font-black uppercase tracking-widest text-black/30 border border-black/5">
                待解锁
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  </div>
);
};

const ProfileView = ({ 
  isLoggedIn, 
  onLogin, 
  onLogout 
}: { 
  isLoggedIn: boolean; 
  onLogin: () => void; 
  onLogout: () => void;
}) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [showConfirm, setShowConfirm] = useState(false);
  const [isUnbinding, setIsUnbinding] = useState(false);
  const [isUnbound, setIsUnbound] = useState(false);

  const [modalContent, setModalContent] = useState<{ title: string; type: 'privacy' | 'help' | 'notifications' } | null>(null);

  const handleUnbind = () => {
    setIsUnbinding(true);
    setTimeout(() => {
      setIsUnbinding(false);
      setShowConfirm(false);
      setIsUnbound(true);
    }, 1500);
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setIsLoggingOut(false);
      setShowLogoutConfirm(false);
      onLogout();
    }, 1000);
  };

  if (!isLoggedIn) {
    return (
      <div className="space-y-12 pb-40 px-4 pt-16">
        <section className="flex flex-col items-center text-center space-y-10 relative overflow-hidden">
          <div className="w-28 h-28 bg-black/5 rounded-full flex items-center justify-center text-on-surface-variant/30 border border-black/[0.03]">
            <User size={56} strokeWidth={1} />
          </div>
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-on-surface tracking-tighter">BreathSync</h2>
          </div>
          <button 
            onClick={onLogin}
            className="w-full max-w-[280px] h-16 rounded-[28px] bg-primary text-white font-black flex items-center justify-center gap-3 text-sm shadow-[0_12px_40px_rgba(45,124,255,0.25)] active:scale-95 transition-all uppercase tracking-[0.2em]"
          >
            登录
          </button>
          
          <div className="pt-4 flex items-center gap-5 text-on-surface-variant/30 text-[10px] font-black uppercase tracking-[0.3em]">
            <span className="w-10 h-px bg-current" />
            快速访问
            <span className="w-10 h-px bg-current" />
          </div>
          
          <div className="flex gap-12">
            <button 
              onClick={() => setModalContent({ title: '帮助中心', type: 'help' })}
              className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shadow-sm">
                <HelpCircle size={28} className="text-on-surface/30 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">帮助中心</span>
            </button>
            <button 
              onClick={() => setModalContent({ title: '隐私协议', type: 'privacy' })}
              className="flex flex-col items-center gap-3 group active:scale-95 transition-transform"
            >
              <div className="w-16 h-16 rounded-2xl bg-black/5 border border-black/5 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all shadow-sm">
                <ShieldCheck size={28} className="text-on-surface/30 group-hover:text-primary transition-colors" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">隐私协议</span>
            </button>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[80px] -mr-10 -mt-10 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-secondary/10 rounded-full blur-[80px] -ml-10 -mb-10 pointer-events-none" />
        </section>

        <InfoModal content={modalContent} onClose={() => setModalContent(null)} />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-40">
      {/* Account Info Card */}
      <section className="liquid-glass p-9 rounded-[40px] flex flex-col items-center text-center relative overflow-hidden border border-black/[0.03] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.08)]">
        <button 
          onClick={() => setShowLogoutConfirm(true)}
          className="absolute top-8 right-8 p-3 bg-black/5 rounded-2xl text-on-surface-variant/40 hover:text-red-500 hover:bg-red-500/10 transition-all z-10"
        >
          <LogOut size={20} />
        </button>

        <div className="relative mb-5">
          <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white shadow-2xl relative group ring-4 ring-primary/10">
            <img 
              src="/G6.jpg" 
              className="w-full h-full object-cover" 
              alt="Alex Chen"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity backdrop-blur-sm">
              <Edit3 size={24} className="text-white" />
            </div>
          </div>
          <div className="absolute -bottom-1 -right-1 p-2 bg-primary text-white rounded-full border-4 border-white shadow-lg">
            <Edit3 size={16} />
          </div>
        </div>
        
        <div className="space-y-1.5 mb-9">
          <h2 className="text-3xl font-black text-on-surface tracking-tight">Alex Chen</h2>
          <div className="flex items-center justify-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-primary shadow-[0_2px_8px_rgba(45,124,255,0.2)]" />
            <p className="text-[12px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">Premium Member</p>
          </div>
        </div>
        
        {isUnbound ? (
          <button 
            onClick={() => setIsUnbound(false)}
            className="w-full h-16 rounded-[28px] bg-primary text-white font-black flex items-center justify-center gap-3 text-sm shadow-[0_10px_30px_rgba(45,124,255,0.2)] active:scale-95 transition-all uppercase tracking-widest"
          >
            <BluetoothConnected size={20} strokeWidth={3} /> 重新绑定设备
          </button>
        ) : (
          <button 
            onClick={() => setShowConfirm(true)}
            className="w-full h-16 rounded-[28px] bg-black/5 border border-black/[0.03] text-red-500 font-black flex items-center justify-center gap-3 text-sm hover:bg-red-500/10 hover:border-red-500/20 active:scale-95 transition-all uppercase tracking-widest"
          >
            <Unlink size={20} /> 解绑当前设备
          </button>
        )}
      </section>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-[300px] p-8 rounded-[40px] shadow-2xl space-y-8 text-center border border-white/20"
            >
              <div className="w-16 h-16 bg-on-surface-variant/5 rounded-full flex items-center justify-center text-on-surface-variant/40 mx-auto">
                <LogOut size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight">退出当前账号？</h4>
                <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed opacity-60">
                  退出后将停止云端同步，但您的历史睡眠记录仍会保存在此设备上。
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  disabled={isLoggingOut}
                  onClick={handleLogout}
                  className="w-full h-14 bg-on-surface text-surface rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      退出登录中...
                    </>
                  ) : '确定退出'}
                </button>
                <button 
                  disabled={isLoggingOut}
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full h-14 bg-surface-container rounded-[24px] font-bold text-sm text-on-surface-variant disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Unbind Confirmation Modal */}
      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-surface w-full max-w-[300px] p-8 rounded-[40px] shadow-2xl space-y-8 text-center border border-white/20"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center text-red-500 mx-auto">
                <Unlink size={32} />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold tracking-tight">确认解除绑定？</h4>
                <p className="text-[13px] text-on-surface-variant font-medium leading-relaxed opacity-60">
                  解除绑定后将停止自动同步呼吸机数据，您需要重新进入配对模式才能连接。
                </p>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <button 
                  disabled={isUnbinding}
                  onClick={handleUnbind}
                  className="w-full h-14 bg-red-500 text-white rounded-[24px] font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isUnbinding ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      解除绑定中...
                    </>
                  ) : '确定解绑'}
                </button>
                <button 
                  disabled={isUnbinding}
                  onClick={() => setShowConfirm(false)}
                  className="w-full h-14 bg-surface-container rounded-[24px] font-bold text-sm text-on-surface-variant disabled:opacity-50"
                >
                  取消
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Maintenance Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-end px-2">
          <h3 className="text-lg font-bold tracking-tight text-on-surface">设备维护</h3>
          <button className="text-primary text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5 opacity-80">
            <ShoppingBag size={14} /> 耗材商城
          </button>
        </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Filter Life */}
        <div className="liquid-glass p-7 rounded-[40px] border border-black/[0.03] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em]">滤棉寿命</span>
            <span className="text-primary font-black text-2xl drop-shadow-[0_4px_10px_rgba(45,124,255,0.1)]">80%</span>
          </div>
          <div className="w-full h-2 bg-black/5 rounded-full overflow-hidden mt-3 mb-4">
            <div className="h-full bg-primary shadow-[0_2px_8px_rgba(45,124,255,0.15)]" style={{ width: '80%' }} />
          </div>
          <p className="text-[11px] font-black text-on-surface-variant/40 uppercase tracking-widest">预计 12 天后更换</p>
        </div>

        {/* Mask Life */}
        <div className="liquid-glass p-7 rounded-[40px] flex items-center gap-6 border border-black/[0.03] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="w-16 h-16 rounded-3xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_4px_15px_rgba(45,124,255,0.05)]">
            <Square size={32} />
          </div>
          <div>
            <span className="text-[10px] font-black text-on-surface-variant/60 uppercase tracking-[0.2em] block mb-1">建议面罩更换</span>
            <span className="text-3xl font-black text-on-surface tracking-tighter">45 天后</span>
          </div>
        </div>

        {/* Checklist */}
        <section className="liquid-glass p-7 rounded-[40px] space-y-5 border border-black/[0.03] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-xl bg-black/5 flex items-center justify-center">
              <ListChecks size={18} className="text-on-surface-variant/60" />
            </div>
            <h4 className="text-[11px] font-black text-on-surface-variant/60 uppercase tracking-widest">维护清单</h4>
          </div>
          {[
            { label: '每日水箱清洗', status: '已完成' },
            { label: '每周管路清洗', status: '已完成' },
          ].map(item => (
            <div key={item.label} className="p-4 bg-black/5 rounded-2xl flex items-center justify-between border border-black/[0.03]">
              <div className="flex items-center gap-4">
                <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center">
                  <CheckCircle2 size={12} className="text-primary" />
                </div>
                <span className="text-[13px] font-black text-on-surface">{item.label}</span>
              </div>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest opacity-60">{item.status}</span>
            </div>
          ))}
        </section>
      </div>
    </section>

    {/* Help & Settings */}
    <section className="space-y-4">
      <h3 className="text-lg font-black text-on-surface tracking-tight px-2">系统设置</h3>
      <div className="liquid-glass rounded-[40px] overflow-hidden divide-y divide-black/[0.03] border border-black/[0.03] shadow-[0_20px_40px_-12px_rgba(0,0,0,0.06)]">
        <button 
          onClick={() => setModalContent({ title: '消息通知', type: 'notifications' })}
          className="w-full p-7 flex items-center justify-between hover:bg-black/[0.02] active:bg-black/[0.03] transition-all group text-left"
        >
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary shadow-[0_4px_12px_rgba(45,124,255,0.08)] group-active:scale-90 transition-transform border border-secondary/20">
              <Bell size={24} />
            </div>
            <div>
              <span className="text-base font-black text-on-surface block tracking-tight">消息通知</span>
              <span className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-[0.2em] leading-none">系统、提醒、月度报告</span>
            </div>
          </div>
          <ChevronRight size={20} className="text-on-surface/10 group-hover:text-on-surface/30 transition-colors" />
        </button>
        <button 
          onClick={() => setModalContent({ title: '隐私政策', type: 'privacy' })}
          className="w-full p-6 flex items-center justify-between hover:bg-black/[0.02] active:bg-black/[0.03] transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 group-active:scale-90 transition-transform">
              <ShieldCheck size={20} />
            </div>
            <div>
              <span className="text-[13px] font-black text-on-surface block">隐私政策</span>
              <span className="text-[10px] text-on-surface-variant/60 font-black uppercase tracking-widest leading-none">数据安全及合规</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-on-surface/10" />
        </button>
        <button 
          onClick={() => setModalContent({ title: '帮助与支持', type: 'help' })}
          className="w-full p-6 flex items-center justify-between hover:bg-black/[0.02] active:bg-black/[0.03] transition-all group text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600 group-active:scale-90 transition-transform">
              <HelpCircle size={20} />
            </div>
            <div>
              <span className="text-[13px] font-black text-on-surface block">帮助与支持</span>
              <span className="text-[10px] text-on-surface-variant/60 font-black uppercase tracking-widest leading-none">常见问题、客服</span>
            </div>
          </div>
          <ChevronRight size={18} className="text-on-surface/10" />
        </button>
      </div>
    </section>
    
    <div className="text-center pb-8 opacity-40">
      <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">版本 V1.2.0</span>
    </div>

    {/* Info Modal Component */}
    <InfoModal content={modalContent} onClose={() => setModalContent(null)} />
  </div>
);
};

const InfoModal = ({ content, onClose }: { content: { title: string; type: 'privacy' | 'help' | 'notifications' } | null; onClose: () => void }) => {
  return (
    <AnimatePresence>
      {content && (
        <div className="fixed inset-0 z-[150] flex items-end justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="bg-surface w-full max-h-[85vh] rounded-t-[48px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
          >
            <div className="w-12 h-1.5 bg-surface-container rounded-full mx-auto mt-4 mb-2 opacity-50" />
            
            <div className="px-8 py-6 border-b border-surface-container flex items-center justify-between">
              <h3 className="text-xl font-extrabold tracking-tight">{content.title}</h3>
              <button 
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center"
              >
                <Square size={16} className="rotate-45" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-8 py-8 space-y-8 pb-12 scrollbar-hide">
              {content.type === 'privacy' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">数据加密</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed opacity-70">
                      您的所有睡眠数据在传输前均经过 256 位 AES 加密，确保在设备与云端之间保持私密性。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">隐私控制</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed opacity-70">
                      您可以随时停用云同步或删除账户下的所有历史记录。我们绝不会将您的健康数据出售给任何第三方。
                    </p>
                  </div>
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">合规性</h4>
                    <p className="text-[13px] text-on-surface-variant leading-relaxed opacity-70">
                      我们严格遵守医疗数据保护法规，包括对个人识别信息的匿名化处理。
                    </p>
                  </div>
                </div>
              )}

              {content.type === 'help' && (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <h4 className="text-sm font-black uppercase tracking-widest text-primary">常见问题</h4>
                    <div className="space-y-2">
                      {['设备连接失败怎么办？', '如何清洁面罩和管路？', '睡眠报告数据解读', '关于算法优化策略'].map(q => (
                        <div key={q} className="p-5 bg-black/5 rounded-2xl flex items-center justify-between border border-black/[0.03]">
                          <span className="text-[14px] font-black text-on-surface text-left tracking-tight">{q}</span>
                          <ChevronRight size={16} className="text-on-surface/20" />
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-7 bg-primary/5 rounded-[40px] space-y-4 border border-primary/10">
                    <div>
                      <h4 className="text-base font-black text-on-surface">在线客服</h4>
                      <p className="text-[11px] text-on-surface-variant/60 tracking-tight leading-none uppercase font-black mt-1">响应时间：周一至周日 09:00 - 21:00</p>
                    </div>
                    <button className="w-full h-14 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-[0_4px_15px_rgba(45,124,255,0.2)]">开始咨询</button>
                  </div>
                </div>
              )}

              {content.type === 'notifications' && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-5 bg-black/5 rounded-2xl border border-black/[0.03]">
                      <div className="space-y-1">
                        <span className="text-[14px] font-black text-on-surface block tracking-tight">每日报告推送</span>
                        <span className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest leading-none">起床后 15 分钟内</span>
                      </div>
                      <div className="w-12 h-6 bg-primary rounded-full relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-black/5 rounded-2xl border border-black/[0.03]">
                      <div className="space-y-1">
                        <span className="text-[14px] font-black text-on-surface block tracking-tight">维护提醒</span>
                        <span className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest leading-none">滤棉更换、水箱清洗</span>
                      </div>
                      <div className="w-12 h-6 bg-primary rounded-full relative">
                        <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-5 bg-black/5 rounded-2xl opacity-30 cursor-not-allowed border border-black/[0.03]">
                      <div className="space-y-1">
                        <span className="text-[14px] font-black text-on-surface block tracking-tight">异常告警</span>
                        <span className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest leading-none">漏气量过大、设备断连</span>
                      </div>
                      <div className="w-12 h-6 bg-black/10 rounded-full relative">
                        <div className="absolute top-1 left-1 w-4 h-4 bg-white/40 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};


// --- Main App ---

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const titles = {
    home: '首页',
    therapy: '设备',
    journey: '数据',
    profile: '我的',
  };

  return (
    <div className="min-h-screen bg-[#f0f2f5] flex justify-center selection:bg-primary/20 overflow-hidden">
      {/* Content Container (Mobile-first centered layout) */}
      <div className="w-full max-w-[390px] h-screen bg-surface relative overflow-hidden shadow-2xl">
          {/* Header */}
          <Header title={isLoggedIn ? titles[currentView as keyof typeof titles] : '欢迎'} />

          {/* Scrollable View Area */}
          <main className={`px-6 h-full overflow-y-auto scrollbar-hide ${isLoggedIn ? 'pt-32 pb-40' : 'pt-32 pb-10'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentView}-${isLoggedIn}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                {!isLoggedIn ? (
                  <ProfileView 
                    isLoggedIn={isLoggedIn} 
                    onLogin={() => setIsLoggedIn(true)} 
                    onLogout={() => setIsLoggedIn(false)} 
                  />
                ) : (
                  <>
                    {currentView === 'home' && <HomeView />}
                    {currentView === 'therapy' && <TherapyView />}
                    {currentView === 'journey' && <JourneyView />}
                    {currentView === 'profile' && (
                      <ProfileView 
                        isLoggedIn={isLoggedIn} 
                        onLogin={() => setIsLoggedIn(true)} 
                        onLogout={() => setIsLoggedIn(false)} 
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </main>

          {isLoggedIn && <BottomNav active={currentView} onChange={setCurrentView} />}
          
      </div>
    </div>
  );
}
