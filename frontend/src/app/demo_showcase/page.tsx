"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const NAV_SECTIONS = [
  { id: "hero", label: "Overview" },
  { id: "architecture", label: "Architecture" },
  { id: "leads", label: "Lead Management" },
  { id: "radar", label: "Radar Analysis" },
  { id: "pipeline", label: "Sales Pipeline" },
  { id: "communication", label: "Communication" },
  { id: "automation", label: "Automation" },
  { id: "client360", label: "Client 360°" },
  { id: "tasks", label: "Tasks" },
  { id: "cases", label: "Cases" },
  { id: "analytics", label: "Analytics" },
  { id: "ai", label: "AI Engine" },
  { id: "journey", label: "Journey" },
  { id: "modules", label: "All Modules" },
  { id: "beforeafter", label: "Before vs After" },
  { id: "impact", label: "Impact" },
];

const MODULES = [
  { icon: "🎯", name: "Lead Management", desc: "Capture, qualify & track every lead through a structured lifecycle.", color: "#6366f1" },
  { icon: "👥", name: "Contact Management", desc: "Rich contact profiles linked to leads, companies & deals.", color: "#8b5cf6" },
  { icon: "🏢", name: "Client Management", desc: "360° customer view — deals, history, communications & tasks.", color: "#a855f7" },
  { icon: "📊", name: "Sales Pipeline", desc: "Visual kanban with deal probability, value & stage automation.", color: "#ec4899" },
  { icon: "🔭", name: "Radar Analysis", desc: "Discover prospects by location, market size & services.", color: "#f43f5e" },
  { icon: "💬", name: "Communication Hub", desc: "Email, WhatsApp & internal messages in one threaded timeline.", color: "#ef4444" },
  { icon: "⚡", name: "Automation Engine", desc: "Trigger-based workflows that run on any CRM event.", color: "#f97316" },
  { icon: "✅", name: "Tasks & Follow-ups", desc: "Smart task management with deadlines, priorities & reminders.", color: "#eab308" },
  { icon: "🎫", name: "Support Cases", desc: "Full case lifecycle from issue creation to resolution.", color: "#22c55e" },
  { icon: "📋", name: "Proposals", desc: "Create, send & track professional proposals.", color: "#10b981" },
  { icon: "🗂️", name: "Projects", desc: "Track deliverables, milestones & team workloads.", color: "#14b8a6" },
  { icon: "📄", name: "Documents", desc: "Centralized file management linked to clients & deals.", color: "#06b6d4" },
  { icon: "🧾", name: "Billing & Invoices", desc: "SERP Hawk (INR) or DaPros (MXN) invoice generation.", color: "#0ea5e9" },
  { icon: "🛍️", name: "Product Catalog", desc: "Service catalog with MXN / INR dual-currency pricing.", color: "#3b82f6" },
  { icon: "📅", name: "Meetings", desc: "Schedule, track & record all client & internal meetings.", color: "#6366f1" },
  { icon: "🔔", name: "Notifications", desc: "Real-time smart alerts for tasks, leads & deals.", color: "#8b5cf6" },
  { icon: "📈", name: "Reports & Rankings", desc: "Team performance analytics & conversion metrics.", color: "#a855f7" },
  { icon: "🤖", name: "AI Email Agent", desc: "AI-powered email drafting & follow-up automation.", color: "#ec4899" },
  { icon: "🏆", name: "Sales Manager", desc: "Executive revenue, pipeline & team forecasting.", color: "#f43f5e" },
  { icon: "👨‍👩‍👧‍👦", name: "Team Management", desc: "Org structure, roles, permissions & performance.", color: "#ef4444" },
  { icon: "📦", name: "Orders", desc: "Order management linked to clients, products & billing.", color: "#f97316" },
];

const AUTOMATIONS = [
  { trigger: "New Lead Created", condition: "Lead source = Website / Radar", actions: ["Assign to sales owner", "Create follow-up task", "Send welcome notification", "Start 3-day sequence"], outcome: "Lead never falls through the cracks", color: "#6366f1" },
  { trigger: "No Response for 3 Days", condition: "Lead status = Contacted", actions: ["Create urgent reminder", "Notify salesperson", "Escalate to manager", "Log inactivity"], outcome: "100% follow-up consistency guaranteed", color: "#ec4899" },
  { trigger: "Deal Won", condition: "Pipeline stage = Won", actions: ["Update to customer status", "Create onboarding task", "Notify entire team", "Generate invoice"], outcome: "Instant customer onboarding activated", color: "#22c55e" },
  { trigger: "Prospect Found on Radar", condition: "Added from Radar Analysis", actions: ["Tag with radar source", "Save research profile", "Add to client list", "Track discovery history"], outcome: "Full prospect intelligence preserved", color: "#f97316" },
];

const JOURNEY_STEPS = [
  { icon: "🔭", title: "Prospect Discovered", subtitle: "Radar Analysis", color: "#6366f1" },
  { icon: "➕", title: "Lead Added", subtitle: "CRM Intake", color: "#8b5cf6" },
  { icon: "📝", title: "Data Enriched", subtitle: "Auto-fill", color: "#a855f7" },
  { icon: "✅", title: "Lead Qualified", subtitle: "Scoring", color: "#ec4899" },
  { icon: "👤", title: "Owner Assigned", subtitle: "Auto-routing", color: "#f43f5e" },
  { icon: "📅", title: "Follow-up Created", subtitle: "Automation", color: "#ef4444" },
  { icon: "💬", title: "Communication", subtitle: "Email/WhatsApp", color: "#f97316" },
  { icon: "💼", title: "Opportunity", subtitle: "Pipeline Entry", color: "#eab308" },
  { icon: "📊", title: "Deal Progress", subtitle: "Stage Moves", color: "#22c55e" },
  { icon: "🏆", title: "Deal Won", subtitle: "Conversion", color: "#10b981" },
  { icon: "🎉", title: "Onboarded", subtitle: "Status Updated", color: "#14b8a6" },
  { icon: "🎫", title: "Support Case", subtitle: "Issue Handled", color: "#06b6d4" },
  { icon: "💡", title: "Solution", subtitle: "Knowledge Base", color: "#0ea5e9" },
  { icon: "❤️", title: "Retained", subtitle: "Loyalty Track", color: "#3b82f6" },
  { icon: "📈", title: "Analytics", subtitle: "BI Updated", color: "#6366f1" },
];

function AnimatedCounter({ end, suffix = "", prefix = "", duration = 2000 }: { end: number; suffix?: string; prefix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting && !started) setStarted(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started, end, duration]);

  return <span ref={ref}>{prefix}{count.toLocaleString()}{suffix}</span>;
}

