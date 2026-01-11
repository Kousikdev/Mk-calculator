
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Layout from './components/Layout';
import CalculatorUI from './components/CalculatorUI';
import AiAssistant from './components/AiAssistant';
import Logo from './components/Logo';
import { AppMode, CalculationHistory, AppSettings, CalcLayout, ButtonSize, ButtonShape, ThemeMode, AppFont, AppLanguage } from './types';
import { 
  RefreshCw, Search, ArrowRightLeft, 
  CheckCircle2, Heart, Github, Scale, Thermometer, Box, Globe, Gauge, Database, Clock,
  Moon, Sun, Monitor, Settings2, Palette, 
  ChevronDown, Check, Type, Info, Zap, Languages, MousePointer2, Sparkles
} from 'lucide-react';
import { playClickSound } from './services/audioService';

const currencies: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.79, INR: 83.30, JPY: 151.60, 
  AUD: 1.52, CAD: 1.35, CHF: 0.90, CNY: 7.23, BDT: 109.50,
  AED: 3.67, SAR: 3.75, SGD: 1.35, KRW: 1345.50, RUB: 92.40,
  NZD: 1.66, MXN: 16.50, BRL: 5.05, ZAR: 18.70, TRY: 32.20,
  MYR: 4.75, THB: 36.40, VND: 24850.00
};

const units: any = {
  length: { m: 1, km: 1000, cm: 0.01, mm: 0.001, mi: 1609.34, yd: 0.9144, ft: 0.3048, "in": 0.0254 },
  weight: { kg: 1, g: 0.001, mg: 0.000001, lb: 0.453592, oz: 0.0283495, ton: 1000 },
  volume: { L: 1, ml: 0.001, gal: 3.78541, qt: 0.946353, pt: 0.473176, cup: 0.236588 },
  area: { "sq m": 1, "sq km": 1000000, "sq mi": 2589988.11, acre: 4046.86, hectare: 10000, "sq ft": 0.092903 },
  speed: { "m/s": 1, "km/h": 0.277778, mph: 0.44704, knot: 0.514444, "ft/s": 0.3048 },
  data: { B: 1, KB: 1024, MB: 1048576, GB: 1073741824, TB: 1099511627776 },
  time: { s: 1, min: 60, h: 3600, day: 86400, week: 604800, month: 2629746, year: 31556952 }
};

const translations = {
  en: {
    personalize: "Personalize",
    appearance: "Appearance",
    themeAccents: "Theme & Accents",
    typography: "Typography & Interface",
    general: "General Settings",
    engine: "Scientific Engine",
    sound: "Sound Feedback",
    haptic: "Haptic Vibration",
    precision: "Decimal Precision",
    glass: "Glass Intensity",
    language: "App Language",
    geometry: "Button Geometry",
    places: "Places",
    version: "Stable Edition",
    developedBy: "Developed by",
    unitEngine: "Unit Engine",
    marketRates: "Market Rates",
    from: "From",
    to: "To"
  },
  bn: {
    personalize: "পছন্দসই সাজান",
    appearance: "চেহারা",
    themeAccents: "থিম ও কালার",
    typography: "ফন্ট ও ইন্টারফেস",
    general: "সাধারণ সেটিংস",
    engine: "বৈজ্ঞানিক ইঞ্জিন",
    sound: "সাউন্ড ফিডব্যাক",
    haptic: "হ্যাপটিক ভাইব্রেশন",
    precision: "দশমিক নির্ভুলতা",
    glass: "গ্লাস ইফেক্ট",
    language: "অ্যাপের ভাষা",
    geometry: "বাটন জ্যামিতি",
    places: "ঘর",
    version: "স্থিতিশীল সংস্করণ",
    developedBy: "তৈরি করেছেন",
    unitEngine: "ইউনিট ইঞ্জিন",
    marketRates: "বাজার দর",
    from: "থেকে",
    to: "প্রতি"
  }
};

