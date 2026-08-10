"use client";

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageSquare, X, Send, Loader2, Mic, MicOff, Sparkles, ChevronRight, HelpCircle } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';
import { useRole } from '@/context/RoleContext';
import { API_BASE_URL } from '@/config';

// ─── Per-role quick action definitions ──────────────────────────────────────
const ROLE_CONFIG: Record<string, {
  title: string;
  subtitle: string;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  quickActions: { label: string; emoji: string; message: string }[];
  capabilities: string[];
}> = {
  Admin: {
    title: "Admin AI Assistant",
    subtitle: "Full System Access",
    color: "#6366f1",
    gradientFrom: "#4f46e5",
    gradientTo: "#7c3aed",
    quickActions: [
      { label: "View Clients", emoji: "👥", message: "Take me to the clients list" },
      { label: "New Lead", emoji: "🎯", message: "Take me to add a new lead" },
      { label: "Invoices", emoji: "🧾", message: "Open the invoices page" },
      { label: "Team", emoji: "🏢", message: "Show me the team directory" },
      { label: "Settings", emoji: "⚙️", message: "Open system settings" },
    ],
    capabilities: [
      "Create / edit / delete clients, leads, deals",
      "Manage invoices, quotes & billing",
      "View & manage team members",
      "Navigate to any page instantly",
      "Draft emails via AI email agent",
      "Manage inventory & catalog",
      "View reports & analytics",
    ],
  },
  SalesManager: {
    title: "Sales AI Assistant",
    subtitle: "Sales & Pipeline Management",
    color: "#10b981",
    gradientFrom: "#059669",
    gradientTo: "#0d9488",
    quickActions: [
      { label: "My Pipeline", emoji: "📊", message: "Take me to the sales pipeline" },
      { label: "Add Lead", emoji: "🎯", message: "Research a new lead for me" },
      { label: "Draft Email", emoji: "✉️", message: "Take me to the email agent" },
      { label: "Quotes", emoji: "📋", message: "Open the quotes & billing page" },
      { label: "Meetings", emoji: "📅", message: "Show me meetings" },
    ],
    capabilities: [
      "Manage clients & leads",
      "Create and manage deals in pipeline",
      "Draft and send outreach emails",
      "Create quotes & invoices",
      "Log calls & schedule meetings",
      "Navigate to sales pages",
    ],
  },
  Employee: {
    title: "Employee AI Assistant",
    subtitle: "Daily Work Helper",
    color: "#3b82f6",
    gradientFrom: "#2563eb",
    gradientTo: "#0891b2",
    quickActions: [
      { label: "My Tasks", emoji: "✅", message: "Show me my tasks" },
      { label: "Clients", emoji: "👥", message: "Take me to clients" },
      { label: "Log Call", emoji: "📞", message: "Take me to calls" },
      { label: "Meetings", emoji: "📅", message: "Open meetings" },
      { label: "Email Agent", emoji: "✉️", message: "Open the email agent" },
    ],
    capabilities: [
      "View and update client profiles",
      "Add notes to clients",
      "Manage tasks and to-dos",
      "Log calls and schedule meetings",
      "Draft emails for clients",
      "Navigate to daily work pages",
    ],
  },
  ProjectMember: {
    title: "Developer AI Assistant",
    subtitle: "Project & Task Management",
    color: "#8b5cf6",
    gradientFrom: "#7c3aed",
    gradientTo: "#a855f7",
    quickActions: [
      { label: "My Projects", emoji: "🗂️", message: "Show me my projects" },
      { label: "Kanban Board", emoji: "📌", message: "Take me to the kanban board" },
      { label: "Messages", emoji: "💬", message: "Open messages" },
      { label: "Tasks", emoji: "✅", message: "Show me my tasks" },
    ],
    capabilities: [
      "View and manage projects",
      "Navigate the Kanban board",
      "Update task/ticket status",
      "View assigned work items",
      "Send & receive messages",
    ],
  },
  Supplier: {
    title: "Supplier AI Assistant",
    subtitle: "Supplier Portal Support",
    color: "#f59e0b",
    gradientFrom: "#d97706",
    gradientTo: "#b45309",
    quickActions: [
      { label: "My RFQs", emoji: "📝", message: "Show me the RFQ requests for my portal" },
      { label: "Portal Help", emoji: "❓", message: "How do I use the supplier portal?" },
      { label: "Contact Admin", emoji: "📞", message: "I need to speak to an admin" },
    ],
    capabilities: [
      "View RFQ (Request for Quotation) requests",
      "Understand the supplier portal",
      "Get help navigating your portal",
      "Contact support when needed",
    ],
  },
  Demo: {
    title: "Demo AI Guide",
    subtitle: "CRM Feature Showcase",
    color: "#ec4899",
    gradientFrom: "#db2777",
    gradientTo: "#9333ea",
    quickActions: [
      { label: "Show Clients", emoji: "👥", message: "Show me the clients module" },
      { label: "Show Pipeline", emoji: "📊", message: "Show me the sales pipeline" },
      { label: "Show Billing", emoji: "💰", message: "Show me billing and invoices" },
      { label: "Show Projects", emoji: "🗂️", message: "Show me projects" },
      { label: "Show AI Email", emoji: "🤖", message: "Show me the AI email agent" },
    ],
    capabilities: [
      "Navigate to any module for demonstration",
      "Explain what each feature does",
      "Showcase the full CRM to prospects",
      "Note: Read-only in demo mode",
    ],
  },
};

