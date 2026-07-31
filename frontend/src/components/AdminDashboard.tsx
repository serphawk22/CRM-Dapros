"use client";

import { motion } from "framer-motion";
import { Users, Send, Briefcase, Target, Activity, Phone, GraduationCap, ArrowUpRight, CheckCircle2, TrendingUp, DollarSign, Timer, AlertTriangle, Sparkles, Loader2 } from "lucide-react";
import Link from "next/link";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { API_BASE_URL } from "@/config";
import { useRole } from "@/context/RoleContext";

// Data comes from adminStats from the backend
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
};

export function AdminDashboard({ adminStats, NAV_CARDS, language }: any) {
  const { role, user } = useRole();
  const [users, setUsers] = useState<any[]>([]);
  const [myClients, setMyClients] = useState<any[]>([]);
  const [myLeads, setMyLeads] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_BASE_URL}/users`).then(r => r.json()).then(d => setUsers(d.users || []));
    if (role === 'SalesManager' || role === 'Employee' || role === 'Admin') {
      fetch(`${API_BASE_URL}/clients`).then(r => r.json()).then(d => {
        // filter clients assigned to me or if I'm admin
        const list = d.clients || [];
        setMyClients(list);
      });
      fetch(`${API_BASE_URL}/leads`).then(r => r.json()).then(d => {
        setMyLeads(d.leads || []);
      });
    }
  }, [role]);

  const salesTeam = users.filter(u => ['Admin', 'SalesManager', 'Employee'].includes(u.role));
  const devTeam = users.filter(u => ['ProjectMember', 'Intern'].includes(u.role));
  const isSales = role === 'SalesManager' || role === 'Employee' || role === 'Admin';

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto w-full">
      {/* HEADER SECTION */}
      <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Operations Dashboard</h1>
          <p className="text-sm font-medium text-[var(--text-secondary)] mt-1">
            Overview of revenue, pipeline, and team performance.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="px-4 py-2 bg-[var(--surface)] border border-[var(--border)] text-[var(--text-primary)] rounded-md shadow-sm text-sm font-semibold hover:bg-[var(--sidebar-hover)] transition-colors">
            Generate Report
          </button>
          <Link href="/clients" className="px-4 py-2 bg-[var(--primary)] text-white rounded-md shadow-sm text-sm font-semibold hover:bg-[var(--primary-hover)] transition-colors">
            Add New Client
          </Link>
        </div>
      </motion.div>

      {/* KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Revenue", value: "$45,231", trend: "+20.1% from last month", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { title: "Active Clients", value: adminStats?.total || 0, trend: "+4 new this week", icon: Users, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-500/10" },
          { title: "Pipeline Value", value: "$124,500", trend: "12 active deals", icon: Target, color: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-500/10" },
          { title: "Pending Tasks", value: adminStats?.pending || 0, trend: "Requires attention", icon: Timer, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map((kpi, idx) => (
          <motion.div key={idx} variants={itemVariants} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className={`p-3 rounded-xl ${kpi.bg}`}>
              <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-1">{kpi.title}</p>
              <h3 className="text-2xl font-bold text-[var(--text-primary)] leading-none">{kpi.value}</h3>
              <p className="text-[11px] font-medium text-[var(--text-secondary)] mt-2">{kpi.trend}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CALL PITCH WIDGET */}
      <CallPitchWidget />

      {/* QUICK LINKS GRID */}
      <motion.div variants={itemVariants} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm h-max">
        <div className="p-5 border-b border-[var(--border)]">
          <h3 className="font-bold text-[var(--text-primary)]">Quick Links</h3>
        </div>
        <div className="p-5 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {NAV_CARDS.filter((c: any) => c.roles.includes(role || "Admin") && !c.title.includes("Pipeline")).map((card: any) => (
            <Link key={card.href} href={card.href} className="p-4 border border-[var(--border)] rounded-xl hover:border-[var(--primary)] hover:bg-[var(--sidebar-hover)] transition-all group flex flex-col items-center justify-center text-center gap-3">
              <card.icon className="w-7 h-7 text-[var(--text-secondary)] group-hover:text-[var(--primary)] transition-colors" />
              <span className="text-xs font-bold text-[var(--text-primary)]">{card.title}</span>
            </Link>
          ))}
        </div>
      </motion.div>

      {/* TEAM DIRECTORY */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Briefcase className="w-5 h-5 text-indigo-500"/> Sales & Management Team</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {salesTeam.map(u => (
              <div key={u.id} className="p-4 flex items-center gap-4 hover:bg-[var(--sidebar-hover)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">{u.name?.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{u.email} • {u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
            <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><GraduationCap className="w-5 h-5 text-emerald-500"/> Development Team</h3>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {devTeam.map(u => (
              <div key={u.id} className="p-4 flex items-center gap-4 hover:bg-[var(--sidebar-hover)] transition-colors">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">{u.name?.charAt(0)}</div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{u.name}</p>
                  <p className="text-xs text-[var(--text-secondary)]">{u.email} • {u.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* SALESPERSON UI - MY CLIENTS */}
      {isSales && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Users className="w-5 h-5 text-blue-500"/> My Clients</h3>
              <Link href="/clients" className="text-xs text-[var(--primary)] hover:underline font-bold">View All</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {myClients.slice(0, 5).map(c => (
                <div key={c.id} className="p-4 flex items-center justify-between hover:bg-[var(--sidebar-hover)] transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{c.companyName || c.name || c.email}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{c.industry || 'No Industry'} • {c.status}</p>
                  </div>
                  <Link href={`/clients/${c.id}`} className="p-2 hover:bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {myClients.length === 0 && <div className="p-8 text-center text-sm text-[var(--text-secondary)]">No clients assigned yet.</div>}
            </div>
          </div>
          
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-[var(--border)] flex justify-between items-center bg-[var(--sidebar-hover)]/30">
              <h3 className="font-bold text-[var(--text-primary)] flex items-center gap-2"><Target className="w-5 h-5 text-amber-500"/> My Leads</h3>
              <Link href="/leads" className="text-xs text-[var(--primary)] hover:underline font-bold">View All</Link>
            </div>
            <div className="divide-y divide-[var(--border)]">
              {myLeads.slice(0, 5).map(l => (
                <div key={l.id} className="p-4 flex items-center justify-between hover:bg-[var(--sidebar-hover)] transition-colors">
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">{l.name || l.email}</p>
                    <p className="text-xs text-[var(--text-secondary)]">{l.company || 'No Company'} • {l.status}</p>
                  </div>
                  <Link href={`/leads`} className="p-2 hover:bg-[var(--primary)]/10 text-[var(--primary)] rounded-lg transition-colors">
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
              ))}
              {myLeads.length === 0 && <div className="p-8 text-center text-sm text-[var(--text-secondary)]">No leads assigned yet.</div>}
            </div>
          </div>
        </motion.div>
      )}

      {/* RECENT ACTIVITY */}
      <motion.div variants={itemVariants} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm">
        <div className="p-5 border-b border-[var(--border)] flex justify-between items-center">
          <h3 className="font-bold text-[var(--text-primary)]">Recent Activity</h3>
          <Link href="/email-agent" className="text-xs font-semibold text-[var(--primary)] hover:underline">View All</Link>
        </div>
        <div className="p-0">
          {(adminStats?.recentActivities?.length ?? 0) === 0 ? (
            <div className="p-8 text-center text-[var(--text-secondary)]">No activities yet.</div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {adminStats.recentActivities.slice(0, 10).map((act: any) => (
                <div key={act.id} className="p-4 flex gap-4 hover:bg-[var(--sidebar-hover)] transition-colors">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{act.action}</p>
                    <p className="text-xs text-[var(--text-secondary)] mt-0.5">{act.content}</p>
                    <p className="text-[10px] text-[var(--text-secondary)]/70 mt-1 font-medium">{act.createdAt ? new Date(act.createdAt).toLocaleString() : ""}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function CallPitchWidget() {
  const [pitchData, setPitchData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markingDone, setMarkingDone] = useState(false);

  const fetchPitch = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard-call-pitch`);
      if (res.ok) {
        const data = await res.json();
        setPitchData(data);
      }
    } catch (e) {
      console.error("Failed to fetch call pitch", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPitch();
  }, []);

  const handleDone = async () => {
    if (!pitchData?.client?.id) return;
    setMarkingDone(true);
    try {
      await fetch(`${API_BASE_URL}/dashboard-call-pitch/${pitchData.client.id}/done`, { method: "POST" });
      await fetchPitch();
    } catch (e) {
      console.error(e);
    } finally {
      setMarkingDone(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-sm p-6 mb-6 flex items-center justify-center h-40">
        <Loader2 className="animate-spin text-[var(--primary)] w-6 h-6" />
      </div>
    );
  }

  if (!pitchData?.client) {
    return null;
  }

  return (
    <motion.div variants={itemVariants} className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-xl shadow-sm p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      
      <div className="relative z-10 flex flex-col md:flex-row gap-6 items-start md:items-center">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-[10px] uppercase tracking-wider font-bold rounded-md flex items-center gap-1.5">
              <Sparkles className="w-3 h-3" /> AI Call Pitch
            </span>
            <h3 className="font-bold text-lg text-[var(--text-primary)]">
              {pitchData.client.companyName || pitchData.client.name || "Unknown Client"}
            </h3>
          </div>
          
          <p className="text-[var(--text-secondary)] text-sm leading-relaxed mb-4 italic font-medium">
            "{pitchData.pitch_text}"
          </p>
          
          <div className="flex gap-4 text-xs font-semibold text-[var(--text-secondary)]">
            <span className="bg-[var(--surface)] px-2 py-1 rounded-md border border-[var(--border)]">
              Industry: {pitchData.client.industry || "N/A"}
            </span>
            <span className="bg-[var(--surface)] px-2 py-1 rounded-md border border-[var(--border)]">
              Phone: {pitchData.client.phone || "N/A"}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleDone}
          disabled={markingDone}
          className="shrink-0 flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-5 py-3 rounded-lg font-bold shadow-md transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
        >
          {markingDone ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          Call Pitch is Done
        </button>
      </div>
    </motion.div>
  );
}
