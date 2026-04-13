import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Trash2, StopCircle, ArrowUp, Eraser, Lightbulb, GraduationCap, Scale, Search } from 'lucide-react';
import { chatWithLegalAI } from '../services/geminiService';
import { ChatMessage } from '../types';

const SUGGESTIONS = [
  { text: "ما الفرق بين الباطل والفاسد في العقود؟", icon: <Scale className="w-5 h-5 text-indigo-500" />, label: "قانون مدني" },
  { text: "شرح أركان القرار الإداري وعيوبه", icon: <Bot className="w-5 h-5 text-emerald-500" />, label: "قانون إداري" },
  { text: "كيفية إعداد خطة بحث مذكرة تخرج", icon: <GraduationCap className="w-5 h-5 text-purple-500" />, label: "منهجية" },
  { text: "الفرق بين الجناية والجنحة والمخالفة", icon: <Search className="w-5 h-5 text-amber-500" />, label: "قانون جنائي" },
];

const AIAssistant: React.FC = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
    setLoading(true);

    const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const responseText = await chatWithLegalAI(userMsg.text, history);

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, botMsg]);
    setLoading(false);
  };

  const handleClearChat = () => {
    setMessages([]);
  };

  const renderMessageContent = (text: string) => {
    const parts = [];
    let lastIndex = 0;
    const regex = /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g;
    let match;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      parts.push(
        <a 
          key={match.index} 
          href={match[2]} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-primary hover:text-primary-light underline font-bold mx-1"
        >
          {match[1]}
        </a>
      );
      lastIndex = regex.lastIndex;
    }
    
    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white dark:bg-slate-950 relative">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 scroll-smooth custom-scrollbar">
        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
          
          {messages.length === 0 ? (
             /* Empty State */
             <div className="flex-1 flex flex-col items-center justify-center text-center space-y-8 py-10 animate-fade-in-up">
                <div className="relative">
                    <div className="w-24 h-24 bg-gradient-to-tr from-primary/10 to-indigo-100 dark:from-primary/20 dark:to-slate-800 rounded-3xl flex items-center justify-center shadow-lg transform rotate-3 transition hover:rotate-6">
                        <Sparkles className="w-12 h-12 text-primary" />
                    </div>
                    <div className="absolute -bottom-2 -right-2 bg-white dark:bg-slate-800 p-2 rounded-full shadow-md">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-800 dark:text-white">مرحباً بك في DZ LAW AI</h2>
                    <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto text-lg">
                        رفيقك الذكي لاستيعاب الدروس، حل القضايا، والبحث في النصوص القانونية الجزائرية.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-2xl px-2">
                    {SUGGESTIONS.map((s, idx) => (
                    <button 
                        key={idx}
                        onClick={() => handleSend(s.text)}
                        className="group bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-primary/50 dark:hover:border-primary/50 transition-all text-right flex flex-col gap-3 shadow-sm hover:shadow-md"
                    >
                        <div className="flex justify-between items-start w-full">
                            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg group-hover:scale-110 transition-transform">
                                {s.icon}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                {s.label}
                            </span>
                        </div>
                        <span className="font-bold text-slate-700 dark:text-slate-200 text-sm">{s.text}</span>
                    </button>
                    ))}
                </div>
             </div>
          ) : (
            /* Chat Messages */
            <div className="space-y-6 pb-4">
                {/* Header Actions within scroll area */}
                <div className="flex justify-between items-center mb-8 sticky top-0 z-10 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md py-2 border-b border-slate-100 dark:border-slate-900">
                    <span className="text-sm font-bold text-slate-400">جلسة جديدة</span>
                    <button 
                        onClick={handleClearChat} 
                        className="text-xs flex items-center gap-1 text-slate-400 hover:text-red-500 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full transition-colors"
                    >
                        <Trash2 className="w-3 h-3" /> مسح المحادثة
                    </button>
                </div>

                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} group`}>
                    <div className={`flex gap-4 max-w-[90%] md:max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                        
                        {/* Avatar */}
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-slate-200 dark:bg-slate-800 text-slate-600' 
                            : 'bg-gradient-to-br from-primary to-indigo-600 text-white'
                        }`}>
                            {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
                        </div>

                        {/* Bubble */}
                        <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-5 py-3.5 text-sm md:text-base leading-loose shadow-sm ${
                                msg.role === 'user' 
                                    ? 'bg-primary text-white rounded-2xl rounded-tl-none' 
                                    : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 rounded-2xl rounded-tr-none'
                            }`}>
                                <div className="whitespace-pre-wrap">
                                    {renderMessageContent(msg.text)}
                                </div>
                            </div>
                            
                            {/* Timestamp/Status */}
                            <span className="text-[10px] text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity px-1">
                                {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </div>
                    </div>
                    </div>
                ))}
                
                {/* Loading State */}
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4 max-w-[80%]">
                            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 text-white flex items-center justify-center flex-shrink-0 mt-1">
                                    <Bot className="w-5 h-5" />
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-900 px-5 py-4 rounded-2xl rounded-tr-none border border-slate-100 dark:border-slate-800 flex items-center gap-2 shadow-sm">
                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-100"></span>
                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce delay-200"></span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-slate-950 p-4 border-t border-slate-100 dark:border-slate-900 z-20">
        <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2 rounded-3xl shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all">
                
                {/* Tool Button (Placeholder for future features) */}
                <button className="p-3 text-slate-400 hover:text-primary hover:bg-white dark:hover:bg-slate-800 rounded-full transition flex-shrink-0" title="إرفاق ملف (قريباً)">
                    <Eraser className="w-5 h-5" />
                </button>
                
                <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                        }
                    }}
                    placeholder="اطرح سؤالك القانوني هنا..."
                    className="flex-1 bg-transparent border-0 py-3.5 px-2 focus:outline-none focus:ring-0 text-slate-800 dark:text-white placeholder:text-slate-400 resize-none max-h-32 min-h-[52px]"
                    rows={1}
                />
                
                <button 
                    onClick={() => handleSend()}
                    disabled={loading || !input.trim()}
                    className={`p-3 rounded-2xl transition-all flex-shrink-0 mb-0.5 ${
                        loading || !input.trim() 
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                        : 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/30 transform hover:scale-105 active:scale-95'
                    }`}
                >
                    {loading ? <StopCircle className="w-5 h-5 animate-pulse" /> : <ArrowUp className="w-5 h-5" />}
                </button>
            </div>
            <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                 DZ LAW HUB AI يمكن أن يرتكب أخطاء. يرجى مراجعة المعلومات المهمة.
            </p>
        </div>
      </div>

    </div>
  );
};

export default AIAssistant;