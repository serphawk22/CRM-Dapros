"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Activity, Search, Filter, Server, Users, Database, 
  ChevronLeft, ChevronRight, Eye, RefreshCw, X
} from "lucide-react";
import { API_BASE_URL } from "@/config";
import { useRole } from "@/context/RoleContext";

interface AuditLog {
  id: number;
  tenant_id: number;
  user_id: number;
  user_email: string;
  user_name: string;
  table_name: string;
  record_id: number;
  action: string;
  changes: string | null;
  timestamp: string;
}

export default function TelemetryDashboard() {
  const { user } = useRole();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [search, setSearch] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const res = await fetch(`${API_BASE_URL}/telemetry/audit-logs?limit=${limit}&offset=${offset}`, {
        headers: {
          "X-Tenant-ID": user?.tenant_id?.toString() || ""
        }
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotalCount(data.total_count || 0);
    } catch (err) {
      console.error("Failed to fetch telemetry", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchLogs();
  }, [page, user?.tenant_id]);

  const filteredLogs = logs.filter(log => 
    log.user_email.toLowerCase().includes(search.toLowerCase()) || 
    log.table_name.toLowerCase().includes(search.toLowerCase()) ||
    log.action.toLowerCase().includes(search.toLowerCase())
  );

  const getActionColor = (action: string) => {
    switch (action.toUpperCase()) {
      case 'CREATE': return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'UPDATE': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'DELETE': return 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20';
    }
  };

  const totalPages = Math.ceil(totalCount / limit);

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
            <p className="text-sm text-slate-500 dark:text-zinc-400">Monitor system-wide data mutations and user activity</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={fetchLogs}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl text-sm font-semibold text-slate-700 dark:text-zinc-300 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-all shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Database className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Total Mutations</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">{totalCount.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
            <Users className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">Unique Actors</p>
            <h3 className="text-2xl font-bold text-slate-800 dark:text-zinc-100">Tracking</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
            <Server className="w-6 h-6 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-zinc-400">System Status</p>
            <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">Healthy</h3>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex flex-col sm:flex-row gap-3 justify-between items-center bg-slate-50/50 dark:bg-zinc-900/50">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Filter by user, table, or action..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-700 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-zinc-100"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-zinc-400 font-medium">
            <Filter className="w-4 h-4" />
            <span>Showing {filteredLogs.length} logs</span>
          </div>
        </div>

        {/* Table Content */}
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
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 animate-pulse mx-auto mb-3 opacity-50" />
                    Loading telemetry data...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.02 }}
                    key={log.id} 
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-slate-500 dark:text-zinc-400 text-xs font-medium">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-zinc-700 flex items-center justify-center text-[10px] font-bold text-slate-600 dark:text-zinc-300">
                          {log.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">{log.user_name}</span>
                          <span className="text-[10px] text-slate-500">{log.user_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black tracking-wide border ${getActionColor(log.action)}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-medium text-slate-700 dark:text-zinc-300 text-xs">
                      {log.table_name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap font-mono text-xs text-slate-500 dark:text-zinc-400">
                      #{log.record_id}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <button 
                        onClick={() => setSelectedLog(log)}
                        disabled={!log.changes || log.changes === "{}"}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                        title="View payload"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between bg-slate-50/50 dark:bg-zinc-900/50">
          <p className="text-xs font-medium text-slate-500 dark:text-zinc-400">
            Showing <span className="font-bold text-slate-700 dark:text-zinc-200">{filteredLogs.length}</span> of <span className="font-bold text-slate-700 dark:text-zinc-200">{totalCount}</span> entries
          </p>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-slate-600 dark:text-zinc-300"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-600 dark:text-zinc-300 px-2">
              Page {page} of {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-white dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors text-slate-600 dark:text-zinc-300"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-zinc-900 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-zinc-800"
          >
            <div className="p-4 border-b border-slate-200 dark:border-zinc-800 flex justify-between items-center bg-slate-50 dark:bg-zinc-900/50">
              <h3 className="font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
                <Server className="w-4 h-4 text-blue-500" />
                Change Payload
              </h3>
              <button 
                onClick={() => setSelectedLog(null)}
                className="p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Target</p>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.table_name} #{selectedLog.record_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider mb-1">Action</p>
                  <p className="font-semibold text-slate-800 dark:text-zinc-200">{selectedLog.action}</p>
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-sm">
                <pre className="text-green-400 font-mono">
                  {selectedLog.changes 
                    ? JSON.stringify(JSON.parse(selectedLog.changes), null, 2)
                    : "No specific column changes tracked."}
                </pre>
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50 text-right">
              <button 
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-colors shadow-md"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
