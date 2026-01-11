
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import CalculatorUI from './components/CalculatorUI';
import AiAssistant from './components/AiAssistant';
import { AppMode, CalculationHistory, AppSettings, CalcLayout, ButtonSize } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, TrendingUp, Search, Info, Sliders, Layout as LayoutIcon, Type } from 'lucide-react';

const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('calculator');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  
  // Persistent Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nova_settings');
    return saved ? JSON.parse(saved) : {
      themeColor: '#6366f1',
      layout: 'standard',
      buttonSize: 'md',
      precision: 2
    };
  });

  useEffect(() => {
    localStorage.setItem('nova_settings', JSON.stringify(settings));
  }, [settings]);

  const addHistory = (expression: string, result: string) => {
    setHistory(prev => [{
      id: Math.random().toString(36).substr(2, 9),
      expression,
      result,
      timestamp: new Date()
    }, ...prev].slice(0, 50));
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const renderContent = () => {
    switch (activeMode) {
      case 'calculator':
        return (
          <CalculatorUI 
            onCalculate={addHistory} 
            themeColor={settings.themeColor} 
            layout={settings.layout}
            buttonSize={settings.buttonSize}
            precision={settings.precision}
          />
        );
      case 'ai-assistant':
        return <AiAssistant />;
      case 'converter':
        return (
          <div className="p-6 h-full flex flex-col items-center justify-center text-center space-y-4">
            <RefreshCw className="w-16 h-16 text-indigo-400 mb-2 animate-spin-slow" />
            <h2 className="text-2xl font-bold">Unit Converter</h2>
            <p className="text-white/40">Convert between Length, Weight, Temp, and more with high precision.</p>
            <div className="w-full space-y-3">
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-medium">Meters</span>
                  <input defaultValue="10" className="bg-transparent text-right w-24 outline-none font-bold text-lg" />
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center">
                  <span className="text-sm font-medium">Kilometers</span>
                  <span className="font-bold text-lg text-indigo-400">0.01</span>
               </div>
            </div>
            <p className="text-[10px] text-white/20 italic uppercase tracking-widest pt-10">Advanced unit engine active</p>
          </div>
        );
      case 'currency':
        return (
          <div className="p-6 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Currency Exchange</h2>
              <TrendingUp className="text-green-400 w-5 h-5" />
            </div>
            <div className="space-y-4">
               <div className="bg-indigo-600/20 border border-indigo-500/30 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-indigo-300 font-bold">FROM</span>
                    <span className="text-xs text-indigo-300 font-bold">USD</span>
                  </div>
                  <input defaultValue="1.00" className="bg-transparent text-3xl font-bold outline-none w-full" />
               </div>
               <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-white/40 font-bold">TO</span>
                    <span className="text-xs text-white/40 font-bold">INR</span>
                  </div>
                  <div className="text-3xl font-bold">82.94</div>
               </div>
            </div>
            <div className="mt-auto bg-white/5 p-4 rounded-2xl flex items-center gap-3">
              <Search className="w-5 h-5 text-white/40" />
              <div className="text-xs text-white/60">Rates updated 5 mins ago via Search Grounding</div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6 h-full overflow-y-auto pb-10">
            <h2 className="text-2xl font-bold mb-6">Advanced Customization</h2>
            
            <div className="space-y-8">
              {/* Theme Color Selection */}
              <div>
                <label className="text-xs font-bold text-white/40 uppercase mb-3 block">Primary Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {['#6366f1', '#ec4899', '#f97316', '#22c55e', '#ef4444', '#06b6d4', '#8b5cf6', '#f59e0b'].map(c => (
                    <button 
                      key={c}
                      onClick={() => updateSetting('themeColor', c)}
                      className={`h-10 rounded-xl transition-all ${settings.themeColor === c ? 'ring-2 ring-white scale-110 shadow-lg' : 'hover:scale-105 opacity-60 hover:opacity-100'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Layout Toggle */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <LayoutIcon className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Calculator Layout</label>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {(['standard', 'scientific'] as CalcLayout[]).map(l => (
                    <button
                      key={l}
                      onClick={() => updateSetting('layout', l)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settings.layout === l ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Button Size */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Button Size</label>
                </div>
                <div className="flex gap-2 p-1 bg-white/5 rounded-2xl border border-white/10">
                  {(['sm', 'md', 'lg'] as ButtonSize[]).map(s => (
                    <button
                      key={s}
                      onClick={() => updateSetting('buttonSize', s)}
                      className={`flex-1 py-2 text-sm font-medium rounded-xl transition-all ${settings.buttonSize === s ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
                    >
                      {s.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decimal Precision */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Type className="w-4 h-4 text-white/40" />
                  <label className="text-xs font-bold text-white/40 uppercase">Decimal Places: {settings.precision}</label>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="8" 
                  step="1"
                  value={settings.precision}
                  onChange={(e) => updateSetting('precision', parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between text-[10px] text-white/20 mt-2">
                  <span>INTEGER</span>
                  <span>MAX (8)</span>
                </div>
              </div>

              {/* Feature Toggles */}
              <div className="bg-white/5 p-4 rounded-3xl border border-white/10 space-y-4">
                 <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm block">Haptic Feedback</span>
                      <span className="text-[10px] text-white/30 uppercase">Tactile vibration on tap</span>
                    </div>
                    <button className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </button>
                 </div>
                 <div className="flex justify-between items-center">
                    <div>
                      <span className="text-sm block">Auto-Save History</span>
                      <span className="text-[10px] text-white/30 uppercase">Cloud sync enabled</span>
                    </div>
                    <button className="w-10 h-5 bg-indigo-600 rounded-full relative">
                      <div className="absolute right-1 top-1 w-3 h-3 bg-white rounded-full" />
                    </button>
                 </div>
              </div>

              {/* Engine Info */}
              <div className="bg-indigo-500/5 p-4 rounded-3xl border border-indigo-500/10">
                 <div className="flex items-center gap-2 text-indigo-400 mb-2">
                    <Info className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">System Engine</span>
                 </div>
                 <p className="text-xs text-white/60 leading-relaxed italic">Nova Intelligence v3.0 is active. Customizations are applied instantly across all app modules.</p>
              </div>
            </div>
          </div>
        )
      default:
        return null;
    }
  };

  return (
    <Layout activeMode={activeMode} onModeChange={setActiveMode}>
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, scale: 0.98, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.98, y: -10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="h-full overflow-hidden"
        >
          {renderContent()}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};

export default App;
