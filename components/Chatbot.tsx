
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from '@google/genai';
import { AppLanguage } from '../types';
import { getSystemInstruction } from '../services/geminiService';

import { translations } from '../translations';

interface ChatbotProps {
  language: AppLanguage;
}

const Chatbot: React.FC<ChatbotProps> = ({ language }) => {
  const t = translations[language];
  const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'ai', text: t.chatbotGreeting }]);
  }, [language, t.chatbotGreeting]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSendText = async () => {
    if (!inputText.trim()) return;
    const userMsg = inputText;
    setInputText('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      if (!process.env.GEMINI_API_KEY) {
        setMessages(prev => [...prev, { role: 'ai', text: t.chatbotError }]);
        return;
      }
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      // Build history for context
      const history = messages.map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [...history, { role: 'user', parts: [{ text: userMsg }] }],
        config: { systemInstruction: getSystemInstruction(language) }
      });
      const aiText = response.text || t.serviceUnavailable;
      setMessages(prev => [...prev, { role: 'ai', text: aiText }]);
    } catch (err: any) {
      const isQuota = err?.message?.includes('429');
      setMessages(prev => [...prev, { role: 'ai', text: isQuota ? t.quotaExceeded : t.chatbotError }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white shadow-2xl">
      <div className="p-6 bg-green-600 text-white flex justify-between items-center shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center animate-pulse"><i className="fas fa-microchip"></i></div>
          <h4 className="font-black text-sm uppercase tracking-widest">{t.assistant}</h4>
        </div>
        <div className="text-[10px] bg-black/20 px-3 py-1 rounded-full font-black uppercase tracking-widest">{language}</div>
      </div>

      <div ref={scrollRef} className="flex-grow p-6 overflow-y-auto space-y-4 bg-gray-50/50">
        {messages.map((m, idx) => (
          <div key={idx} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-3xl shadow-sm text-sm font-medium ${
              m.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none'
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {isTyping && <div className="text-[10px] text-gray-400 font-black tracking-[0.2em] ml-2">{t.analyzing}</div>}
      </div>

      <div className="p-4 bg-white border-t border-gray-100 flex items-center gap-2">
        <div className="flex-grow relative">
          <input 
            className="w-full bg-gray-100 p-4 rounded-3xl text-sm outline-none border focus:border-green-300 pr-14 font-medium" 
            placeholder={t.chatbotPlaceholder}
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendText()}
          />
          <button onClick={handleSendText} className="absolute right-2 top-2 w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center shadow-md">
            <i className="fas fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
