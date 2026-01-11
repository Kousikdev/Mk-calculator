
import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, RefreshCw, DollarSign, Bot, Settings, Info } from 'lucide-react';
import { AppMode, ThemeMode, AppLanguage } from '../types';
import { playClickSound } from '../services/audioService';
import Logo from './Logo';

interface LayoutProps {
  activeMode: AppMode;
  onModeChange: (mode: AppMode) => void;
  children: React.ReactNode;
  soundEnabled: boolean;
  theme: ThemeMode;
  glassBlur: number;
  language: AppLanguage;
}

const navLabels = {
  en: { calc: "Calc", unit: "Unit", rates: "Rates", ai: "Nova AI" },
  bn: { calc: "হিসাব", unit: "ইউনিট", rates: "দর", ai: "এআই" }
};

const Layout: React.FC<LayoutProps> = ({ activeMode, onModeChange, children, soundEnabled, theme, glassBlur, language }) => {
  const isDark = theme === 'dark';
  const labels = navLabels[language];
  
  const handleAction = (callback: () => void) => {
    playClickSound(soundEnabled);
    callback();
  };

  const NavItem = ({ mode, icon: Icon, label }: { mode: AppMode, icon: any, label: string }) => (
    <button
      onClick={() => handleAction(() => onModeChange(mode))}
      className={`flex flex-col items-center justify-center gap-1 py-3 transition-all relative group ${
        activeMode === mode 
          ? 'text-indigo-500' 
          : isDark ? 'text-white/40 hover:text-white/60' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-[10px] font-bold tracking-wide">{label}</span>
      {activeMode === mode && (
        <motion.div 
          layoutId="active-pill"
          transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
          className="absolute -top-1 w-8 h-1 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.3)]"
        />
      )}
    </button>
  );

  return (
    <div className={`flex flex-col h-screen w-full max-w-md mx-auto overflow-hidden shadow-2xl relative border-x transition-colors duration-500 ${
      isDark ? 'bg-[#050505] border-white/5 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
    }`}>
      {/* Subtle Static Background */}
      <div 
        className={`absolute top-[-10%] left-[-10%] w-[120%] h-[120%] rounded-full blur-[120px] opacity-10 pointer-events-none z-0 ${
          isDark 
            ? 'bg-gradient-to-tr from-indigo-900 via-purple-900/20 to-transparent' 
            : 'bg-gradient-to-tr from-indigo-100 via-purple-50 to-transparent'
        }`} 
      />

      <header className="px-6 py-6 flex items-center justify-between z-10">
        <div 
          className="flex items-center gap-3 cursor-pointer" 
          onClick={() => handleAction(() => onModeChange('calculator'))}
        >
          <Logo size={36} />
          <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">NovaCalc</h1>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleAction(() => onModeChange('about'))} 
            className={`p-2 rounded-full transition-colors ${
              activeMode === 'about' 
                ? 'bg-indigo-500/20 text-indigo-500' 
                : isDark ? 'hover:bg-white/5 text-white/60' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <Info className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleAction(() => onModeChange('settings'))} 
            className={`p-2 rounded-full transition-colors ${
              activeMode === 'settings' 
                ? 'bg-indigo-500/20 text-indigo-500' 
                : isDark ? 'hover:bg-white/5 text-white/60' : 'hover:bg-slate-200 text-slate-500'
            }`}
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main 
        className={`flex-1 overflow-hidden z-10 mx-4 mb-24 rounded-3xl border transition-all duration-500 ${
          isDark 
            ? 'bg-white/[0.03] border-white/10' 
            : 'bg-white/80 border-slate-200 shadow-xl shadow-slate-200/50'
        }`}
        style={{ backdropFilter: `blur(${glassBlur}px)` }}
      >
        {children}
      </main>

      <nav 
        className={`absolute bottom-0 w-full border-t transition-colors duration-500 grid grid-cols-4 px-4 pb-6 pt-2 z-20 ${
          isDark ? 'bg-black/60 border-white/10' : 'bg-white/95 border-slate-200 shadow-[0_-8px_30px_rgba(0,0,0,0.04)]'
        }`}
        style={{ backdropFilter: `blur(${glassBlur}px)` }}
      >
        <NavItem mode="calculator" icon={Calculator} label={labels.calc} />
        <NavItem mode="converter" icon={RefreshCw} label={labels.unit} />
        <NavItem mode="currency" icon={DollarSign} label={labels.rates} />
        <NavItem mode="ai-assistant" icon={Bot} label={labels.ai} />
      </nav>
    </div>
  );
};

export default Layout;