const SearchableCurrencySelect = ({ value, onChange, label, isDark, settings }: { value: string, onChange: (val: string) => void, label: string, isDark: boolean, settings: AppSettings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const filteredCurrencies = Object.keys(currencies).filter(c => 
    c.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className={`text-[10px] font-black uppercase tracking-widest mb-1.5 block opacity-40`}>{label}</label>
      <button
        onClick={() => {
          playClickSound(settings.soundEnabled);
          setIsOpen(!isOpen);
          setSearchTerm('');
        }}
        className={`w-full flex items-center justify-between p-3 px-4 rounded-2xl border transition-all ${
          isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
        } hover:border-indigo-500/50`}
      >
        <span className="font-black text-lg">{value}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`absolute left-0 right-0 mt-2 z-50 rounded-2xl border shadow-2xl overflow-hidden backdrop-blur-3xl ${
              isDark ? 'bg-slate-900/90 border-white/10' : 'bg-white/95 border-slate-200'
            }`}
          >
            <div className="p-2 border-b border-white/5 flex items-center gap-2">
              <Search className="w-4 h-4 opacity-30 ml-2" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm p-2 w-full font-medium"
              />
            </div>
            <div className="max-h-48 overflow-y-auto scrollbar-hide py-1">
              {filteredCurrencies.map(c => (
                <button
                  key={c}
                  onClick={() => {
                    playClickSound(settings.soundEnabled);
                    onChange(c);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-3 px-4 text-sm font-bold transition-colors ${
                    value === c 
                      ? 'bg-indigo-600 text-white' 
                      : isDark ? 'hover:bg-white/10' : 'hover:bg-slate-100'
                  }`}
                >
                  <span>{c}</span>
                  {value === c && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const App: React.FC = () => {
  const [activeMode, setActiveMode] = useState<AppMode>('calculator');
  const [history, setHistory] = useState<CalculationHistory[]>([]);
  const [systemDark, setSystemDark] = useState(false);
  
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp' | 'volume' | 'area' | 'speed' | 'data' | 'time'>('length');
  const [unitFrom, setUnitFrom] = useState('m');
  const [unitTo, setUnitTo] = useState('km');
  const [unitInputValue, setUnitInputValue] = useState('1');

  const [currencyFrom, setCurrencyFrom] = useState('USD');
  const [currencyTo, setCurrencyTo] = useState('INR');
  const [currencyInputValue, setCurrencyInputValue] = useState('1.00');
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('nova_settings_v2');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          ...parsed,
          glassBlur: parsed.glassBlur ?? 20,
          language: parsed.language ?? 'en',
          hapticEnabled: parsed.hapticEnabled ?? true,
          buttonShape: parsed.buttonShape ?? 'rounded'
        };
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
    return {
      themeColor: '#6366f1',
      layout: 'standard',
      buttonSize: 'lg',
      buttonShape: 'rounded',
      fontFamily: 'Plus Jakarta Sans',
      precision: 8,
      soundEnabled: true,
      hapticEnabled: true,
      theme: 'system',
      glassBlur: 20,
      language: 'en'
    };
  });

  const t = translations[settings.language];
  const effectiveTheme: 'dark' | 'light' = useMemo(() => {
    if (settings.theme === 'system') return systemDark ? 'dark' : 'light';
    return settings.theme as 'dark' | 'light';
  }, [settings.theme, systemDark]);

  const isDark = effectiveTheme === 'dark';

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemDark(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    localStorage.setItem('nova_settings_v2', JSON.stringify(settings));
    document.documentElement.style.setProperty('--app-font', `'${settings.fontFamily}', sans-serif`);
    document.documentElement.style.setProperty('--glass-blur', `${settings.glassBlur}px`);
    document.body.style.backgroundColor = isDark ? '#0a0a0a' : '#f8fafc';
  }, [settings, isDark]);

  const triggerHaptic = () => {
    if (settings.hapticEnabled && navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  const updateSetting = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    playClickSound(settings.soundEnabled);
    triggerHaptic();
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const validateNumericInput = (val: string): string => {
    const cleaned = val.replace(/[^0-9.]/g, '');
    const parts = cleaned.split('.');
    if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');
    return cleaned;
  };

  const formatNumber = (num: number, minDecimals = 0, maxDecimals = settings.precision) => {
    return num.toLocaleString(undefined, { 
      minimumFractionDigits: minDecimals,
      maximumFractionDigits: maxDecimals
    });
  };

  const convertUnits = () => {
    const val = parseFloat(unitInputValue) || 0;
    if (unitCategory === 'temp') {
      if (unitFrom === unitTo) return val;
      if (unitFrom === 'C' && unitTo === 'F') return (val * 9/5) + 32;
      if (unitFrom === 'C' && unitTo === 'K') return val + 273.15;
      if (unitFrom === 'F' && unitTo === 'C') return (val - 32) * 5/9;
      if (unitFrom === 'F' && unitTo === 'K') return (val - 32) * 5/9 + 273.15;
      if (unitFrom === 'K' && unitTo === 'C') return val - 273.15;
      if (unitFrom === 'K' && unitTo === 'F') return (val - 273.15) * 9/5 + 32;
      return val;
    }
    const fromBase = val * (units[unitCategory]?.[unitFrom] || 1);
    const toBase = units[unitCategory]?.[unitTo] || 1;
    return fromBase / toBase;
  };

  const convertCurrency = () => {
    const val = parseFloat(currencyInputValue) || 0;
    const fromInUSD = val / currencies[currencyFrom];
    return fromInUSD * currencies[currencyTo];
  };

  return (
    <Layout 
      activeMode={activeMode} 
      onModeChange={setActiveMode} 
      soundEnabled={settings.soundEnabled} 
      theme={effectiveTheme}
      glassBlur={settings.glassBlur}
      language={settings.language}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={activeMode}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="h-full"
        >
          {activeMode === 'calculator' && (
            <CalculatorUI 
              onCalculate={(expr, res) => setHistory(prev => [{ id: Math.random().toString(36).substr(2, 9), expression: expr, result: res, timestamp: new Date() }, ...prev].slice(0, 50))}
              themeColor={settings.themeColor}
              layout={settings.layout}
              buttonSize={settings.buttonSize}
              buttonShape={settings.buttonShape}
              precision={settings.precision}
              history={history}
              onClearHistory={() => setHistory([])}
              soundEnabled={settings.soundEnabled}
              theme={effectiveTheme}
            />
          )}
          
          {activeMode === 'ai-assistant' && <AiAssistant theme={effectiveTheme} />}
          
          {activeMode === 'converter' && (
            <div className="p-6 flex flex-col h-full space-y-4">
              <h2 className="text-2xl font-black tracking-tight">{t.unitEngine}</h2>
              <div className={`grid grid-cols-4 gap-2 p-1.5 rounded-2xl border overflow-x-auto ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                {[
                  { id: 'length', icon: Type, label: 'Length' },
                  { id: 'weight', icon: Scale, label: 'Weight' },
                  { id: 'temp', icon: Thermometer, label: 'Temp' },
                  { id: 'volume', icon: Box, label: 'Vol' },
                  { id: 'area', icon: Globe, label: 'Area' },
                  { id: 'speed', icon: Gauge, label: 'Speed' },
                  { id: 'data', icon: Database, label: 'Data' },
                  { id: 'time', icon: Clock, label: 'Time' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      playClickSound(settings.soundEnabled);
                      setUnitCategory(cat.id as any);
                      const defaults: any = { length: ['m', 'km'], weight: ['kg', 'lb'], temp: ['C', 'F'], volume: ['L', 'ml'], area: ['sq m', 'acre'], speed: ['km/h', 'mph'], data: ['MB', 'GB'], time: ['h', 'min'] };
                      setUnitFrom(defaults[cat.id][0]);
                      setUnitTo(defaults[cat.id][1]);
                    }}
                    className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all min-w-[60px] ${unitCategory === cat.id ? 'bg-indigo-600 text-white shadow-lg' : isDark ? 'text-white/40' : 'text-slate-400'}`}
                  >
                    <cat.icon className="w-4 h-4 mb-1" />
                    <span className="text-[9px] font-bold uppercase">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div className="space-y-4">
                <div className={`p-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <select value={unitFrom} onChange={e => setUnitFrom(e.target.value)} className="bg-transparent text-xs font-black uppercase mb-1 outline-none w-full">
                    {unitCategory === 'temp' ? ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>) : Object.keys(units[unitCategory]).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <input type="text" value={unitInputValue} onChange={e => setUnitInputValue(validateNumericInput(e.target.value))} className={`bg-transparent text-3xl font-black w-full outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} />
                </div>
                <div className="flex justify-center"><ArrowRightLeft className="rotate-90 text-indigo-500" /></div>
                <div className={`p-4 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <select value={unitTo} onChange={e => setUnitTo(e.target.value)} className="bg-transparent text-xs font-black uppercase mb-1 outline-none w-full">
                    {unitCategory === 'temp' ? ['C', 'F', 'K'].map(u => <option key={u} value={u}>{u}</option>) : Object.keys(units[unitCategory]).map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                  <div className="text-3xl font-black text-indigo-500">{formatNumber(convertUnits(), 0, 6)}</div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'currency' && (
            <div className="p-6 flex flex-col h-full space-y-6">
              <h2 className="text-2xl font-black tracking-tight">{t.marketRates}</h2>
              <div className="space-y-4">
                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-indigo-600/5 border-indigo-500/20' : 'bg-indigo-50 border-indigo-200'}`}>
                  <SearchableCurrencySelect label={t.from} value={currencyFrom} onChange={setCurrencyFrom} isDark={isDark} settings={settings} />
                  <input type="text" value={currencyInputValue} onChange={e => setCurrencyInputValue(validateNumericInput(e.target.value))} className={`bg-transparent text-4xl font-black w-full mt-2 outline-none ${isDark ? 'text-white' : 'text-slate-900'}`} />
                </div>
                <div className="flex justify-center -my-3 z-10">
                  <button onClick={() => { playClickSound(settings.soundEnabled); triggerHaptic(); const temp = currencyFrom; setCurrencyFrom(currencyTo); setCurrencyTo(temp); }} className={`p-3 rounded-full border shadow-lg ${isDark ? 'bg-slate-800 border-white/10' : 'bg-white border-slate-200'}`}>
                    <ArrowRightLeft className="rotate-90 text-indigo-500" />
                  </button>
                </div>
                <div className={`p-5 rounded-3xl border ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <SearchableCurrencySelect label={t.to} value={currencyTo} onChange={setCurrencyTo} isDark={isDark} settings={settings} />
                  <div className="text-4xl font-black text-indigo-500 mt-2">{formatNumber(convertCurrency(), 2, settings.precision)}</div>
                </div>
              </div>
            </div>
          )}

          {activeMode === 'settings' && (
            <div className="p-6 h-full overflow-y-auto space-y-8 scrollbar-hide pb-24">
              <h2 className="text-2xl font-black mb-4">{t.personalize}</h2>
              
              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Palette size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.themeAccents}</label></div>
                <div className="grid grid-cols-3 gap-2">
                  {(['light', 'dark', 'system'] as ThemeMode[]).map(mode => (
                    <button key={mode} onClick={() => updateSetting('theme', mode)} className={`py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${settings.theme === mode ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>{mode}</button>
                  ))}
                </div>
                <div className="grid grid-cols-8 gap-2">
                  {['#6366f1', '#ec4899', '#f97316', '#22c55e', '#06b6d4', '#f59e0b', '#7c3aed', '#000000'].map(c => (
                    <button key={c} onClick={() => updateSetting('themeColor', c)} className={`h-6 rounded-full border-2 transition-transform hover:scale-110 ${settings.themeColor === c ? 'scale-110 border-white' : 'border-transparent opacity-60'}`} style={{ backgroundColor: c }} />
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Languages size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.language}</label></div>
                <div className="grid grid-cols-2 gap-2">
                  {(['en', 'bn'] as AppLanguage[]).map(lang => (
                    <button key={lang} onClick={() => updateSetting('language', lang)} className={`py-3 rounded-2xl text-xs font-bold border transition-all ${settings.language === lang ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-200'}`}>
                      {lang === 'en' ? 'English' : 'বাংলা'}
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><MousePointer2 size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.geometry}</label></div>
                <div className="grid grid-cols-4 gap-2">
                  {(['squircle', 'circle', 'rounded', 'sharp'] as ButtonShape[]).map(shape => (
                    <button key={shape} onClick={() => updateSetting('buttonShape', shape)} className={`aspect-square flex flex-col items-center justify-center rounded-2xl border transition-all ${settings.buttonShape === shape ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' : isDark ? 'bg-white/5 border-white/5 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
                      <div className={`w-5 h-5 border-2 border-current mb-1 ${shape === 'circle' ? 'rounded-full' : shape === 'squircle' ? 'rounded-lg' : shape === 'rounded' ? 'rounded-sm' : 'rounded-none'}`} />
                      <span className="text-[8px] font-bold uppercase">{shape}</span>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Sparkles size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.glass}</label></div>
                <div className="px-2">
                   <div className="flex justify-between text-[10px] font-black uppercase opacity-40 mb-2"><span>Sharp</span><span>Opaque</span></div>
                   <input type="range" min="0" max="40" value={settings.glassBlur} onChange={e => updateSetting('glassBlur', parseInt(e.target.value))} className="w-full h-1 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Monitor size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.typography}</label></div>
                <div className="grid grid-cols-2 gap-2">
                  {(['Plus Jakarta Sans', 'Inter', 'Outfit', 'Space Grotesk', 'JetBrains Mono', 'Montserrat'] as AppFont[]).map(f => (
                    <button key={f} onClick={() => updateSetting('fontFamily', f)} className={`py-3 px-1 rounded-2xl text-[10px] font-medium border truncate transition-all ${settings.fontFamily === f ? 'bg-indigo-600 border-indigo-600 text-white' : isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'}`} style={{ fontFamily: f }}>{f}</button>
                  ))}
                </div>
              </section>

              <section className="space-y-4">
                <div className="flex items-center gap-2 mb-2"><Zap size={18} className="text-indigo-500" /><label className="text-xs font-bold uppercase tracking-widest opacity-50">{t.general}</label></div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold">{t.engine}</span>
                    <button onClick={() => updateSetting('layout', settings.layout === 'standard' ? 'scientific' : 'standard')} className={`w-12 h-6 rounded-full transition-colors relative ${settings.layout === 'scientific' ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <motion.div animate={{ x: settings.layout === 'scientific' ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full m-1 shadow-sm" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold">{t.sound}</span>
                    <button onClick={() => updateSetting('soundEnabled', !settings.soundEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.soundEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <motion.div animate={{ x: settings.soundEnabled ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full m-1 shadow-sm" />
                    </button>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-4 rounded-2xl border border-white/5">
                    <span className="text-sm font-bold">{t.haptic}</span>
                    <button onClick={() => updateSetting('hapticEnabled', !settings.hapticEnabled)} className={`w-12 h-6 rounded-full transition-colors relative ${settings.hapticEnabled ? 'bg-indigo-600' : 'bg-slate-700'}`}>
                      <motion.div animate={{ x: settings.hapticEnabled ? 24 : 0 }} className="w-4 h-4 bg-white rounded-full m-1 shadow-sm" />
                    </button>
                  </div>
                </div>
                <div className="pt-2">
                  <div className="flex justify-between text-xs font-bold mb-2 uppercase opacity-40"><span>{t.precision}</span><span>{settings.precision} {t.places}</span></div>
                  <input type="range" min="0" max="8" value={settings.precision} onChange={e => updateSetting('precision', parseInt(e.target.value))} className="w-full h-1 bg-indigo-500/20 rounded-lg appearance-none cursor-pointer accent-indigo-500" />
                </div>
              </section>
            </div>
          )}

          {activeMode === 'about' && (
            <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 h-full">
              <Logo size={80} className="shadow-2xl rounded-[28px]" />
              <div>
                <h2 className="text-3xl font-black tracking-tighter">NovaCalc AI</h2>
                <p className="text-indigo-500 font-bold uppercase tracking-[0.3em] text-[10px] mt-1">v3.2.0 {t.version}</p>
              </div>
              <div className={`p-6 rounded-[32px] border w-full space-y-3 text-left ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={18} /><span className="text-sm font-semibold">Native Engine Precision</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={18} /><span className="text-sm font-semibold">Glassmorphism Personality</span></div>
                <div className="flex items-center gap-3"><CheckCircle2 className="text-green-500" size={18} /><span className="text-sm font-semibold">Gemini 3 Cognitive Assist</span></div>
              </div>
              <div className="pt-4">
                <p className={`text-xs font-bold uppercase tracking-widest ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
                  {t.developedBy} <span className="text-indigo-500">Koushik Saha</span>
                </p>
              </div>
              <div className="flex gap-4 opacity-40">
                <Github size={20} className="hover:text-indigo-500 cursor-pointer" /><Heart size={20} className="hover:text-pink-500 cursor-pointer" /><Info size={20} className="hover:text-indigo-500 cursor-pointer" />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
};
