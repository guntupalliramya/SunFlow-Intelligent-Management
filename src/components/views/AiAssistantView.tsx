import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
  TrendingUp,
  AlertTriangle,
  Wrench,
  ShieldCheck,
} from 'lucide-react';
import { useSolar } from '../../context/SolarContext';
import { ChatMessage, sendAiChatMessage, AiRequestContext } from '../../services/aiService';

export const AiAssistantView: React.FC = () => {
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

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `### ☀️ Welcome to SunFlow AI Assistant, ${currentUser.name}!
I am your role-aware solar intelligence partner. I have real-time access to our CRM, site surveys, stock registers, serial numbers, and financial profitability reports.

How can I assist your operations today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputPrompt, setInputPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Role-tailored suggested quick prompt chips
  const suggestedPrompts = [
    'What is our total revenue, expenses, and project profit margin?',
    'Which solar inventory products are currently below safety stock levels?',
    'Troubleshooting steps for inverter fault code E01 (Grid Overvoltage)',
    'Summarize pending installations and crew assignments for this week',
    'Explain the PM Surya Ghar subsidy rules for 1kW, 2kW, and 3kW On-Grid systems',
    'Are there any unassigned customer enquiries waiting for site survey?',
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
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
      const responseText = await sendAiChatMessage([...messages, userMsg], context);

      const aiReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        role: 'assistant',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiReply]);
    } catch {
      const errorReply: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content:
          'I encountered a temporary communication issue. All business records in your ERP remain secure and intact. Please try your question again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'reset',
        role: 'assistant',
        content: `Conversation cleared. Ready for your next query, ${currentUser.name}!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Top Banner */}
      <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">SunFlow AI Copilot</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected to Database
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active User: <strong className="text-slate-200">{currentUser.name}</strong> • Role: <strong className="text-emerald-400 capitalize">{currentUser.role.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="px-3 py-1.5 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Clear Chat
        </button>
      </div>

      {/* Suggested Quick Prompt Chips */}
      <div className="p-3 bg-slate-50 border-b border-slate-200 flex gap-2 overflow-x-auto shrink-0 text-xs">
        <span className="text-slate-400 font-medium py-1 whitespace-nowrap pl-1">Suggested:</span>
        {suggestedPrompts.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(chip)}
            className="px-3 py-1 bg-white hover:bg-emerald-50 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 rounded-full border border-slate-200 whitespace-nowrap transition-all cursor-pointer shadow-2xs"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Message History Feed */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex gap-3 max-w-3xl ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === 'user'
                  ? 'bg-slate-900 text-white'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-700" />}
            </div>

            <div
              className={`rounded-2xl p-4 shadow-2xs relative group ${
                msg.role === 'user'
                  ? 'bg-emerald-700 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}
            >
              <div className="prose prose-xs max-w-none space-y-2 whitespace-pre-wrap leading-relaxed">
                {msg.content}
              </div>

              <div
                className={`flex items-center justify-between mt-2 pt-2 border-t text-[10px] ${
                  msg.role === 'user'
                    ? 'border-emerald-600/40 text-emerald-200'
                    : 'border-slate-200 text-slate-400'
                }`}
              >
                <span>{msg.timestamp}</span>
                <button
                  onClick={() => handleCopy(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-black/10 cursor-pointer"
                  title="Copy response"
                >
                  {copiedId === msg.id ? (
                    <Check className="w-3 h-3 text-emerald-500" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-slate-50 border border-slate-200 flex items-center gap-2 text-slate-500 text-xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
              <span className="ml-1 font-medium">Analyzing solar database & engineering guidelines...</span>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Input Box */}
      <div className="p-4 bg-white border-t border-slate-200 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2 max-w-4xl mx-auto"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask SunFlow AI Assistant as ${currentUser.name} (${currentUser.role.replace('_', ' ')})...`}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputPrompt.trim() || isLoading}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
            Send
          </button>
        </form>
      </div>
    </div>
  );
};
