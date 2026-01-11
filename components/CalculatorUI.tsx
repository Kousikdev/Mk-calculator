import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Delete, Divide, X, Minus, Plus, Equal, Percent, XCircle, Clock, Trash2 } from 'lucide-react';
import { CalcLayout, ButtonSize, ButtonShape, CalculationHistory, ThemeMode } from '../types';
import { playClickSound } from '../services/audioService';

interface CalculatorUIProps {
  onCalculate: (expr: string, res: string) => void;
  themeColor: string;
  layout: CalcLayout;
  buttonSize: ButtonSize;
  buttonShape: ButtonShape;
  precision: number;
  history: CalculationHistory[];
  onClearHistory: () => void;
  soundEnabled: boolean;
  theme: ThemeMode;
}

const CalculatorUI: React.FC<CalculatorUIProps> = ({ 
  onCalculate, 
  themeColor, 
  layout, 
  buttonSize, 
  buttonShape,
  precision,
  history,
  onClearHistory,
  soundEnabled,
  theme
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const isDark = theme === 'dark';

  const SYMBOL_DIVIDE = '\u00F7';
  const SYMBOL_MULTIPLY = '\u00D7';

  const handleClick = (action: () => void) => {
    playClickSound(soundEnabled);
    action();
  };

  const formatDisplay = (val: string) => {
    if (val === 'Error' || val === 'Infinity' || val === '-Infinity' || val === 'NaN') return val;
    if (val.endsWith('.')) {
      const parts = val.split('.');
      return Number(parts[0]).toLocaleString() + '.';
    }
    const parts = val.split('.');
    const formattedInt = Number(parts[0]).toLocaleString();
    return parts.length > 1 ? `${formattedInt}.${parts[1]}` : formattedInt;
  };

  const handleNumber = (num: string) => {
    if (display === 'Error' || display === 'Infinity') {
      setDisplay(num === '.' ? '0.' : num);
      return;
    }
    if (num === '.' && display.includes('.')) return;
    setDisplay(prev => (prev === '0' && num !== '.' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    if (display === 'Error' || display === 'Infinity') return;
    
    // If percent is pressed alone, we treat it as an operator that can be applied to the current number
    if (op === '%') {
      if (equation === '') {
        // Single number percentage e.g. "50%" -> 0.5
        const val = parseFloat(display);
        const res = String(val / 100);
        setDisplay(res);
        return;
      }
    }

    if (equation && display === '0') {
      setEquation(prev => {
        const trimmed = prev.trim();
        const lastChar = trimmed.slice(-1);
        if (['+', '-', SYMBOL_MULTIPLY, SYMBOL_DIVIDE, '%', '^'].includes(lastChar)) {
          return trimmed.slice(0, -1) + op + ' ';
        }
        return prev;
      });
      return;
    }

    setEquation(prev => prev + display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleConstant = (name: 'PI' | 'E') => {
    const val = name === 'PI' ? Math.PI : Math.E;
    setDisplay(String(val));
  };

  const toggleSign = () => {
    if (display === '0' || display === 'Error') return;
    setDisplay(prev => (prev.startsWith('-') ? prev.slice(1) : '-' + prev));
  };

  const factorial = (n: number): number => {
    if (n < 0) return 0;
    if (n === 0) return 1;
    let res = 1;
    for (let i = 2; i <= n; i++) res *= i;
    return res;
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      if (isNaN(val)) return;

      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case 'asin': res = Math.asin(val); break;
        case 'acos': res = Math.acos(val); break;
        case 'atan': res = Math.atan(val); break;
        case 'log': 
          if (val <= 0) throw new Error("Invalid");
          res = Math.log10(val); 
          break;
        case 'ln': 
          if (val <= 0) throw new Error("Invalid");
          res = Math.log(val); 
          break;
        case 'sqrt': 
          if (val < 0) throw new Error("Invalid");
          res = Math.sqrt(val); 
          break;
        case 'cbrt': res = Math.cbrt(val); break;
        case 'abs': res = Math.abs(val); break;
        case 'recip': 
          if (val === 0) throw new Error("Div0");
          res = 1 / val; 
          break;
        case 'sq': res = Math.pow(val, 2); break;
        case 'fact': 
          if (!Number.isInteger(val) || val < 0 || val > 170) throw new Error("Invalid");
          res = factorial(val);
          break;
        default: return;
      }
      
      const finalResult = String(Number(res.toFixed(precision)));
      setDisplay(finalResult);
      onCalculate(`${func}(${val})`, finalResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const calculate = () => {
    try {
      if (!equation && (display === '0' || display === 'Error')) return;
      
      let fullExpr = (equation + display).trim();
      if (fullExpr.match(/[\u00F7\u00D7\-+%\^\s]$/)) return;

      // Handle Calculator Percentage logic:
      // Case 1: "A + B %" -> A + (A * B / 100)
      // Case 2: "A - B %" -> A - (A * B / 100)
      // Case 3: "A * B %" -> A * (B / 100)
      // Case 4: "A / B %" -> A / (B / 100)
      
      const percentRegex = /(-?\d+\.?\d*)\s*([\+\-\u00D7\u00F7])\s*(-?\d+\.?\d*)\s*%/;
      let match = fullExpr.match(percentRegex);
      
      let processedExpr = fullExpr;
      if (match) {
        const a = parseFloat(match[1]);
        const op = match[2];
        const b = parseFloat(match[3]);
        
        if (op === '+') {
          processedExpr = String(a + (a * b / 100));
        } else if (op === '-') {
          processedExpr = String(a - (a * b / 100));
        } else if (op === SYMBOL_MULTIPLY) {
          processedExpr = String(a * (b / 100));
        } else if (op === SYMBOL_DIVIDE) {
          processedExpr = String(a / (b / 100));
        }
      } else {
        // Fallback to standard eval if no complex percentage pattern
        processedExpr = fullExpr
          .replace(new RegExp(SYMBOL_MULTIPLY, 'g'), '*')
          .replace(new RegExp(SYMBOL_DIVIDE, 'g'), '/')
          .replace(/%/g, '/100') // Basic replacement for simple "X%"
          .replace(/\^/g, '**');
      }

      if (processedExpr.includes('/ 0') && !processedExpr.includes('/ 0.')) {
        setDisplay('Error');
        setEquation('');
        return;
      }

      const result = new Function(`'use strict'; return (${processedExpr})`)();
      
      if (!isFinite(result)) {
        setDisplay('Infinity');
      } else {
        const finalResult = String(Number(result.toFixed(precision)));
        setDisplay(finalResult);
        onCalculate(fullExpr, finalResult);
      }
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    if (display === 'Error' || display === 'Infinity') {
      setDisplay('0');
      return;
    }
    setDisplay(prev => (prev.length > 1 && !(prev.length === 2 && prev.startsWith('-'))) ? prev.slice(0, -1) : '0');
  };

  const recallHistory = (item: CalculationHistory) => {
    setDisplay(item.result);
    setEquation('');
    setShowHistory(false);
  };

  const sizeClasses = {
    sm: 'h-9 text-[10px]',
    md: 'h-12 text-sm',
    lg: 'h-16 text-lg'
  };

  const shapeClasses = {
    circle: 'rounded-full',
    squircle: 'rounded-2xl',
    rounded: 'rounded-lg',
    sharp: 'rounded-none'
  };

  const Button = ({ children, onClick, className = '', highlight = false, isSci = false }: any) => (
    <motion.button
      whileTap={{ 
        scale: 0.96, 
        transition: { type: "spring", stiffness: 600, damping: 20 }
      }}
      onClick={() => handleClick(onClick)}
      className={`${sizeClasses[buttonSize]} ${shapeClasses[buttonShape]} w-full flex items-center justify-center font-bold transition-all relative overflow-hidden ${
        highlight 
          ? `text-white shadow-lg` 
          : isDark 
            ? `${isSci ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/10' : 'bg-white/5 text-white border-white/5'} hover:bg-white/10 border` 
            : `${isSci ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-white text-slate-900 border-slate-200'} hover:bg-slate-50 border shadow-sm`
      } ${className}`}
      style={highlight ? { backgroundColor: themeColor, boxShadow: `0 8px 12px -3px ${themeColor}33` } : {}}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="w-full h-full flex flex-col p-3 overflow-hidden relative">
      <div className="flex justify-between items-center mb-1 px-2">
        <button 
          onClick={() => handleClick(() => setShowHistory(true))}
          className={`p-2 rounded-full transition-colors group ${isDark ? 'hover:bg-white/5' : 'hover:bg-slate-200'}`}
          title="History"
        >
          <History className={`w-5 h-5 group-hover:text-indigo-500 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
        </button>
        <div className={`text-[9px] font-bold tracking-widest uppercase ${isDark ? 'text-white/20' : 'text-slate-400'}`}>
          {layout} Core 3.1
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-end items-end p-4 mb-2">
        <div 
          className={`text-sm mb-1 h-6 overflow-hidden text-right w-full font-medium transition-opacity ${isDark ? 'text-white/30' : 'text-slate-400'} ${equation ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="truncate direction-rtl text-right">
             {equation.split(' ').map(part => (!isNaN(Number(part)) ? Number(part).toLocaleString() : part)).join(' ')}
          </div>
        </div>
        <div 
          className={`font-bold tracking-tight truncate w-full text-right transition-all duration-300 ${isDark ? 'text-white' : 'text-slate-900'} ${display.length > 12 ? 'text-xl' : display.length > 8 ? 'text-3xl' : 'text-5xl'}`}
        >
          {formatDisplay(display)}
        </div>
      </div>

      <div className={`grid ${layout === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'} gap-1.5 pb-2`}>
        {layout === 'scientific' && (
          <>
            <Button isSci onClick={() => handleScientific('asin')}>sin⁻¹</Button>
            <Button isSci onClick={() => handleScientific('acos')}>cos⁻¹</Button>
            <Button isSci onClick={() => handleScientific('atan')}>tan⁻¹</Button>
            <Button isSci onClick={() => handleConstant('PI')}>π</Button>
            <Button isSci onClick={() => handleConstant('E')}>e</Button>

            <Button isSci onClick={() => handleScientific('sin')}>sin</Button>
            <Button isSci onClick={() => handleScientific('cos')}>cos</Button>
            <Button isSci onClick={() => handleScientific('tan')}>tan</Button>
            <Button isSci onClick={() => handleScientific('fact')}>x!</Button>
            <Button isSci onClick={() => handleOperator('^')}>xʸ</Button>
            
            <Button isSci onClick={() => handleScientific('log')}>log</Button>
            <Button isSci onClick={() => handleScientific('ln')}>ln</Button>
            <Button isSci onClick={() => handleScientific('abs')}>|x|</Button>
            <Button isSci onClick={() => handleScientific('recip')}>1/x</Button>
            <Button isSci onClick={() => handleScientific('cbrt')}>∛</Button>
          </>
        )}

        <Button onClick={clear} className="text-orange-500">AC</Button>
        <Button onClick={deleteLast}><Delete className="w-4 h-4 text-orange-500" /></Button>
        <Button onClick={() => handleOperator('%')}><Percent className="w-4 h-4" /></Button>
        <Button onClick={() => handleOperator(SYMBOL_DIVIDE)} className="text-indigo-500"><Divide className="w-5 h-5" /></Button>

        <Button onClick={() => handleNumber('7')}>7</Button>
        <Button onClick={() => handleNumber('8')}>8</Button>
        <Button onClick={() => handleNumber('9')}>9</Button>
        <Button onClick={() => handleOperator(SYMBOL_MULTIPLY)} className="text-indigo-500"><X className="w-5 h-5" /></Button>

        <Button onClick={() => handleNumber('4')}>4</Button>
        <Button onClick={() => handleNumber('5')}>5</Button>
        <Button onClick={() => handleNumber('6')}>6</Button>
        <Button onClick={() => handleOperator('-')} className="text-indigo-500"><Minus className="w-5 h-5" /></Button>

        <Button onClick={() => handleNumber('1')}>1</Button>
        <Button onClick={() => handleNumber('2')}>2</Button>
        <Button onClick={() => handleNumber('3')}>3</Button>
        <Button onClick={() => handleOperator('+')} className="text-indigo-500"><Plus className="w-5 h-5" /></Button>

        <Button onClick={toggleSign} className={`text-xs ${isDark ? "text-white/60" : "text-slate-500"}`}>+/-</Button>
        <Button onClick={() => handleNumber('0')}>0</Button>
        <Button onClick={() => handleNumber('.')}>.</Button>
        <Button onClick={calculate} highlight={true}><Equal className="w-6 h-6" /></Button>

        {layout === 'scientific' && (
          <>
             <Button isSci onClick={() => handleScientific('sqrt')}>√</Button>
             <Button isSci onClick={() => handleScientific('sq')}>x²</Button>
             <Button isSci onClick={() => handleNumber('(')} className={isDark ? "text-white/40" : "text-slate-400"}>(</Button>
             <Button isSci onClick={() => handleNumber(')')} className={isDark ? "text-white/40" : "text-slate-400"}>)</Button>
             <Button isSci onClick={() => handleOperator('^')} highlight={true} className="!bg-indigo-600">^</Button>
          </>
        )}
      </div>

      <AnimatePresence>
        {showHistory && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 flex flex-col"
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={`flex-1 flex flex-col transition-colors duration-300 ${isDark ? 'bg-black/90' : 'bg-white/95'} backdrop-blur-xl`}
            >
              <div className={`flex items-center justify-between p-6 border-b ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-indigo-500" />
                  <h2 className="text-xl font-bold">History</h2>
                </div>
                <button 
                  onClick={() => handleClick(() => setShowHistory(false))}
                  className={`p-2 rounded-full transition-colors ${isDark ? 'hover:bg-white/10' : 'hover:bg-slate-200'}`}
                >
                  <XCircle className={`w-6 h-6 ${isDark ? 'text-white/40' : 'text-slate-400'}`} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {history.length === 0 ? (
                  <div className={`h-full flex flex-col items-center justify-center ${isDark ? 'text-white/20' : 'text-slate-300'}`}>
                    <Clock className="w-12 h-12 mb-4 opacity-10" />
                    <p className="text-sm">History is empty</p>
                  </div>
                ) : (
                  history.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => handleClick(() => recallHistory(item))}
                      className={`w-full text-right p-5 rounded-2xl border transition-all group ${
                        isDark 
                          ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-indigo-500/30' 
                          : 'bg-white border-slate-200 hover:border-indigo-500/30 shadow-sm'
                      }`}
                    >
                      <div className={`text-xs mb-1 group-hover:text-indigo-500 truncate ${isDark ? 'text-white/30' : 'text-slate-400'}`}>
                        {item.expression}
                      </div>
                      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                        {formatDisplay(item.result)}
                      </div>
                    </button>
                  ))
                )}
              </div>

              {history.length > 0 && (
                <div className={`p-4 border-t ${isDark ? 'border-white/5' : 'border-slate-200'}`}>
                  <button 
                    onClick={() => handleClick(onClearHistory)}
                    className="w-full py-3 flex items-center justify-center gap-2 text-sm text-orange-500 hover:bg-orange-500/10 rounded-xl transition-colors font-semibold"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear All
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalculatorUI;