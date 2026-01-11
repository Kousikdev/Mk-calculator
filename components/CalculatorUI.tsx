
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Delete, Divide, X, Minus, Plus, Equal, Percent, FunctionSquare as Function } from 'lucide-react';
import { CalcLayout, ButtonSize } from '../types';

interface CalculatorUIProps {
  onCalculate: (expr: string, res: string) => void;
  themeColor: string;
  layout: CalcLayout;
  buttonSize: ButtonSize;
  precision: number;
}

const CalculatorUI: React.FC<CalculatorUIProps> = ({ onCalculate, themeColor, layout, buttonSize, precision }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(prev => (prev === '0' ? num : prev + num));
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleScientific = (func: string) => {
    try {
      const val = parseFloat(display);
      let res = 0;
      switch (func) {
        case 'sin': res = Math.sin(val); break;
        case 'cos': res = Math.cos(val); break;
        case 'tan': res = Math.tan(val); break;
        case 'log': res = Math.log10(val); break;
        case 'ln': res = Math.log(val); break;
        case 'sqrt': res = Math.sqrt(val); break;
        case 'sq': res = Math.pow(val, 2); break;
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
      const fullExpr = equation + display;
      // Note: In production, use a math library instead of eval
      const result = eval(fullExpr.replace(/x/g, '*').replace(/÷/g, '/'));
      const finalResult = String(Number(result.toFixed(precision)));
      setDisplay(finalResult);
      setEquation('');
      onCalculate(fullExpr, finalResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setEquation('');
  };

  const deleteLast = () => {
    setDisplay(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
  };

  const sizeClasses = {
    sm: 'h-12 text-base rounded-xl',
    md: 'h-16 text-xl rounded-2xl',
    lg: 'h-20 text-2xl rounded-3xl'
  };

  const Button = ({ children, onClick, className = '', highlight = false }: any) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`${sizeClasses[buttonSize]} w-full flex items-center justify-center font-medium transition-all ${
        highlight 
          ? `text-white shadow-lg` 
          : 'bg-white/5 hover:bg-white/10 text-white border border-white/5'
      } ${className}`}
      style={highlight ? { backgroundColor: themeColor, boxShadow: `0 10px 15px -3px ${themeColor}4D` } : {}}
    >
      {children}
    </motion.button>
  );

  return (
    <div className="w-full h-full flex flex-col p-4 overflow-y-auto">
      <div className="flex-none flex flex-col justify-end items-end p-4 mb-4">
        <div className="text-white/40 text-lg mb-1 h-8 overflow-hidden text-right w-full">{equation}</div>
        <div className="text-white text-5xl font-bold tracking-tighter truncate w-full text-right">
          {display}
        </div>
      </div>

      <div className={`grid ${layout === 'scientific' ? 'grid-cols-5' : 'grid-cols-4'} gap-2 pb-4`}>
        {/* Scientific Row - only visible if scientific */}
        {layout === 'scientific' && (
          <>
            <Button onClick={() => handleScientific('sin')} className="text-xs text-indigo-300">sin</Button>
            <Button onClick={() => handleScientific('cos')} className="text-xs text-indigo-300">cos</Button>
            <Button onClick={() => handleScientific('tan')} className="text-xs text-indigo-300">tan</Button>
            <Button onClick={() => handleScientific('log')} className="text-xs text-indigo-300">log</Button>
            <Button onClick={() => handleScientific('sqrt')} className="text-xs text-indigo-300">√</Button>
          </>
        )}

        <Button onClick={clear} className="text-orange-400">AC</Button>
        <Button onClick={deleteLast}><Delete className="w-5 h-5 text-orange-400" /></Button>
        <Button onClick={() => handleOperator('%')}><Percent className="w-5 h-5" /></Button>
        <Button onClick={() => handleOperator('÷')} className="text-indigo-400" highlight={false}><Divide /></Button>
        {layout === 'scientific' && <Button onClick={() => handleScientific('sq')} className="text-xs text-indigo-300">x²</Button>}

        <Button onClick={() => handleNumber('7')}>7</Button>
        <Button onClick={() => handleNumber('8')}>8</Button>
        <Button onClick={() => handleNumber('9')}>9</Button>
        <Button onClick={() => handleOperator('x')} className="text-indigo-400"><X /></Button>
        {layout === 'scientific' && <Button onClick={() => handleScientific('ln')} className="text-xs text-indigo-300">ln</Button>}

        <Button onClick={() => handleNumber('4')}>4</Button>
        <Button onClick={() => handleNumber('5')}>5</Button>
        <Button onClick={() => handleNumber('6')}>6</Button>
        <Button onClick={() => handleOperator('-')} className="text-indigo-400"><Minus /></Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber('(')} className="text-xs text-white/40">(</Button>}

        <Button onClick={() => handleNumber('1')}>1</Button>
        <Button onClick={() => handleNumber('2')}>2</Button>
        <Button onClick={() => handleNumber('3')}>3</Button>
        <Button onClick={() => handleOperator('+')} className="text-indigo-400"><Plus /></Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber(')')} className="text-xs text-white/40">)</Button>}

        <Button onClick={() => handleNumber('0')} className={layout === 'scientific' ? 'col-span-1' : 'col-span-2'}>0</Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber('3.14159')} className="text-xs text-indigo-300">π</Button>}
        <Button onClick={() => handleNumber('.')}>.</Button>
        <Button 
          onClick={calculate} 
          className="col-span-1"
          highlight={true}
        >
          <Equal />
        </Button>
        {layout === 'scientific' && <Button onClick={() => handleNumber('2.71828')} className="text-xs text-indigo-300">e</Button>}
      </div>
    </div>
  );
};

export default CalculatorUI;
