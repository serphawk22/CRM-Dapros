"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, Search, Filter, Server, Users, Database,
  ChevronLeft, ChevronRight, Eye, RefreshCw, X,
  Mail, Globe, Radar, UserPlus, ArrowLeft,
  BarChart2, Clock, TrendingUp, Layers, CheckCircle2
} from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useRole } from "@/context/RoleContext";

interface DemoAccount {
  id: number;
  email: string;
  name: string;
  created_at: string;
  tenant_id: number | null;
}

interface DemoDetail {
  user: { id: number; name: string; email: string; created_at: string };
  clients: Array<{ id: number; company: string; website: string; status: string; created_at: string }>;
  leads: Array<{ id: number; name: string; email: string; company: string; status: string; created_at: string }>;
  radar: Array<{ id: number; target_name: string; target_website: string; competitor_count: number; radius_km: number; run_date: string }>;
  emails: Array<{ id: number; to: string; subject: string; status: string; sent_at: string }>;
  limits: { clients: { usage: number; limit: number }; emails: { usage: number; limit: number }; searches: { usage: number; limit: number }; projects: { usage: number; limit: number } } | null;
}

interface AuditLog {
  id: number;
  user_email: string;
  user_name: string;
  table_name: string;
  record_id: number;
  action: string;
  changes: string | null;
  timestamp: string;
}

// ─── Subcomponents ──────────────────────────────────────────────────────────

function LimitBar({ label, usage, limit, color }: { label: string; usage: number; limit: number; color: string }) {
  const pct = Math.min((usage / limit) * 100, 100);
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-zinc-300">
        <span>{label}</span>
        <span>{usage}/{limit}</span>
      </div>
      <div className="w-full h-2 bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function SectionCard({ icon, title, count, color, children }: { icon: React.ReactNode; title: string; count: number; color: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
      <div className={`px-5 py-4 flex items-center gap-3 border-b border-slate-100 dark:border-zinc-800 ${color}`}>
        {icon}
        <h3 className="font-bold text-slate-800 dark:text-zinc-100">{title}</h3>
        <span className="ml-auto text-xs font-black bg-white/50 dark:bg-black/20 px-2.5 py-0.5 rounded-full">{count}</span>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-zinc-800/60 max-h-64 overflow-y-auto">{children}</div>
    </div>
  );
}

function EmptyRow({ msg }: { msg: string }) {
  return <div className="px-5 py-8 text-center text-sm text-slate-400">{msg}</div>;
}

// ─── Demo Detail Panel ───────────────────────────────────────────────────────

