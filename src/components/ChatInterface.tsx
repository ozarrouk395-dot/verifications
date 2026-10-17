import React, { useState } from 'react';
import { Send, Bot, User, Sparkles, Database } from 'lucide-react';
import { motion } from 'motion/react';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  source?: string;
}

// Custom Markdown to HTML Renderer supporting bold text, lists, and horizontally scrollable tables in dark/neon style
export const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inTable = false;
  let tableHeader: string[] = [];
  let tableRows: string[][] = [];
  let keyCounter = 0;

  const flushTable = () => {
    if (inTable && tableHeader.length > 0) {
      elements.push(
        <div key={`table-${keyCounter++}`} className="my-3 overflow-x-auto rounded-2xl border border-white/10 shadow-lg bg-slate-900/90">
          <table className="w-full text-xs text-right border-collapse min-w-[480px]">
            <thead>
              <tr className="bg-emerald-950/80 text-emerald-300 font-bold border-b border-emerald-500/20">
                {tableHeader.map((th, i) => (
                  <th key={i} className="p-3 whitespace-nowrap text-right font-readex">
                    {renderInlineFormatting(th)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {tableRows.map((row, rIndex) => (
                <tr key={rIndex} className={rIndex % 2 === 0 ? 'bg-slate-900/40 hover:bg-white/5' : 'bg-slate-950/60 hover:bg-white/5'}>
                  {row.map((cell, cIndex) => (
                    <td key={cIndex} className="p-3 whitespace-nowrap text-slate-200">
                      {renderInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      inTable = false;
      tableHeader = [];
      tableRows = [];
    }
  };

  const renderInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-emerald-300">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Markdown Table Row detection
    if (line.startsWith('|') && line.endsWith('|')) {
      const cells = line
        .split('|')
        .slice(1, -1)
        .map((c) => c.trim());

      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        continue;
      }

      if (!inTable) {
        inTable = true;
        tableHeader = cells;
      } else {
        tableRows.push(cells);
      }
      continue;
    }

    if (inTable) {
      flushTable();
    }

    if (!line) {
      elements.push(<div key={`br-${keyCounter++}`} className="h-2" />);
      continue;
    }

    // List item
    if (line.startsWith('- ') || line.startsWith('* ')) {
      elements.push(
        <div key={`li-${keyCounter++}`} className="flex items-start gap-2 my-1 text-slate-200">
          <span className="text-emerald-400 font-bold shrink-0 mt-0.5">•</span>
          <span>{renderInlineFormatting(line.slice(2))}</span>
        </div>
      );
      continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(line)) {
      elements.push(
        <div key={`num-${keyCounter++}`} className="flex items-start gap-2 my-1 text-slate-200">
          <span className="text-emerald-400 font-bold shrink-0">{line.match(/^\d+\./)?.[0]}</span>
          <span>{renderInlineFormatting(line.replace(/^\d+\.\s/, ''))}</span>
        </div>
      );
      continue;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${keyCounter++}`} className="my-1 text-slate-200 leading-relaxed">
        {renderInlineFormatting(line)}
      </p>
    );
  }

  if (inTable) {
    flushTable();
  }

  return <div className="space-y-1">{elements}</div>;
};

export const ChatInterface: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'مرحباً بك! أنا مساعدك الذكي المعتمد حصرياً على مراجع Google Drive لتحديد الأسعار الرسمية (جملة وتجزئة)، وفحص أصالة المنتجات، وتسجيل البلاغات. كيف يمكنني مساعدتك؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    const currentQuery = input;
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQuery,
          history: messages.slice(-4).map((m) => ({ role: m.sender, text: m.text })),
        }),
      });

      if (!response.ok) {
        throw new Error('فشل جلب الإجابة من الخادم');
      }

      const data = await response.json();
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: data.text || 'لم أجد هذا المنتج في ملفاتك.',
        source: data.source ? `المصدر: ${data.source}` : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error(err);
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'عذراً، حدث خطأ أثناء الاتصال بقاعدة المعرفة أو معالجة الطلب.',
        source: 'خطأ في الاتصال',
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-170px)] max-w-2xl mx-auto glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
      {/* 3D Header Banner */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-slate-900 text-white flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Sparkles className="w-4 h-4 text-emerald-300" />
          </div>
          <div>
            <h2 className="text-xs font-bold font-readex tracking-tight">المساعد الذكي (Drive RAG Engine)</h2>
            <p className="text-[10px] text-emerald-200/80 font-mono">إجابات موثقة 100% من ملفاتك</p>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Messages list with Spring animations & 3D bubbles */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`flex items-start gap-2.5 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* 3D Avatar */}
            <div
              className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 border shadow-md ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 border-emerald-300/30 text-white shadow-emerald-500/20'
                  : 'bg-slate-800 border-white/10 text-emerald-400 shadow-black/40'
              }`}
            >
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble with layered glass depth */}
            <div
              className={`max-w-[85%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed overflow-hidden border shadow-lg ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-br-xs border-emerald-400/30 shadow-emerald-600/20'
                  : 'bg-slate-900/80 text-slate-200 rounded-bl-xs border-white/10 shadow-black/30'
              }`}
            >
              {msg.sender === 'assistant' ? (
                <MarkdownRenderer content={msg.text} />
              ) : (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              )}

              {msg.source && (
                <div className="mt-3 pt-2.5 border-t border-white/10 text-[10px] text-slate-400 font-medium flex items-center gap-1.5 font-mono">
                  <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{msg.source}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* 3D Bouncing Balls Indicator */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 flex-row"
          >
            <div className="w-9 h-9 rounded-2xl bg-slate-800 border border-white/10 text-emerald-400 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-900/80 border border-white/10 rounded-3xl rounded-bl-xs p-4 max-w-[80%] space-y-2.5 shadow-lg">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-bounce shadow-[0_0_8px_#34d399]" style={{ animationDelay: '0ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-bounce shadow-[0_0_8px_#2dd4bf]" style={{ animationDelay: '150ms' }} />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-bounce shadow-[0_0_8px_#fbbf24]" style={{ animationDelay: '300ms' }} />
                <span className="text-[11px] text-slate-400 mr-2 font-medium">جاري البحث في ملفات Drive وجداول الأسعار...</span>
              </div>
              <div className="h-2.5 w-48 bg-slate-800 rounded-full animate-pulse" />
              <div className="h-2.5 w-32 bg-slate-800 rounded-full animate-pulse" />
            </div>
          </motion.div>
        )}
      </div>

      {/* Floating 3D Input Area */}
      <div className="p-3 bg-slate-950/60 border-t border-white/10">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اسأل عن فئة (مثل: أسعار السميد بكل أنواعه) أو منتج معين..."
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-2xl px-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all text-right shadow-inner"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="btn-3d btn-3d-neon disabled:opacity-50 text-white p-3 rounded-2xl transition-all flex items-center justify-center shrink-0"
          >
            <Send className="w-4 h-4 rotate-180" />
          </button>
        </form>
      </div>
    </div>
  );
};
