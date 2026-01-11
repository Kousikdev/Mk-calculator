import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Image as ImageIcon, Sparkles, Brain, Search, Loader2 } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ThemeMode } from '../types';

interface AiAssistantProps {
  theme: ThemeMode;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ theme }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'ai', content: string, type?: 'thinking' | 'search'}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDark = theme === 'dark';

  const handleSend = async (thinking = false) => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setInput('');
    setLoading(true);

    let aiResponse = "";
    try {
      if (thinking) {
        aiResponse = await geminiService.chatWithThinking(userMsg);
      } else if (userMsg.toLowerCase().includes('search') || userMsg.toLowerCase().includes('latest')) {
        const searchRes = await geminiService.searchMarketInfo(userMsg);
        aiResponse = searchRes.text;
      } else {
        aiResponse = await geminiService.fastResponse(userMsg);
      }
    } catch (e) {
      aiResponse = "I'm having trouble connecting right now.";
    }

    setMessages(prev => [...prev, { role: 'ai', content: aiResponse, type: thinking ? 'thinking' : undefined }]);
    setLoading(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setMessages(prev => [...prev, { role: 'user', content: "Analyzing math from uploaded image..." }]);
      setLoading(true);
      const res = await geminiService.analyzeMathImage(base64);
      setMessages(prev => [...prev, { role: 'ai', content: res }]);
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-4 px-2">
        <Sparkles className="text-indigo-500 w-5 h-5" />
        <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Nova AI</h2>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 scrollbar-thin">
        {messages.length === 0 && (
          <div className={`text-center mt-10 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            <Brain className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p className="text-sm">Ask me to solve complex math, check market rates, or analyze an image!</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] p-3 rounded-2xl ${
                m.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : isDark 
                    ? 'bg-white/5 border border-white/10 text-white/90' 
                    : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}>
                {m.type === 'thinking' && <div className="text-[10px] uppercase tracking-widest text-indigo-400 mb-1 font-bold">Thought Engine</div>}
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{m.content}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {loading && (
          <div className="flex justify-start">
            <div className={`p-3 rounded-2xl flex items-center gap-2 ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
              <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              <span className={`text-sm italic ${isDark ? 'text-white/40' : 'text-slate-500'}`}>Processing...</span>
            </div>
          </div>
        )}
      </div>

      <div className="relative">
        <div className={`flex items-center gap-2 border rounded-2xl p-1 px-2 focus-within:border-indigo-500 transition-all ${
          isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            className={`p-2 rounded-xl transition-colors ${isDark ? 'hover:bg-white/10 text-white/60' : 'hover:bg-slate-100 text-slate-400'}`}
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Nova..."
            className={`flex-1 bg-transparent border-none outline-none text-sm py-3 px-1 ${isDark ? 'text-white' : 'text-slate-900'}`}
          />
          <div className="flex items-center gap-1">
            <button 
              onClick={() => handleSend(true)}
              title="Reason with Thinking Mode"
              className={`p-2 rounded-xl transition-colors text-indigo-500 ${isDark ? 'hover:bg-indigo-500/20' : 'hover:bg-indigo-50'}`}
            >
              <Brain className="w-5 h-5" />
            </button>
            <button 
              onClick={() => handleSend()}
              className="p-2 bg-indigo-600 rounded-xl text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;