function DemoDetailPanel({ account, onBack }: { account: DemoAccount; onBack: () => void }) {
  const { user } = useRole();
  const [detail, setDetail] = useState<DemoDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<"overview" | "clients" | "leads" | "radar" | "emails">("overview");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/telemetry/demo-account/${account.id}`, {
          headers: { "X-Tenant-ID": user?.tenant_id?.toString() || "" }
        });
        const data = await res.json();
        if (data.success) setDetail(data);
      } catch {}
      setLoading(false);
    };
    load();
  }, [account.id]);

  const tabs = [
    { key: "overview", label: "Overview", icon: <BarChart2 className="w-4 h-4" /> },
    { key: "clients", label: "Clients", icon: <Users className="w-4 h-4" />, count: detail?.clients.length },
    { key: "leads", label: "Leads", icon: <UserPlus className="w-4 h-4" />, count: detail?.leads.length },
    { key: "radar", label: "Radar Analysis", icon: <Radar className="w-4 h-4" />, count: detail?.radar.length },
    { key: "emails", label: "Email Agent", icon: <Mail className="w-4 h-4" />, count: detail?.emails.length },
  ] as const;

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      className="space-y-6"
    >
      {/* Back + Header */}
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-sm font-semibold text-slate-600 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
            {account.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-800 dark:text-zinc-100">{account.name}</h2>
            <p className="text-sm text-slate-500 dark:text-zinc-400">{account.email}</p>
          </div>
        </div>
        <div className="ml-auto text-xs text-slate-400">
          Demo since {new Date(account.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-zinc-900 p-1 rounded-2xl w-full overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
              activeSection === tab.key
                ? "bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 shadow-sm"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab.icon}
            {tab.label}
            {"count" in tab && tab.count !== undefined && (
              <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeSection === tab.key ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600" : "bg-slate-200 dark:bg-zinc-700 text-slate-500"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-3 text-indigo-500 opacity-60" />
          <p className="text-slate-500">Loading activity data...</p>
        </div>
      ) : !detail ? (
        <div className="py-20 text-center text-slate-500">Failed to load data.</div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div key={activeSection} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
            {/* OVERVIEW */}
            {activeSection === "overview" && (
              <div className="space-y-5">
                {/* Stats grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Clients Added", value: detail.clients.length, icon: <Users className="w-5 h-5" />, color: "from-blue-500 to-blue-600" },
                    { label: "Leads Added", value: detail.leads.length, icon: <UserPlus className="w-5 h-5" />, color: "from-violet-500 to-purple-600" },
                    { label: "Radar Analyses", value: detail.radar.length, icon: <Radar className="w-5 h-5" />, color: "from-cyan-500 to-teal-600" },
                    { label: "Emails Sent", value: detail.emails.length, icon: <Mail className="w-5 h-5" />, color: "from-orange-500 to-amber-500" },
                  ].map(stat => (
                    <div key={stat.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
                      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${stat.color} text-white flex items-center justify-center shadow-md`}>
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 dark:text-zinc-400 font-medium">{stat.label}</p>
                        <p className="text-2xl font-black text-slate-800 dark:text-zinc-100">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Usage limits */}
                {detail.limits && (
                  <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                    <h4 className="font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" /> Usage vs. Limits
                    </h4>
                    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                      <LimitBar label="Clients" usage={detail.limits.clients.usage} limit={detail.limits.clients.limit} color="bg-blue-500" />
                      <LimitBar label="Email Agent" usage={detail.limits.emails.usage} limit={detail.limits.emails.limit} color="bg-orange-500" />
                      <LimitBar label="Radar Searches" usage={detail.limits.searches.usage} limit={detail.limits.searches.limit} color="bg-cyan-500" />
                      <LimitBar label="Projects/Sites" usage={detail.limits.projects.usage} limit={detail.limits.projects.limit} color="bg-violet-500" />
                    </div>
                  </div>
                )}

                {/* Recent activity feed */}
                <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
                  <h4 className="font-bold text-slate-800 dark:text-zinc-100 mb-4 flex items-center gap-2"><Clock className="w-4 h-4 text-indigo-500" /> Recent Activity</h4>
                  <div className="space-y-2">
                    {[
                      ...detail.clients.slice(0, 3).map(c => ({ type: "client", text: `Added client "${c.company}"`, time: c.created_at, color: "bg-blue-500" })),
                      ...detail.leads.slice(0, 3).map(l => ({ type: "lead", text: `Added lead "${l.name}"`, time: l.created_at, color: "bg-violet-500" })),
                      ...detail.radar.slice(0, 3).map(r => ({ type: "radar", text: `Ran radar for "${r.target_name}"`, time: r.run_date, color: "bg-cyan-500" })),
                      ...detail.emails.slice(0, 3).map(e => ({ type: "email", text: `Email to "${e.to}"`, time: e.sent_at, color: "bg-orange-500" })),
                    ]
                      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
                      .slice(0, 8)
                      .map((item, i) => (
                        <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 dark:border-zinc-800/50 last:border-0">
                          <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                          <span className="text-sm text-slate-700 dark:text-zinc-300 flex-1">{item.text}</span>
                          <span className="text-xs text-slate-400 flex-shrink-0">{new Date(item.time).toLocaleString()}</span>
                        </div>
                      ))}
                    {detail.clients.length + detail.leads.length + detail.radar.length + detail.emails.length === 0 && (
                      <p className="text-center text-slate-400 py-6">No activity recorded yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* CLIENTS */}
            {activeSection === "clients" && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-blue-50/50 dark:bg-blue-900/10 flex items-center gap-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100">Clients Added</h3>
                  <span className="ml-auto text-xs font-black bg-blue-100 dark:bg-blue-900/30 text-blue-600 px-2.5 py-0.5 rounded-full">{detail.clients.length}</span>
                </div>
                {detail.clients.length === 0 ? <EmptyRow msg="No clients added yet." /> : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-900/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="px-5 py-3 text-left">Company</th>
                        <th className="px-5 py-3 text-left">Website</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60">
                      {detail.clients.map(c => (
                        <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-zinc-200">{c.company}</td>
                          <td className="px-5 py-3 text-slate-500 dark:text-zinc-400 text-xs">{c.website}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-[10px] font-bold rounded-md">{c.status}</span></td>
                          <td className="px-5 py-3 text-xs text-slate-400">{c.created_at ? new Date(c.created_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* LEADS */}
            {activeSection === "leads" && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-violet-50/50 dark:bg-violet-900/10 flex items-center gap-3">
                  <UserPlus className="w-5 h-5 text-violet-600" />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100">Leads Added</h3>
                  <span className="ml-auto text-xs font-black bg-violet-100 dark:bg-violet-900/30 text-violet-600 px-2.5 py-0.5 rounded-full">{detail.leads.length}</span>
                </div>
                {detail.leads.length === 0 ? <EmptyRow msg="No leads added yet." /> : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-900/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="px-5 py-3 text-left">Name</th>
                        <th className="px-5 py-3 text-left">Email</th>
                        <th className="px-5 py-3 text-left">Company</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Added</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60">
                      {detail.leads.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-zinc-200">{l.name}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{l.email}</td>
                          <td className="px-5 py-3 text-slate-500 text-xs">{l.company}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-400 text-[10px] font-bold rounded-md">{l.status}</span></td>
                          <td className="px-5 py-3 text-xs text-slate-400">{l.created_at ? new Date(l.created_at).toLocaleDateString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* RADAR */}
            {activeSection === "radar" && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-cyan-50/50 dark:bg-cyan-900/10 flex items-center gap-3">
                  <Radar className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100">Radar / Website Analyses</h3>
                  <span className="ml-auto text-xs font-black bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 px-2.5 py-0.5 rounded-full">{detail.radar.length}</span>
                </div>
                {detail.radar.length === 0 ? <EmptyRow msg="No radar analyses run yet." /> : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-900/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="px-5 py-3 text-left">Target Business</th>
                        <th className="px-5 py-3 text-left">Website</th>
                        <th className="px-5 py-3 text-left">Competitors Found</th>
                        <th className="px-5 py-3 text-left">Radius</th>
                        <th className="px-5 py-3 text-left">Run Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60">
                      {detail.radar.map(r => (
                        <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-zinc-200">{r.target_name}</td>
                          <td className="px-5 py-3 text-xs text-slate-500">{r.target_website}</td>
                          <td className="px-5 py-3">
                            <span className="px-2.5 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 text-xs font-black rounded-md">{r.competitor_count}</span>
                          </td>
                          <td className="px-5 py-3 text-xs text-slate-500">{r.radius_km} km</td>
                          <td className="px-5 py-3 text-xs text-slate-400">{r.run_date ? new Date(r.run_date).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* EMAILS */}
            {activeSection === "emails" && (
              <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 dark:border-zinc-800 bg-orange-50/50 dark:bg-orange-900/10 flex items-center gap-3">
                  <Mail className="w-5 h-5 text-orange-500" />
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100">Email Agent Results</h3>
                  <span className="ml-auto text-xs font-black bg-orange-100 dark:bg-orange-900/30 text-orange-600 px-2.5 py-0.5 rounded-full">{detail.emails.length}</span>
                </div>
                {detail.emails.length === 0 ? <EmptyRow msg="No emails sent via Email Agent yet." /> : (
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50 dark:bg-zinc-900/80 text-[10px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                      <tr>
                        <th className="px-5 py-3 text-left">To</th>
                        <th className="px-5 py-3 text-left">Subject</th>
                        <th className="px-5 py-3 text-left">Status</th>
                        <th className="px-5 py-3 text-left">Sent At</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-zinc-800/60">
                      {detail.emails.map(e => (
                        <tr key={e.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30">
                          <td className="px-5 py-3 text-slate-600 dark:text-zinc-300 text-xs">{e.to}</td>
                          <td className="px-5 py-3 font-semibold text-slate-800 dark:text-zinc-200 max-w-xs truncate">{e.subject}</td>
                          <td className="px-5 py-3"><span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] font-bold rounded-md">{e.status}</span></td>
                          <td className="px-5 py-3 text-xs text-slate-400">{e.sent_at ? new Date(e.sent_at).toLocaleString() : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      )}
    </motion.div>
  );
}

// ─── Demo Accounts List ──────────────────────────────────────────────────────

function DemoAccountsList({ onSelect }: { onSelect: (account: DemoAccount) => void }) {
  const { user } = useRole();
  const [accounts, setAccounts] = useState<DemoAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/telemetry/demo-accounts`, {
        headers: { "X-Tenant-ID": user?.tenant_id?.toString() || "" }
      });
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch {}
    setLoading(false);
  }, [user?.tenant_id]);

  useEffect(() => { load(); }, [load]);

  const filtered = accounts.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search demo accounts..."
            className="w-full pl-9 pr-4 py-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none dark:text-zinc-100"
          />
        </div>
        <button onClick={load} className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all text-slate-500">
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Activity className="w-8 h-8 animate-pulse mx-auto mb-3 text-indigo-500 opacity-60" />
          <p className="text-slate-500">Loading demo accounts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center text-slate-500">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold">No demo accounts found.</p>
          <p className="text-sm mt-1">Share the signup link to get demo users.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(account => (
            <motion.button
              key={account.id}
              onClick={() => onSelect(account)}
              whileHover={{ y: -2, scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              className="w-full text-left bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 hover:border-indigo-300 dark:hover:border-indigo-700 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-500/20">
                  {account.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-zinc-100 truncate">{account.name}</h3>
                  <p className="text-xs text-slate-500 truncate">{account.email}</p>
                </div>
                <Eye className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors flex-shrink-0" />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {account.created_at ? new Date(account.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—"}
                </span>
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-bold rounded-full">Demo</span>
              </div>
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── System Logs Tab ─────────────────────────────────────────────────────────

function SystemLogsTab() {
  const { user } = useRole();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const limit = 25;
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`${API_BASE_URL}/telemetry/audit-logs?limit=${limit}&offset=${offset}`, {
        headers: { "X-Tenant-ID": user?.tenant_id?.toString() || "" }
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalCount(data.total_count || 0);
    } catch {}
    setLoading(false);
  }, [page, user?.tenant_id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const filteredLogs = logs.filter(log =>
    log.user_email?.toLowerCase().includes(search.toLowerCase()) ||
    log.table_name?.toLowerCase().includes(search.toLowerCase()) ||
    log.action?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(totalCount / limit);

  const getActionColor = (action: string) => {
    switch (action?.toUpperCase()) {
      case "CREATE": return "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20";
      case "UPDATE": return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
      case "DELETE": return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Total Mutations", value: totalCount.toLocaleString(), icon: <Database className="w-6 h-6 text-blue-600" />, bg: "bg-blue-50 dark:bg-blue-900/20" },
          { label: "Unique Actors", value: "Tracking", icon: <Users className="w-6 h-6 text-indigo-600" />, bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "System Status", value: "Healthy", icon: <Server className="w-6 h-6 text-green-600" />, bg: "bg-green-50 dark:bg-green-900/20", valueClass: "text-green-600" },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 rounded-full ${s.bg} flex items-center justify-center`}>{s.icon}</div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">{s.label}</p>
              <h3 className={`text-2xl font-bold ${(s as any).valueClass || "text-slate-800 dark:text-zinc-100"}`}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex gap-3 justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Filter by user, table, or action..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-zinc-100" />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 font-medium">
            <Filter className="w-4 h-4" /><span>Showing {filteredLogs.length} logs</span>
          </div>
        </div>
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-zinc-900/80 border-b border-slate-200 dark:border-zinc-800 text-[11px] uppercase tracking-wider text-slate-500 dark:text-zinc-400 font-bold">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Table</th>
                <th className="px-4 py-3">Record ID</th>
                <th className="px-4 py-3 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/50 text-sm">
              {loading && logs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-400"><Activity className="w-8 h-8 animate-pulse mx-auto mb-3 opacity-50" />Loading telemetry data...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-slate-500">No logs found matching your criteria.</td></tr>
              ) : filteredLogs.map((log, idx) => (
                <motion.tr initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.02 }} key={log.id} className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group">
                  <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-zinc-400 text-xs font-medium">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold">{log.user_name?.charAt(0).toUpperCase()}</div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">{log.user_name}</span>
                        <span className="text-[10px] text-slate-500">{log.user_email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${getActionColor(log.action)}`}>{log.action}</span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700 dark:text-zinc-300 text-xs">{log.table_name}</td>
                  <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-zinc-400">#{log.record_id}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button onClick={() => setSelectedLog(log)} disabled={!log.changes || log.changes === "{}"} className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all disabled:opacity-30">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">Showing <span className="font-bold text-slate-700 dark:text-zinc-200">{filteredLogs.length}</span> of <span className="font-bold text-slate-700 dark:text-zinc-200">{totalCount}</span> entries</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-slate-600 dark:text-zinc-300"><ChevronLeft className="w-4 h-4" /></button>
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 px-2">Page {page} of {totalPages || 1}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-slate-600 dark:text-zinc-300"><ChevronRight className="w-4 h-4" /></button>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800">
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2"><Server className="w-4 h-4 text-blue-500" />Change Payload</h3>
              <button onClick={() => setSelectedLog(null)} className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div><p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Target</p><p className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.table_name} #{selectedLog.record_id}</p></div>
                <div><p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1">Action</p><p className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.action}</p></div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-sm">
                <pre className="text-green-400 font-mono">{selectedLog.changes ? JSON.stringify(JSON.parse(selectedLog.changes), null, 2) : "No specific column changes tracked."}</pre>
              </div>
            </div>
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-right">
              <button onClick={() => setSelectedLog(null)} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md">Close</button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function TelemetryDashboard() {
  const [activeTab, setActiveTab] = useState<"system" | "demo">("system");
  const [selectedDemoAccount, setSelectedDemoAccount] = useState<DemoAccount | null>(null);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950 p-4 md:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/20">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-800 dark:text-zinc-100">Telemetry & Audit</h1>
            <p className="text-sm text-slate-500 dark:text-zinc-400">Monitor system-wide data mutations and demo user activity</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-zinc-800">
        <button
          onClick={() => { setActiveTab("system"); setSelectedDemoAccount(null); }}
          className={`px-5 py-3 font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === "system" ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400"}`}
        >
          <Database className="w-4 h-4" /> System Logs
        </button>
        <button
          onClick={() => { setActiveTab("demo"); setSelectedDemoAccount(null); }}
          className={`px-5 py-3 font-bold text-sm transition-colors flex items-center gap-2 ${activeTab === "demo" ? "text-indigo-600 border-b-2 border-indigo-600" : "text-slate-500 hover:text-slate-700 dark:text-zinc-400"}`}
        >
          <Users className="w-4 h-4" /> Demo Showcases
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "system" ? (
          <motion.div key="system" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <SystemLogsTab />
          </motion.div>
        ) : (
          <motion.div key="demo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <AnimatePresence mode="wait">
              {selectedDemoAccount ? (
                <DemoDetailPanel key={selectedDemoAccount.id} account={selectedDemoAccount} onBack={() => setSelectedDemoAccount(null)} />
              ) : (
                <DemoAccountsList key="list" onSelect={setSelectedDemoAccount} />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
