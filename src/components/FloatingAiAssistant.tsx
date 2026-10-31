import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  X,
  Send,
  Maximize2,
  Bot,
  User,
  ChevronDown,
  Minimize2,
} from 'lucide-react';
import { useSolar } from '../context/SolarContext';
import { ChatMessage, sendAiChatMessage, AiRequestContext } from '../services/aiService';

export const FloatingAiAssistant: React.FC = () => {
  const {
    currentUser,
    dashboardStats,
    customers,
    products,
    orders,
    installations,
    serviceTickets,
    warranties,
  } = useSolar();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'floating-intro',
      role: 'assistant',
      content: `Hello ${currentUser.name}! I am your floating SunFlow AI Assistant. Ask me anything about customer leads, inventory, pending installations, or inverter fault codes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `float-user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setIsLoading(true);

    const context: AiRequestContext = {
      user: currentUser,
      stats: {
        totalCustomers: dashboardStats.totalCustomers,
        newEnquiries: dashboardStats.newEnquiries,
        confirmedOrders: dashboardStats.confirmedOrders,
        installationsCompleted: dashboardStats.installationsCompleted,
        installationsPending: dashboardStats.installationsPending,
        totalRevenue: dashboardStats.totalRevenue,
        totalProfit: dashboardStats.totalProfit,
        lowStockCount: dashboardStats.lowStockProductsCount,
        openTicketsCount: dashboardStats.openServiceTicketsCount,
      },
      recentCustomers: customers,
      lowStockProducts: products.filter(
        (p) => p.category !== 'Installation Services' && p.stockQuantity <= p.minStockAlert
      ),
      pendingOrders: orders.filter((o) => o.status !== 'Completed' && o.status !== 'Cancelled'),
      activeInstallations: installations.filter(
        (i) => i.status === 'Scheduled' || i.status === 'In Progress'
      ),
      openTickets: serviceTickets.filter(
        (t) => t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress'
      ),
      warranties,
    };

    try {
      const reply = await sendAiChatMessage([...messages, userMsg], context);
      setMessages((prev) => [
        ...prev,
        {
          id: `float-reply-${Date.now()}`,
          role: 'assistant',
          content: reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `float-err-${Date.now()}`,
          role: 'assistant',
          content: 'Unable to reach AI service. Please verify network or try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-40">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="group flex items-center gap-2.5 px-4 py-3 bg-slate-900 hover:bg-emerald-700 text-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 cursor-pointer border border-emerald-500/40 animate-bounce hover:animate-none"
        >
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-slate-900 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-tight">SunFlow AI Copilot</span>
        </button>
      ) : (
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-96 max-w-[calc(100vw-2rem)] flex flex-col h-[520px] max-h-[80vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-white">SunFlow AI Assistant</h3>
                <p className="text-[10px] text-slate-400 capitalize">
                  {currentUser.role.replace('_', ' ')} Context
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs bg-slate-50/50">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2 max-w-[85%] ${m.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                    m.role === 'user' ? 'bg-slate-900 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {m.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3 text-emerald-700" />}
                </div>
                <div
                  className={`p-3 rounded-xl text-xs whitespace-pre-wrap leading-relaxed shadow-2xs ${
                    m.role === 'user'
                      ? 'bg-emerald-700 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-tl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 items-center text-slate-400 text-xs">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px]">Thinking...</span>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 bg-white border-t border-slate-100 flex gap-1.5 overflow-x-auto shrink-0 text-[11px]">
            <button
              onClick={() => handleSend('Financial overview & margin')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 whitespace-nowrap cursor-pointer"
            >
              📊 Revenue & Margin
            </button>
            <button
              onClick={() => handleSend('Show low stock products')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 whitespace-nowrap cursor-pointer"
            >
              ⚠️ Low Stock
            </button>
            <button
              onClick={() => handleSend('Troubleshoot fault E01')}
              className="px-2 py-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 whitespace-nowrap cursor-pointer"
            >
              ⚡ Fault Code E01
            </button>
          </div>

          {/* Input Form */}
          <div className="p-3 bg-white border-t border-slate-200 shrink-0">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex gap-1.5"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="Ask SunFlow AI Copilot..."
                className="flex-1 px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!inputPrompt.trim() || isLoading}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