const DEFAULT_CONFIG = ROLE_CONFIG["SalesManager"];

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showCapabilities, setShowCapabilities] = useState(false);
  const [messages, setMessages] = useState<{ role: 'bot' | 'user'; text: string; action?: string }[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [sessionId, setSessionId] = useState<string>('');
  const [liveChatStatus, setLiveChatStatus] = useState<'inactive' | 'pending' | 'active'>('inactive');
  const [initialized, setInitialized] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { role } = useRole();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const config = ROLE_CONFIG[role || ''] || DEFAULT_CONFIG;

  // ── Init: load session + history ──────────────────────────────────────────
  useEffect(() => {
    let stored = localStorage.getItem('chatbot_session_id');
    if (!stored) {
      stored = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('chatbot_session_id', stored);
    }
    setSessionId(stored);

    const greeting = getGreeting(role, pathname);

    fetch(`${API_BASE_URL}/chatbot/history/${stored}`)
      .then(res => res.json())
      .then(data => {
        if (data.ok && data.history && data.history.length > 0) {
          setMessages(data.history);
        } else {
          setMessages([{ role: 'bot', text: greeting }]);
        }
        setInitialized(true);
      })
      .catch(() => {
        setMessages([{ role: 'bot', text: greeting }]);
        setInitialized(true);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  // Live chat sync
  useEffect(() => {
    if (liveChatStatus === 'inactive' || !sessionId) return;
    const timer = setInterval(async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/chatbot/live-chat/${sessionId}/sync`);
        const data = await res.json();
        if (data.status === 'active' && liveChatStatus !== 'active') setLiveChatStatus('active');
        else if (data.status === 'ended') {
          setLiveChatStatus('inactive');
          setMessages(prev => [...prev, { role: 'bot', text: 'Live chat ended by the agent.' }]);
        }
        if (data.messages?.length > 0) {
          const adminMsgs = data.messages.filter((m: any) => m.sender === 'admin');
          setMessages(prev => {
            const localCount = prev.filter(m => m.role === 'bot' && m.action === 'live_chat').length;
            if (adminMsgs.length > localCount) {
              const newMsgs = adminMsgs.slice(localCount).map((m: any) => ({
                role: 'bot' as const, text: m.message, action: 'live_chat'
              }));
              return [...prev, ...newMsgs];
            }
            return prev;
          });
        }
      } catch (e) { /* ignore */ }
    }, 3000);
    return () => clearInterval(timer);
  }, [liveChatStatus, sessionId]);

  const handleCommand = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);
    try {
      if (liveChatStatus === 'active') {
        await fetch(`${API_BASE_URL}/chatbot/live-chat/${sessionId}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text })
        });
        return;
      }

      const res = await fetch(`${API_BASE_URL}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          current_route: pathname,
          chat_history: messages.map(m => `${m.role}: ${m.text}`).join('\n'),
          session_id: sessionId,
          user_role: role,
        })
      });
      const data = await res.json();

      setMessages(prev => [...prev, {
        role: 'bot',
        text: data.reply || "I've processed your request.",
        action: data.action_taken
      }]);

      if (data.action_taken === 'trigger_whatsapp') setLiveChatStatus('pending');
      if (data.action_taken === 'navigate' && data.route) {
        setTimeout(() => router.push(data.route), 1200);
      } else if (data.action_taken && data.action_taken !== 'trigger_whatsapp') {
        window.dispatchEvent(new Event('refresh-client-data'));
        window.dispatchEvent(new Event('refresh-marketplace-data'));
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: "Sorry, I couldn't process that right now. Please try again." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    handleCommand(input);
    setInput('');
  };

  const toggleListening = useCallback(() => {
    if (isListening) { setIsListening(false); return; }
    // @ts-ignore
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser."); return; }
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      setInput(prev => (prev ? prev + " " : "") + t);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognition.start();
  }, [isListening]);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000 }}>
      {/* Chat Window */}
      {isOpen && (
        <div
          style={{ width: '360px', height: '560px', position: 'relative', marginBottom: '12px' }}
          className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-zinc-700 flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div
            className="p-4 flex justify-between items-start shrink-0"
            style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
          >
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm shrink-0 relative">
                <Sparkles className="w-5 h-5 text-white" />
                <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white/40 ${liveChatStatus === 'active' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              </div>
              <div className="flex flex-col">
                <h3 className="font-bold text-white text-sm leading-tight">{config.title}</h3>
                <p className="text-[11px] text-white/80 font-medium">{config.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setShowCapabilities(v => !v)}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                title="What can I do?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Capabilities Panel */}
          {showCapabilities && (
            <div className="bg-slate-50 dark:bg-zinc-800 border-b border-slate-200 dark:border-zinc-700 p-3 shrink-0">
              <p className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider mb-2">💡 What I can do for you:</p>
              <ul className="space-y-1">
                {config.capabilities.map((cap, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-xs text-slate-600 dark:text-zinc-300">
                    <ChevronRight className="w-3 h-3 shrink-0 mt-0.5 text-indigo-500" />
                    {cap}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setShowCapabilities(false); handleCommand("What can you do for me on this page?"); }}
                className="mt-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Ask AI for personalized help →
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-slate-50 dark:bg-zinc-950 flex flex-col gap-3">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm shadow-md'
                      : 'bg-white dark:bg-zinc-900 text-slate-800 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700 shadow-sm rounded-tl-sm'
                  }`}
                  style={msg.role === 'user' ? { background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` } : {}}
                >
                  {msg.text}
                  {msg.action === 'trigger_whatsapp' && (
                    <a
                      href="https://wa.me/919502901416"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-3 block text-center bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-xl transition-colors shadow-sm text-xs"
                    >
                      💬 Chat on WhatsApp
                    </a>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 shadow-sm rounded-tl-sm flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" style={{ color: config.color }} />
                  <span className="text-sm text-slate-500 dark:text-zinc-400">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="px-3 py-2.5 bg-white dark:bg-zinc-900 shrink-0 border-t border-slate-100 dark:border-zinc-800">
            <div className="flex gap-2 overflow-x-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {config.quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => handleCommand(action.message)}
                  className="flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 bg-slate-50 dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 rounded-full border border-slate-200/80 dark:border-zinc-700 text-[11px] font-semibold text-slate-600 dark:text-zinc-300 transition-all hover:scale-105 active:scale-95 shadow-sm shrink-0"
                >
                  <span>{action.emoji}</span>
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="p-3 bg-slate-50 dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-700 flex gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-colors shadow-sm flex items-center justify-center shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white hover:bg-red-600 animate-pulse'
                  : 'bg-white dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700'
              }`}
              title={isListening ? "Stop" : "Voice input"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything..."
              className="flex-1 min-w-0 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="text-white p-2.5 rounded-xl transition-colors shadow-md shrink-0 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FAB */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="text-white p-4 rounded-full shadow-2xl hover:shadow-xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${config.gradientFrom}, ${config.gradientTo})` }}
          title="Open AI Assistant"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      )}
    </div>
  );
}

// ── Helper: context-aware greeting ──────────────────────────────────────────
function getGreeting(role: string | null, pathname: string | null): string {
  const page = pathname?.split('/').filter(Boolean).pop() || '';
  const pageLabel: Record<string, string> = {
    clients: 'Clients', leads: 'Leads', pipeline: 'Pipeline', invoices: 'Invoices',
    billing: 'Billing', inventory: 'Inventory', catalog: 'Catalog', projects: 'Projects',
    tasks: 'Tasks', meetings: 'Meetings', calls: 'Calls', 'email-agent': 'Email Agent',
    setup: 'Settings', team: 'Team', reports: 'Reports',
  };
  const current = pageLabel[page] || 'Dashboard';

  if (role === 'Admin') return `👋 Hello Admin! You're on the ${current} page. I have full system access — I can create, update, delete, and navigate anywhere. What would you like to do?`;
  if (role === 'SalesManager') return `👋 Hey! You're on ${current}. I can help with leads, pipeline, quotes, and emails. What do you need?`;
  if (role === 'Employee') return `👋 Hi! You're on ${current}. I'm here to help with your tasks, calls, clients, and meetings. How can I help?`;
  if (role === 'ProjectMember') return `👋 Hey! You're on ${current}. I can help you navigate projects and manage your kanban board. What's up?`;
  if (role === 'Supplier') return `👋 Welcome to the Supplier Portal! I can help you understand RFQ requests and navigate your portal. What do you need?`;
  if (role === 'Demo') return `👋 Welcome to the SERP Hawk CRM Demo! 🎉 Let me guide you through all the powerful features. Where would you like to start?`;
  return `👋 Hi! I'm your AI Assistant. How can I help you today?`;
}