function AnimatedBarChart() {
  const [drawn, setDrawn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const data = [
    { label: "Jan", value: 42, color: "#6366f1" }, { label: "Feb", value: 58, color: "#8b5cf6" },
    { label: "Mar", value: 71, color: "#a855f7" }, { label: "Apr", value: 65, color: "#ec4899" },
    { label: "May", value: 89, color: "#f97316" }, { label: "Jun", value: 95, color: "#22c55e" },
  ];
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setDrawn(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} className="flex items-end gap-3 h-40 px-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <div className="text-[10px] font-bold" style={{ color: d.color }}>{d.value}%</div>
          <div className="w-full rounded-t-lg transition-all duration-1000" style={{ height: drawn ? `${d.value}%` : "0%", background: `linear-gradient(to top,${d.color},${d.color}88)`, transitionDelay: `${i * 0.1}s`, boxShadow: drawn ? `0 0 12px ${d.color}66` : "none" }} />
          <div className="text-[9px] text-white/40">{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function SectionHeader({ badge, title, subtitle, color = "#6366f1" }: { badge: string; title: string; subtitle: string; color?: string }) {
  return (
    <div className="text-center max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-xs font-bold uppercase tracking-widest" style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>{badge}</div>
      <h2 className="text-4xl lg:text-5xl font-black text-white mb-4" style={{ letterSpacing: "-0.02em" }}>{title}</h2>
      <p className="text-lg text-white/40 leading-relaxed">{subtitle}</p>
    </div>
  );
}

export default function DemoShowcase() {
  const [activeSection, setActiveSection] = useState("hero");
  const [tourActive, setTourActive] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [tourPaused, setTourPaused] = useState(false);
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [activeAutomation, setActiveAutomation] = useState<number | null>(null);
  const tourRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) setActiveSection(e.target.id); });
    }, { threshold: 0.3 });
    NAV_SECTIONS.forEach(s => { const el = document.getElementById(s.id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  useEffect(() => {
    if (!tourActive || tourPaused) return;
    if (tourStep >= NAV_SECTIONS.length) { setTourActive(false); setTourStep(0); return; }
    scrollTo(NAV_SECTIONS[tourStep].id);
    tourRef.current = setTimeout(() => setTourStep(s => s + 1), 4000);
    return () => { if (tourRef.current) clearTimeout(tourRef.current); };
  }, [tourActive, tourStep, tourPaused, scrollTo]);

  const startTour = () => { setTourStep(0); setTourActive(true); setTourPaused(false); };
  const exitTour = () => { setTourActive(false); setTourStep(0); if (tourRef.current) clearTimeout(tourRef.current); };

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#080c1a", fontFamily: "Inter, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @keyframes fadeInUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes slideInLeft { from { opacity:0; transform:translateX(-40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes slideInRight { from { opacity:0; transform:translateX(40px); } to { opacity:1; transform:translateX(0); } }
        @keyframes pulse { 0%,100%{opacity:.3;transform:scale(1);} 50%{opacity:.6;transform:scale(1.05);} }
        @keyframes float { 0%,100%{transform:translateY(0);} 50%{transform:translateY(-10px);} }
        @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(99,102,241,.3);} 50%{box-shadow:0 0 40px rgba(99,102,241,.7);} }
        @keyframes ticker { 0%{transform:translateX(0);} 100%{transform:translateX(-50%);} }
        @keyframes orbit { 0%{transform:translate(-50%,-50%) rotate(0deg) translateX(130px) rotate(0deg);} 100%{transform:translate(-50%,-50%) rotate(360deg) translateX(130px) rotate(-360deg);} }
        @keyframes nodeAppear { from{opacity:0;transform:scale(0.5);} to{opacity:1;transform:scale(1);} }
        @keyframes spin-slow { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .glass { background:rgba(255,255,255,.04); backdrop-filter:blur(12px); border:1px solid rgba(255,255,255,.08); }
        .glass-hover { transition:all .3s ease; }
        .glass-hover:hover { background:rgba(255,255,255,.07); border-color:rgba(99,102,241,.4); transform:translateY(-2px); box-shadow:0 8px 30px rgba(99,102,241,.15); }
        .gradient-text { background:linear-gradient(135deg,#fff 0%,#a5b4fc 50%,#818cf8 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hero-gradient { background:radial-gradient(ellipse 80% 60% at 50% 0%,rgba(99,102,241,.15) 0%,transparent 70%),radial-gradient(ellipse 50% 40% at 80% 50%,rgba(168,85,247,.08) 0%,transparent 60%); }
        .glow-indigo { animation:glow 3s ease-in-out infinite; }
        .module-card:hover .module-icon { transform:scale(1.2) rotate(-5deg); transition:transform .3s ease; }
        .scrollbar-hide::-webkit-scrollbar { display:none; }
        ::-webkit-scrollbar { width:4px; } ::-webkit-scrollbar-track { background:#0d1124; } ::-webkit-scrollbar-thumb { background:#6366f1; border-radius:2px; }
      `}</style>

      {/* STICKY NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderBottom:"1px solid rgba(255,255,255,.06)" }}>
        <div className="max-w-screen-xl mx-auto px-4 flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>🦅</div>
            <span className="font-black text-sm" style={{ color:"#a5b4fc" }}>SERP HAWK CRM</span>
            <span className="hidden md:block text-xs text-white/30">· Demo</span>
          </div>
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto scrollbar-hide">
            {NAV_SECTIONS.slice(0,11).map(s => (
              <button key={s.id} onClick={() => scrollTo(s.id)} className="px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap" style={{ color:activeSection===s.id?"#a5b4fc":"rgba(255,255,255,.4)", background:activeSection===s.id?"rgba(99,102,241,.15)":"transparent" }}>{s.label}</button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={startTour} className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-white" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>▶ Start Tour</button>
            <a href="/login" className="px-3 py-1.5 rounded-lg text-xs font-bold text-white/60 border border-white/10 hover:border-indigo-500/40 transition-all">Launch CRM →</a>
          </div>
        </div>
      </nav>

      {/* TOUR OVERLAY */}
      {tourActive && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 glass rounded-2xl px-6 py-4 flex items-center gap-4 shadow-2xl" style={{ border:"1px solid rgba(99,102,241,.4)", minWidth:340 }}>
          <div className="flex-1">
            <div className="text-[10px] text-white/40 uppercase tracking-widest mb-0.5">Guided Tour</div>
            <div className="font-bold text-sm text-white">{NAV_SECTIONS[Math.min(tourStep,NAV_SECTIONS.length-1)]?.label}</div>
            <div className="mt-1.5 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width:`${(tourStep/NAV_SECTIONS.length)*100}%`, background:"linear-gradient(to right,#6366f1,#a855f7)" }} />
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setTourStep(s => Math.max(0,s-1))} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white text-sm">‹</button>
            <button onClick={() => setTourPaused(p => !p)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs" style={{ background:"rgba(99,102,241,.3)" }}>{tourPaused?"▶":"⏸"}</button>
            <button onClick={() => setTourStep(s => Math.min(NAV_SECTIONS.length-1,s+1))} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/60 hover:text-white text-sm">›</button>
            <button onClick={exitTour} className="w-8 h-8 rounded-lg glass flex items-center justify-center text-white/40 hover:text-white text-xs">✕</button>
          </div>
        </div>
      )}

      {/* ══ HERO ══ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center pt-14 hero-gradient overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"linear-gradient(rgba(99,102,241,.04) 1px,transparent 1px),linear-gradient(90deg,rgba(99,102,241,.04) 1px,transparent 1px)", backgroundSize:"60px 60px" }} />
        <div className="max-w-screen-xl mx-auto px-4 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <div style={{ animation:"slideInLeft 1s ease-out forwards" }}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold" style={{ background:"rgba(99,102,241,.15)", border:"1px solid rgba(99,102,241,.3)", color:"#a5b4fc" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />SERP HAWK CRM — Live Product Showcase
            </div>
            <h1 className="text-5xl lg:text-6xl font-black leading-tight mb-6" style={{ letterSpacing:"-0.03em" }}>
              <span className="gradient-text">The Intelligent CRM</span><br />
              <span className="text-white">Built to Automate</span><br />
              <span className="text-white/60">Your Entire</span><br />
              <span className="text-white">Customer Journey.</span>
            </h1>
            <p className="text-lg text-white/50 leading-relaxed mb-8 max-w-lg">From discovering prospects to managing relationships, automating follow-ups, tracking performance, and closing opportunities — everything your team needs, connected in one intelligent platform.</p>
            <div className="flex flex-wrap gap-3">
              <button onClick={startTour} className="px-6 py-3 rounded-xl font-bold text-white text-sm glow-indigo" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>▶ Start Product Tour</button>
              <button onClick={() => scrollTo("journey")} className="px-6 py-3 rounded-xl font-bold text-sm glass glass-hover" style={{ color:"#a5b4fc", border:"1px solid rgba(99,102,241,.3)" }}>View Customer Journey →</button>
            </div>
            <div className="mt-10 flex gap-6">
              {[{ v:"21+", l:"CRM Modules" }, { v:"100%", l:"Automated" }, { v:"360°", l:"Customer View" }].map((s,i) => (
                <div key={i}><div className="text-2xl font-black" style={{ color:"#a5b4fc" }}>{s.v}</div><div className="text-xs text-white/40">{s.l}</div></div>
              ))}
            </div>
          </div>
          {/* Ecosystem viz */}
          <div className="relative" style={{ height:400, animation:"slideInRight 1s ease-out forwards" }}>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-28 h-28 rounded-full flex items-center justify-center z-10 relative" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 60px rgba(99,102,241,.6)" }}>
                  <div className="text-center"><div className="text-white font-black text-xs">CRM</div><div className="text-white/70 text-[9px]">CORE</div></div>
                </div>
                {[1,2,3].map(i => <div key={i} className="absolute inset-0 rounded-full border border-indigo-500/20" style={{ transform:`scale(${1+i*0.8})`, animation:`pulse ${2+i*.5}s ease-in-out infinite`, animationDelay:`${i*.3}s` }} />)}
              </div>
            </div>
            {[
              { label:"Leads", angle:0, color:"#6366f1" }, { label:"Contacts", angle:40, color:"#8b5cf6" },
              { label:"Radar", angle:80, color:"#a855f7" }, { label:"Pipeline", angle:120, color:"#ec4899" },
              { label:"Deals", angle:160, color:"#f43f5e" }, { label:"Tasks", angle:200, color:"#f97316" },
              { label:"Messages", angle:240, color:"#eab308" }, { label:"Automation", angle:280, color:"#22c55e" },
              { label:"Analytics", angle:320, color:"#0ea5e9" },
            ].map((n,i) => {
              const rad=(n.angle*Math.PI)/180, r=155, x=Math.cos(rad)*r, y=Math.sin(rad)*r;
              return (
                <div key={i} className="absolute flex items-center justify-center" style={{ left:"50%", top:"50%", transform:`translate(calc(-50% + ${x}px),calc(-50% + ${y}px))`, animation:`fadeInUp 0.6s ease-out forwards`, animationDelay:`${i*.15}s`, opacity:0 }}>
                  <div className="px-3 py-1.5 rounded-full text-[11px] font-bold text-white border whitespace-nowrap" style={{ background:`${n.color}22`, borderColor:`${n.color}66`, boxShadow:`0 0 15px ${n.color}33`, color:n.color }}>{n.label}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ borderTop:"1px solid rgba(99,102,241,.15)" }}>
          <div className="flex gap-8 py-2 text-[11px] font-semibold" style={{ animation:"ticker 30s linear infinite", width:"max-content", color:"rgba(99,102,241,.5)" }}>
            {[...Array(3)].flatMap(()=>["Lead Management","Sales Pipeline","Radar Analysis","Automation Engine","Communication Hub","Analytics Dashboard","Client 360°","AI Email Agent","Invoice Generator","Support Cases"]).map((t,i)=>(
              <span key={i} className="flex items-center gap-2"><span className="w-1 h-1 rounded-full bg-indigo-500"/>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ══ ARCHITECTURE ══ */}
      <section id="architecture" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-lg mx-auto">
          <SectionHeader badge="Architecture" title="The Complete CRM Ecosystem" subtitle="Every module is connected. Every action is tracked. Every insight is automated." />
          <div className="flex flex-col items-center gap-0 mt-16">
            {[
              { icon:"📢", label:"Marketing & Outreach", desc:"Campaigns, content, ads", color:"#6366f1" },
              { icon:"🔭", label:"Radar Analysis", desc:"Discover prospects by location & market", color:"#8b5cf6" },
              { icon:"📥", label:"Lead Generation", desc:"Website forms, imports, manual entry", color:"#a855f7" },
              { icon:"✅", label:"Lead Qualification", desc:"Scoring, criteria, owner assignment", color:"#ec4899" },
              { icon:"👤", label:"Client Management", desc:"360° customer profile creation", color:"#f43f5e" },
              { icon:"📊", label:"Sales Pipeline", desc:"Deal stages, probabilities, forecasting", color:"#f97316" },
              { icon:"💬", label:"Communication", desc:"Email, WhatsApp, internal messaging", color:"#eab308" },
              { icon:"⚡", label:"Automation", desc:"Workflows triggered by CRM events", color:"#22c55e" },
              { icon:"🎫", label:"Cases & Support", desc:"Issue tracking, resolution, satisfaction", color:"#10b981" },
              { icon:"📈", label:"Reports & Analytics", desc:"KPIs, conversions, team performance", color:"#0ea5e9" },
              { icon:"🚀", label:"Business Growth", desc:"Data-driven decisions at scale", color:"#3b82f6" },
            ].map((node,i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="group flex items-center gap-4 px-6 py-3 rounded-2xl glass glass-hover cursor-default" style={{ animation:`fadeInUp .5s ease-out forwards`, animationDelay:`${i*.08}s`, opacity:0, minWidth:320, border:`1px solid ${node.color}22` }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background:`${node.color}22`, border:`1px solid ${node.color}44` }}>{node.icon}</div>
                  <div><div className="font-bold text-sm text-white">{node.label}</div><div className="text-xs text-white/40">{node.desc}</div></div>
                  <div className="ml-auto text-xs font-bold" style={{ color:node.color }}>#{i+1}</div>
                </div>
                {i<10 && <div className="flex flex-col items-center gap-0.5 py-1"><div className="w-px h-4 bg-gradient-to-b from-indigo-500/50 to-transparent"/><div className="w-1.5 h-1.5 rounded-full" style={{ background:node.color, boxShadow:`0 0 8px ${node.color}` }}/><div className="w-px h-4 bg-gradient-to-b from-transparent to-indigo-500/30"/></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ LEADS ══ */}
      <section id="leads" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Lead Management" title="Turn Every Prospect Into a Customer" subtitle="A structured, automated journey from first contact to conversion." color="#6366f1" />
          <div className="flex flex-wrap justify-center gap-2 mt-12 mb-16">
            {["New Lead","Lead Captured","Data Enriched","Qualified","Assigned","Follow-up","Communication","Opportunity","Converted ✓"].map((s,i)=>(
              <div key={i} className="flex items-center gap-1.5">
                <div className="px-4 py-2 rounded-full text-sm font-semibold" style={{ background:i===8?"rgba(34,197,94,.15)":"rgba(99,102,241,.1)", border:`1px solid ${i===8?"rgba(34,197,94,.4)":"rgba(99,102,241,.25)"}`, color:i===8?"#34d399":"#a5b4fc", animation:`fadeInUp .4s ease-out forwards`, animationDelay:`${i*.07}s`, opacity:0 }}>{s}</div>
                {i<8 && <span className="text-white/20 text-xs">→</span>}
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-8 border" style={{ background:"rgba(239,68,68,.05)", borderColor:"rgba(239,68,68,.2)" }}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center text-lg">😓</div><div><div className="font-black text-white">Without CRM</div><div className="text-xs text-red-400">Manual &amp; fragmented</div></div></div>
              <div className="space-y-3">{["📊 Spreadsheets with no structure","📞 Manual follow-up calls","🕳️ Leads fall through the cracks","🗂️ Scattered contact information","👁️ Zero pipeline visibility","📉 No performance tracking","⏰ Hours of manual reporting"].map((item,i)=>(<div key={i} className="flex items-center gap-2 text-sm text-white/50"><span className="w-1 h-1 rounded-full bg-red-500 flex-shrink-0"/>{item}</div>))}</div>
            </div>
            <div className="rounded-2xl p-8 border" style={{ background:"rgba(34,197,94,.05)", borderColor:"rgba(34,197,94,.2)" }}>
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-lg">🚀</div><div><div className="font-black text-white">With SERP HAWK CRM</div><div className="text-xs text-emerald-400">Automated &amp; intelligent</div></div></div>
              <div className="space-y-3">{["✅ Centralized customer database","⚡ Automated follow-up workflows","🎯 100% lead tracking coverage","📋 Rich contact profiles & history","📊 Real-time pipeline visibility","📈 Live performance analytics","🤖 AI-assisted reporting"].map((item,i)=>(<div key={i} className="flex items-center gap-2 text-sm text-emerald-400/80"><span className="w-1 h-1 rounded-full bg-emerald-500 flex-shrink-0"/>{item}</div>))}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ RADAR ══ */}
      <section id="radar" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Radar Analysis" title="Intelligent Prospect Discovery" subtitle="Find your ideal clients before your competitors do. Map market opportunities in real time." color="#a855f7" />
          <div className="grid lg:grid-cols-2 gap-10 mt-14">
            <div className="rounded-2xl overflow-hidden relative" style={{ height:380, background:"linear-gradient(135deg,#0d1b2a,#0a0f1e)", border:"1px solid rgba(168,85,247,.2)" }}>
              <div className="absolute inset-0" style={{ backgroundImage:"linear-gradient(rgba(168,85,247,.06) 1px,transparent 1px),linear-gradient(90deg,rgba(168,85,247,.06) 1px,transparent 1px)", backgroundSize:"40px 40px" }} />
              {[{x:45,y:35,label:"TechNova",color:"#6366f1"},{x:60,y:55,label:"MX Design",color:"#a855f7"},{x:30,y:65,label:"Startup Co",color:"#ec4899"},{x:70,y:30,label:"GlobalMart",color:"#f97316"},{x:55,y:75,label:"WebAgency",color:"#22c55e"}].map((pin,i)=>(
                <div key={i} className="absolute flex flex-col items-center" style={{ left:`${pin.x}%`, top:`${pin.y}%`, transform:"translate(-50%,-100%)", animation:`nodeAppear .5s ease-out forwards`, animationDelay:`${i*.2}s`, opacity:0 }}>
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white mb-1 whitespace-nowrap" style={{ background:`${pin.color}33`, border:`1px solid ${pin.color}66` }}>{pin.label}</div>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs" style={{ background:pin.color, boxShadow:`0 0 20px ${pin.color}88` }}>📍</div>
                </div>
              ))}
              <div className="absolute" style={{ left:"45%", top:"35%", transform:"translate(-50%,-50%)" }}>
                {[80,130,180].map((r,i)=><div key={i} className="absolute rounded-full border" style={{ width:r, height:r, left:-r/2, top:-r/2, borderColor:`rgba(99,102,241,${.12-i*.03})`, animation:`pulse ${2+i}s ease-in-out infinite` }}/>)}
              </div>
              <div className="absolute bottom-4 left-4 right-4 rounded-xl p-3 glass" style={{ border:"1px solid rgba(168,85,247,.2)" }}>
                <div className="text-xs text-white/40 mb-1">Top prospect identified</div>
                <div className="flex items-center justify-between"><span className="text-sm font-bold text-white">TechNova Pvt Ltd</span><button className="px-3 py-1 rounded-lg text-xs font-bold text-white" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>+ Add to CRM</button></div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="text-sm text-white/40 font-semibold uppercase tracking-widest mb-4">4 Intelligence Filters</div>
              {[
                { icon:"📍", title:"Distance", desc:"Find prospects closest to your office.", color:"#6366f1", rank:["TechNova — 2.1 km","MX Design — 3.8 km","Startup Co — 5.2 km"] },
                { icon:"💰", title:"Market Size", desc:"Target companies with the highest revenue potential.", color:"#ec4899", rank:["GlobalMart — ₹50L+","TechNova — ₹30L+","WebAgency — ₹12L+"] },
                { icon:"👥", title:"Team Size", desc:"Filter prospects by company size.", color:"#f97316", rank:["GlobalMart — 200+","TechNova — 45","MX Design — 12"] },
                { icon:"🛠️", title:"Services", desc:"Identify prospects using services you can improve.", color:"#22c55e", rank:["WebAgency — SEO match","Startup — Dev match","MX Design — Social"] },
              ].map((m,i)=>(
                <div key={i} className="rounded-xl p-4 glass glass-hover border" style={{ borderColor:`${m.color}22` }}>
                  <div className="flex items-center gap-3 mb-2"><div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background:`${m.color}22` }}>{m.icon}</div><div><div className="font-bold text-sm text-white">{m.title}</div><div className="text-xs text-white/40">{m.desc}</div></div></div>
                  <div className="flex gap-2 flex-wrap">{m.rank.map((r,ri)=><span key={ri} className="text-[10px] px-2 py-0.5 rounded-full" style={{ background:`${m.color}15`, color:m.color, border:`1px solid ${m.color}30` }}>#{ri+1} {r}</span>)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ PIPELINE ══ */}
      <section id="pipeline" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Sales Pipeline" title="Visualize Every Deal in Motion" subtitle="Track opportunities from first contact to closed won — with automated stage actions." color="#ec4899" />
          <div className="mt-14 overflow-x-auto pb-4 scrollbar-hide">
            <div className="flex gap-3 min-w-max">
              {[{name:"New Lead",count:24,value:"₹2.4L",color:"#6366f1"},{name:"Contacted",count:18,value:"₹1.8L",color:"#8b5cf6"},{name:"Qualified",count:12,value:"₹1.2L",color:"#a855f7"},{name:"Proposal",count:8,value:"₹80K",color:"#ec4899"},{name:"Negotiation",count:5,value:"₹50K",color:"#f97316"},{name:"Won ✓",count:3,value:"₹30K",color:"#22c55e"}].map((s,si)=>(
                <div key={si} className="w-44 rounded-xl p-3 border" style={{ background:`${s.color}0d`, borderColor:`${s.color}30` }}>
                  <div className="flex items-center justify-between mb-2"><span className="text-xs font-bold" style={{ color:s.color }}>{s.name}</span><span className="text-xs text-white/40">{s.count}</span></div>
                  <div className="text-xs text-white/40 mb-3">{s.value}</div>
                  {si===0&&<div className="rounded-lg p-2 flex items-center gap-2" style={{ background:`${s.color}20`, border:`1px solid ${s.color}40` }}><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background:s.color }}>T</div><div><div className="text-[10px] font-semibold text-white leading-tight">TechNova</div><div className="text-[10px]" style={{ color:s.color }}>₹45,000</div></div></div>}
                  {si===2&&<div className="rounded-lg p-2 flex items-center gap-2" style={{ background:`${s.color}20`, border:`1px solid ${s.color}40` }}><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background:s.color }}>G</div><div><div className="text-[10px] font-semibold text-white leading-tight">GlobalMart</div><div className="text-[10px]" style={{ color:s.color }}>₹1,20,000</div></div></div>}
                  {si===4&&<div className="rounded-lg p-2 flex items-center gap-2" style={{ background:`${s.color}20`, border:`1px solid ${s.color}40` }}><div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white flex-shrink-0" style={{ background:s.color }}>S</div><div><div className="text-[10px] font-semibold text-white leading-tight">StartupXYZ</div><div className="text-[10px]" style={{ color:s.color }}>₹28,000</div></div></div>}
                </div>
              ))}
            </div>
          </div>
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            {[{trigger:"Stage: Qualified",actions:["Auto-create task","Schedule follow-up","Notify salesperson"],color:"#6366f1"},{trigger:"Stage: Proposal",actions:["Generate proposal","Set deadline","Update probability"],color:"#a855f7"},{trigger:"Stage: Won ✓",actions:["Create customer record","Generate invoice","Notify team"],color:"#22c55e"}].map((a,i)=>(
              <div key={i} className="rounded-xl p-5 glass border" style={{ borderColor:`${a.color}25` }}><div className="text-xs text-white/40 mb-1">Auto-trigger when:</div><div className="font-bold text-sm mb-3" style={{ color:a.color }}>{a.trigger}</div><div className="space-y-1.5">{a.actions.map((act,ai)=><div key={ai} className="flex items-center gap-2 text-xs text-white/60"><span style={{ color:a.color }}>→</span>{act}</div>)}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COMMUNICATION ══ */}
      <section id="communication" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Communication Hub" title="Every Conversation. One Place." subtitle="Email, WhatsApp, internal notes — unified in a single threaded customer timeline." color="#eab308" />
          <div className="grid lg:grid-cols-2 gap-12 mt-14 items-center">
            <div className="grid grid-cols-2 gap-4">
              {[{icon:"📧",name:"Email",desc:"Full email threading per client with open & click tracking",color:"#6366f1"},{icon:"💬",name:"WhatsApp",desc:"WhatsApp Business — messages linked to CRM contact",color:"#22c55e"},{icon:"🌐",name:"Website Chat",desc:"Live chat widget — auto-creates leads in CRM",color:"#0ea5e9"},{icon:"📝",name:"Internal Notes",desc:"Team-only notes visible across client timelines",color:"#a855f7"},{icon:"🔔",name:"Notifications",desc:"Real-time alerts for every CRM event",color:"#f97316"},{icon:"📞",name:"Call Logs",desc:"Log & track every call with notes & follow-ups",color:"#ec4899"}].map((ch,i)=>(
                <div key={i} className="rounded-xl p-4 glass glass-hover border" style={{ borderColor:`${ch.color}20` }}><div className="text-2xl mb-2">{ch.icon}</div><div className="font-bold text-sm text-white mb-1">{ch.name}</div><div className="text-xs text-white/40 leading-tight">{ch.desc}</div></div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="text-xs text-white/30 uppercase tracking-widest mb-4">Live Conversation Flow</div>
              {[{from:"Customer",msg:"Hi, I'm interested in SEO services",dir:"in"},{from:"CRM System",msg:"Notification sent to Sales Team",dir:"system"},{from:"Sales Rep",msg:"Thanks! I'd love to understand your goals.",dir:"out"},{from:"CRM System",msg:"Conversation saved to client profile ✓",dir:"system"}].map((m,i)=>(
                <div key={i} className={`flex ${m.dir==="out"?"justify-end":m.dir==="system"?"justify-center":"justify-start"}`} style={{ animation:`fadeInUp .5s ease-out forwards`, animationDelay:`${i*.15}s`, opacity:0 }}>
                  {m.dir==="system"?<div className="px-4 py-1.5 rounded-full text-[11px] text-white/40 glass border border-white/05">⚡ {m.msg}</div>:<div className={`max-w-xs rounded-2xl px-4 py-3 text-sm ${m.dir==="out"?"rounded-tr-sm":"rounded-tl-sm"}`} style={{ background:m.dir==="out"?"rgba(99,102,241,.3)":"rgba(255,255,255,.06)", border:"1px solid rgba(255,255,255,.08)" }}><div className="text-[10px] text-white/40 mb-1">{m.from}</div><div className="text-white text-xs">{m.msg}</div></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ AUTOMATION ══ */}
      <section id="automation" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Automation Engine" title="Let Your CRM Work While Your Team Focuses on Growth." subtitle="Intelligent trigger-based workflows execute automatically — no manual intervention needed." color="#22c55e" />
          <div className="grid md:grid-cols-2 gap-6 mt-14">
            {AUTOMATIONS.map((a,i)=>(
              <div key={i} onClick={()=>setActiveAutomation(activeAutomation===i?null:i)} className="rounded-2xl p-6 cursor-pointer transition-all glass-hover border" style={{ background:`${a.color}08`, borderColor:activeAutomation===i?`${a.color}60`:`${a.color}20`, boxShadow:activeAutomation===i?`0 0 30px ${a.color}25`:"none" }}>
                <div className="flex items-start justify-between mb-4"><div><div className="text-[10px] text-white/30 uppercase tracking-widest mb-1">Trigger</div><div className="font-black text-white">{a.trigger}</div></div><div className="text-xs px-2 py-1 rounded-full" style={{ background:`${a.color}20`, color:a.color }}>{activeAutomation===i?"▾ Hide":"▸ Show"}</div></div>
                <div className="flex items-center gap-2 flex-wrap mb-4">{["TRIGGER","→","CONDITION","→","ACTION","→","RESULT"].map((step,si)=><span key={si} className={`text-[10px] font-bold ${step==="→"?"text-white/20":""}`} style={step!=="→"?{color:a.color,background:`${a.color}15`,padding:"2px 8px",borderRadius:4,border:`1px solid ${a.color}30`}:{}}>{step}</span>)}</div>
                {activeAutomation===i&&<div style={{ animation:"fadeIn .3s ease-out" }}><div className="text-xs text-white/40 mb-2">Condition: <span className="text-white/60">{a.condition}</span></div><div className="space-y-2 mb-3">{a.actions.map((act,ai)=><div key={ai} className="flex items-center gap-2 text-sm text-white/70"><div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ background:`${a.color}30`, color:a.color }}>{ai+1}</div>{act}</div>)}</div><div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background:`${a.color}15`, border:`1px solid ${a.color}30` }}><span style={{ color:a.color }}>✓</span><span className="text-xs font-semibold text-white">{a.outcome}</span></div></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CLIENT 360° ══ */}
      <section id="client360" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Client Management" title="One Customer. Every Detail. Zero Gaps." subtitle="The complete 360° customer view — every deal, conversation, task & document in one profile." color="#f97316" />
          <div className="mt-14">
            <div className="flex items-center justify-center mb-10"><div className="rounded-2xl p-6 text-center glass glow-indigo" style={{ minWidth:200 }}><div className="w-16 h-16 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl font-black" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)" }}>G</div><div className="font-black text-white">GlobalMart Inc</div><div className="text-xs text-indigo-400 mt-1">Enterprise Client</div><div className="flex gap-2 justify-center mt-3"><span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Active</span><span className="px-2 py-0.5 rounded-full text-[10px] bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">₹1.2L ARR</span></div></div></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[{icon:"💼",title:"3 Active Deals",sub:"₹2.4L in pipeline",color:"#6366f1"},{icon:"💬",title:"47 Messages",sub:"Last: 2 days ago",color:"#22c55e"},{icon:"✅",title:"12 Tasks",sub:"3 overdue",color:"#f97316"},{icon:"🎫",title:"2 Open Cases",sub:"1 high priority",color:"#ec4899"},{icon:"📄",title:"8 Documents",sub:"2 proposals, 6 contracts",color:"#8b5cf6"},{icon:"📅",title:"5 Meetings",sub:"Next: July 30",color:"#0ea5e9"},{icon:"🧾",title:"3 Invoices",sub:"₹45K outstanding",color:"#eab308"},{icon:"🔭",title:"Radar Origin",sub:"Found via Radar Analysis",color:"#a855f7"}].map((c,i)=>(
                <div key={i} className="rounded-xl p-4 glass glass-hover border" style={{ borderColor:`${c.color}20` }}><div className="text-xl mb-2">{c.icon}</div><div className="font-bold text-sm text-white">{c.title}</div><div className="text-xs text-white/40">{c.sub}</div></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ TASKS ══ */}
      <section id="tasks" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Tasks & Follow-ups" title="Never Miss an Opportunity Again" subtitle="Smart task management keeps your entire team on track — automatically." color="#eab308" />
          <div className="grid lg:grid-cols-2 gap-10 mt-14">
            <div className="space-y-3">
              {[{day:"Monday",action:"Lead contacted — TechNova",type:"Call",color:"#6366f1",done:true},{day:"Tuesday",action:"Follow-up email scheduled",type:"Email",color:"#a855f7",done:true},{day:"Thursday",action:"Reminder: No response from StartupXYZ",type:"Alert",color:"#f97316",done:false},{day:"Friday",action:"Proposal due — GlobalMart",type:"Task",color:"#ec4899",done:false},{day:"Next Monday",action:"Demo meeting scheduled",type:"Meeting",color:"#22c55e",done:false}].map((t,i)=>(
                <div key={i} className="flex items-center gap-4 p-4 rounded-xl glass border" style={{ borderColor:`${t.color}20`, animation:`slideInLeft .5s ease-out forwards`, animationDelay:`${i*.1}s`, opacity:0 }}>
                  <div className="w-2 self-stretch rounded-full" style={{ background:t.color }}/>
                  <div className="flex-1"><div className="text-xs text-white/30 mb-0.5">{t.day}</div><div className={`text-sm font-semibold ${t.done?"line-through text-white/30":"text-white"}`}>{t.action}</div></div>
                  <div className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background:`${t.color}20`, color:t.color }}>{t.type}</div>
                  {t.done&&<span className="text-emerald-400 text-sm">✓</span>}
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6 glass border border-white/05">
              <div className="text-sm font-bold text-white mb-4">Task Overview</div>
              <div className="grid grid-cols-2 gap-3 mb-6">{[{v:"24",l:"Total Tasks",c:"#6366f1"},{v:"8",l:"Due Today",c:"#f97316"},{v:"5",l:"Overdue",c:"#ef4444"},{v:"11",l:"Completed",c:"#22c55e"}].map((s,i)=><div key={i} className="rounded-xl p-3 text-center" style={{ background:`${s.c}10`, border:`1px solid ${s.c}20` }}><div className="text-2xl font-black" style={{ color:s.c }}>{s.v}</div><div className="text-xs text-white/40">{s.l}</div></div>)}</div>
              <div className="space-y-2">{[{l:"High Priority",v:30,c:"#ef4444"},{l:"Medium",v:45,c:"#f97316"},{l:"Low Priority",v:25,c:"#22c55e"}].map((b,i)=><div key={i}><div className="flex justify-between text-xs text-white/40 mb-1"><span>{b.l}</span><span>{b.v}%</span></div><div className="h-1.5 bg-white/5 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${b.v}%`, background:b.c }}/></div></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CASES ══ */}
      <section id="cases" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Cases & Support" title="Customer Issues. Resolved Fast." subtitle="Complete support lifecycle from issue creation to resolution — all linked to client history." color="#10b981" />
          <div className="grid lg:grid-cols-2 gap-10 mt-14 items-start">
            <div className="space-y-3">
              {[{n:"01",title:"Issue Reported",desc:"Customer submits support request",icon:"📝",color:"#6366f1"},{n:"02",title:"Case Created",desc:"CRM auto-generates a case record with ID",icon:"🎫",color:"#8b5cf6"},{n:"03",title:"Priority Assigned",desc:"High / Medium / Low based on impact",icon:"🔴",color:"#ec4899"},{n:"04",title:"Team Assigned",desc:"Auto-routing to available agent",icon:"👤",color:"#f97316"},{n:"05",title:"Investigation",desc:"Agent works the case, logs progress",icon:"🔍",color:"#eab308"},{n:"06",title:"Resolution Applied",desc:"Solution found & documented",icon:"💡",color:"#22c55e"},{n:"07",title:"Case Closed",desc:"History saved to customer timeline",icon:"✅",color:"#10b981"}].map((step,i)=>(
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl glass border" style={{ borderColor:`${step.color}20`, animation:`fadeInUp .4s ease-out forwards`, animationDelay:`${i*.08}s`, opacity:0 }}>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0" style={{ background:`${step.color}20`, color:step.color }}>{step.n}</div>
                  <div><div className="text-sm font-bold text-white">{step.icon} {step.title}</div><div className="text-xs text-white/40">{step.desc}</div></div>
                </div>
              ))}
            </div>
            <div className="rounded-2xl p-6 glass border border-white/08">
              <div className="flex items-center justify-between mb-4"><div><div className="text-xs text-white/30 mb-0.5">Case ID</div><div className="font-black text-white">#CASE-2026-0047</div></div><div className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">High Priority</div></div>
              <div className="space-y-3 mb-5">{[["Customer","GlobalMart Inc"],["Issue","Dashboard not loading on mobile"],["Agent","Priya S."],["Created","July 27, 2026"],["Status","🔄 In Progress"]].map(([k,v],i)=><div key={i} className="flex justify-between text-sm"><span className="text-white/40">{k}</span><span className="font-semibold text-white">{v}</span></div>)}</div>
              <div className="h-px bg-white/05 mb-4"/>
              <div className="text-xs text-white/30 mb-2">Resolution Progress</div>
              <div className="h-2 bg-white/05 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:"60%", background:"linear-gradient(to right,#6366f1,#22c55e)" }}/></div>
              <div className="text-xs text-white/30 mt-1 text-right">60% complete</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ ANALYTICS ══ */}
      <section id="analytics" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Reports & Analytics" title="Raw Data Into Business Intelligence." subtitle="Live KPIs, performance dashboards & trend analytics that update in real time." color="#0ea5e9" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-14 mb-12">
            {[{label:"Leads This Month",value:148,suffix:"",prefix:"",color:"#6366f1"},{label:"Conversion Rate",value:32,suffix:"%",prefix:"",color:"#22c55e"},{label:"Revenue Tracked",value:24,suffix:"L",prefix:"₹",color:"#f97316"},{label:"Tasks Completed",value:312,suffix:"",prefix:"",color:"#a855f7"}].map((k,i)=>(
              <div key={i} className="rounded-2xl p-6 text-center glass border" style={{ borderColor:`${k.color}20` }}><div className="text-4xl font-black mb-1" style={{ color:k.color }}><AnimatedCounter end={k.value} prefix={k.prefix} suffix={k.suffix}/></div><div className="text-xs text-white/40">{k.label}</div></div>
            ))}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-2xl p-6 glass border border-white/05"><div className="text-sm font-bold text-white mb-1">Lead Growth by Month</div><div className="text-xs text-white/30 mb-4">Jan — Jun 2026</div><AnimatedBarChart/></div>
            <div className="rounded-2xl p-6 glass border border-white/05">
              <div className="text-sm font-bold text-white mb-1">Pipeline by Stage</div><div className="text-xs text-white/30 mb-4">Current distribution</div>
              <div className="space-y-3">{[{stage:"New Lead",pct:35,color:"#6366f1"},{stage:"Contacted",pct:25,color:"#8b5cf6"},{stage:"Qualified",pct:18,color:"#a855f7"},{stage:"Proposal",pct:12,color:"#ec4899"},{stage:"Won ✓",pct:10,color:"#22c55e"}].map((s,i)=><div key={i}><div className="flex justify-between text-xs mb-1"><span className="text-white/60">{s.stage}</span><span style={{ color:s.color }}>{s.pct}%</span></div><div className="h-2 bg-white/05 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width:`${s.pct}%`, background:s.color, boxShadow:`0 0 8px ${s.color}88` }}/></div></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ AI ══ */}
      <section id="ai" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="AI Intelligence" title="The CRM That Thinks Ahead." subtitle="AI-powered tools embedded directly into your workflow — not bolted on as an afterthought." color="#a855f7" />
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {[{icon:"🤖",title:"AI Email Agent",desc:"Drafts personalized follow-up emails based on lead profile, conversation history & stage. Your team reviews & sends.",color:"#6366f1"},{icon:"📊",title:"Smart Lead Prioritization",desc:"Scores leads automatically based on engagement, response time & fit criteria. Your team focuses on what matters most.",color:"#a855f7"},{icon:"💡",title:"Suggested Next Actions",desc:"CRM recommends the best next action for every lead and deal — call, email, schedule meeting, or send proposal.",color:"#ec4899"},{icon:"🔭",title:"Radar Intelligence",desc:"AI-assisted prospect research identifies market gaps, competitor overlap & ideal customer profiles in your target area.",color:"#f97316"},{icon:"📝",title:"Auto-Summary & Notes",desc:"After every meeting or call, AI generates a structured summary that gets stored to the customer timeline instantly.",color:"#22c55e"},{icon:"📈",title:"Revenue Forecasting",desc:"Analyzes pipeline velocity, historical close rates & seasonality to predict monthly revenue with confidence intervals.",color:"#0ea5e9"}].map((ai,i)=>(
              <div key={i} className="rounded-2xl p-6 glass glass-hover border" style={{ borderColor:`${ai.color}20`, animation:`fadeInUp .5s ease-out forwards`, animationDelay:`${i*.1}s`, opacity:0 }}>
                <div className="text-3xl mb-4" style={{ filter:`drop-shadow(0 0 10px ${ai.color}88)` }}>{ai.icon}</div>
                <div className="font-black text-white mb-2">{ai.title}</div>
                <div className="text-sm text-white/50 leading-relaxed">{ai.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ JOURNEY ══ */}
      <section id="journey" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Complete Customer Journey" title="End-to-End. Automated. Intelligent." subtitle="Watch a single customer move through the entire CRM ecosystem from discovery to retention." color="#6366f1" />
          <div className="mt-14 overflow-x-auto pb-6 scrollbar-hide">
            <div className="flex gap-0" style={{ width:"max-content", margin:"0 auto" }}>
              {JOURNEY_STEPS.map((step,i)=>(
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center" style={{ animation:`fadeInUp .4s ease-out forwards`, animationDelay:`${i*.07}s`, opacity:0 }}>
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl mb-3 relative" style={{ background:`${step.color}22`, border:`2px solid ${step.color}44`, boxShadow:`0 0 20px ${step.color}33` }}>
                      <span>{step.icon}</span>
                      <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ background:step.color }}>{i+1}</div>
                    </div>
                    <div className="text-center" style={{ maxWidth:90 }}><div className="text-xs font-bold text-white leading-tight mb-0.5">{step.title}</div><div className="text-[10px] text-white/30">{step.subtitle}</div></div>
                  </div>
                  {i<JOURNEY_STEPS.length-1&&<div className="mx-2 flex items-center" style={{ marginTop:-24 }}><div className="w-6 h-px" style={{ background:`linear-gradient(to right,${step.color},${JOURNEY_STEPS[i+1].color})`, opacity:.4 }}/><div className="text-white/20 text-xs">›</div></div>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══ MODULES ══ */}
      <section id="modules" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="All Modules" title="21 Powerful Modules. One Platform." subtitle="Every tool your team needs — from lead capture to customer retention — built-in and connected." color="#8b5cf6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-14">
            {MODULES.map((m,i)=>(
              <div key={i} onClick={()=>setActiveModule(activeModule===i?null:i)} className="module-card rounded-2xl p-5 cursor-pointer transition-all glass-hover border" style={{ borderColor:activeModule===i?`${m.color}60`:`${m.color}15`, background:activeModule===i?`${m.color}12`:`${m.color}06`, boxShadow:activeModule===i?`0 0 30px ${m.color}20`:"none", animation:`fadeInUp .4s ease-out forwards`, animationDelay:`${i*.04}s`, opacity:0 }}>
                <div className="module-icon text-2xl mb-3" style={{ display:"inline-block" }}>{m.icon}</div>
                <div className="font-bold text-sm text-white mb-1">{m.name}</div>
                {activeModule===i?<div className="text-xs text-white/50 leading-relaxed" style={{ animation:"fadeIn .2s ease-out" }}>{m.desc}</div>:<div className="text-[10px]" style={{ color:m.color }}>Click to learn more →</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BEFORE / AFTER ══ */}
      <section id="beforeafter" className="py-28 px-4" style={{ background:"#080c1a" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Transformation" title="The Before vs After Your Business Deserves." subtitle="See the measurable difference a centralized, intelligent CRM makes for your team." />
          <div className="grid md:grid-cols-2 gap-8 mt-14">
            <div className="rounded-2xl p-8 border relative overflow-hidden" style={{ background:"rgba(17,17,40,.8)", borderColor:"rgba(239,68,68,.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 to-transparent"/>
              <div className="text-4xl mb-4">😓</div><div className="text-xl font-black text-white mb-6">Before CRM</div>
              <div className="space-y-4">{[["🗂️","Data in spreadsheets","Disorganized, error-prone, not shared"],["📞","Manual follow-ups","Inconsistent, forgotten, too late"],["🕳️","Lost leads","No system to track or recover them"],["👁️","No visibility","Management flying blind"],["📊","Manual reporting","Hours every week on data entry"],["🔌","Disconnected tools","Email here, notes there, tasks elsewhere"]].map(([icon,title,sub],i)=><div key={i} className="flex items-start gap-3"><span className="text-lg">{icon}</span><div><div className="text-sm font-semibold text-red-400">{title}</div><div className="text-xs text-white/30">{sub}</div></div></div>)}</div>
            </div>
            <div className="rounded-2xl p-8 border relative overflow-hidden" style={{ background:"rgba(5,40,25,.8)", borderColor:"rgba(34,197,94,.2)" }}>
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-transparent"/>
              <div className="text-4xl mb-4">🚀</div><div className="text-xl font-black text-white mb-6">With SERP HAWK CRM</div>
              <div className="space-y-4">{[["✅","Centralized customer data","One source of truth for every team member"],["⚡","Automated workflows","Follow-ups happen automatically, every time"],["🎯","Zero lead leakage","Every prospect tracked from day 1"],["📊","Real-time visibility","Live dashboards for leadership & teams"],["🤖","AI-powered reporting","Instant insights, zero manual work"],["🔗","Everything connected","Leads, deals, tasks, messages — unified"]].map(([icon,title,sub],i)=><div key={i} className="flex items-start gap-3"><span className="text-lg">{icon}</span><div><div className="text-sm font-semibold text-emerald-400">{title}</div><div className="text-xs text-white/30">{sub}</div></div></div>)}</div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ IMPACT ══ */}
      <section id="impact" className="py-28 px-4" style={{ background:"#0a0f1e" }}>
        <div className="max-w-screen-xl mx-auto">
          <SectionHeader badge="Business Impact" title="Measurable Results, Not Just Features." subtitle="The SERP HAWK CRM delivers tangible improvements across every dimension of your business." color="#22c55e" />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {[{icon:"⏰",metric:"80%",label:"Reduction in Manual Work",desc:"Automation handles repetitive tasks so your team focuses on closing.",color:"#6366f1"},{icon:"🎯",metric:"3×",label:"Faster Lead Response",desc:"Automated notifications ensure no lead waits more than minutes.",color:"#22c55e"},{icon:"📊",metric:"100%",label:"Follow-up Consistency",desc:"Every lead, every deal — followed up without exception.",color:"#a855f7"},{icon:"👁️",metric:"360°",label:"Customer Visibility",desc:"Every team member has the full picture at any moment.",color:"#0ea5e9"},{icon:"📈",metric:"2×",label:"Sales Productivity",desc:"Sales team spends time selling, not managing spreadsheets.",color:"#f97316"},{icon:"❤️",metric:"↑↑",label:"Customer Retention",desc:"Cases, follow-ups & satisfaction tracking keeps clients loyal.",color:"#ec4899"}].map((k,i)=>(
              <div key={i} className="rounded-2xl p-6 glass border glass-hover" style={{ borderColor:`${k.color}20` }}>
                <div className="text-3xl mb-3">{k.icon}</div>
                <div className="text-4xl font-black mb-1" style={{ color:k.color }}>{k.metric}</div>
                <div className="font-bold text-white mb-2">{k.label}</div>
                <div className="text-sm text-white/40 leading-relaxed">{k.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section className="py-32 px-4 text-center relative overflow-hidden" style={{ background:"#080c1a" }}>
        <div className="absolute inset-0" style={{ background:"radial-gradient(ellipse 70% 60% at 50% 50%,rgba(99,102,241,.12) 0%,transparent 70%)" }}/>
        <div className="relative max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-3xl mx-auto mb-8 flex items-center justify-center text-4xl" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 0 60px rgba(99,102,241,.5)", animation:"float 3s ease-in-out infinite" }}>🦅</div>
          <h2 className="text-5xl font-black mb-4 gradient-text" style={{ letterSpacing:"-0.03em" }}>Ready to See It in Action?</h2>
          <p className="text-lg text-white/50 mb-10 leading-relaxed">The SERP HAWK CRM is live and ready for your team. Experience the full power of an intelligent, automated CRM platform built for modern businesses.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="/login" className="px-8 py-4 rounded-xl font-bold text-white text-lg glow-indigo" style={{ background:"linear-gradient(135deg,#6366f1,#a855f7)", boxShadow:"0 4px 30px rgba(99,102,241,.4)" }}>🚀 Launch the CRM</a>
            <a href="https://wa.me/919502901416?text=Hi,%20I'd%20like%20to%20book%20a%20live%20CRM%20demo" target="_blank" rel="noopener noreferrer" className="px-8 py-4 rounded-xl font-bold text-white text-lg glass glass-hover" style={{ border:"1px solid rgba(99,102,241,.3)", color:"#a5b4fc" }}>📱 Book a Live Demo</a>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-6 text-sm text-white/25">
            {["21 CRM Modules","AI-Powered","Dual Currency (INR / MXN)","WhatsApp Integrated","Fully Automated"].map((f,i)=><span key={i} className="flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-indigo-500"/>{f}</span>)}
          </div>
        </div>
      </section>

      <div className="py-6 px-4 text-center border-t" style={{ borderColor:"rgba(255,255,255,.05)" }}>
        <div className="text-xs text-white/20">© 2026 SERP HAWK CRM · Premium CRM Platform · Built for intelligent customer relationship management</div>
      </div>
    </div>
  );
}
