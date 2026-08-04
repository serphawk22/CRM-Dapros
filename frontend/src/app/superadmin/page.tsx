"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useRole } from "../../context/RoleContext";

export default function SuperAdminPage() {
  const { user } = useRole();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [analyzing, setAnalyzing] = useState<number | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  useEffect(() => {
    if (user && user.email !== "admin@serphawk.com") {
      window.location.href = "/";
      return;
    }
    fetch(`${API_BASE_URL}/superadmin/tenants`)
      .then(res => res.json())
      .then(data => {
        setTenants(data);
        setLoading(false);
      });
  }, []);

  const handleAnalyze = async (id: number) => {
    setAnalyzing(id);
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      setAnalysisResult({ ...data, tenantId: id });
    } catch (e: any) {
      alert("Error analyzing tenant.");
    } finally {
      setAnalyzing(null);
    }
  };

  if (user && user.email !== "admin@serphawk.com") return null;

  if (loading) return <div className="p-8">Loading Telemetry Data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans relative">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SuperAdmin Telemetry</h1>
          <p className="text-gray-500 mt-2">Master view of all SaaS Trial Accounts and API Usage.</p>
        </div>
        <div className="text-sm bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300">
          Total Tenants: <strong>{tenants.length}</strong>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map(t => (
          <div key={t.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{t.name}</h3>
                <p className="text-xs text-gray-500">{t.email}</p>
              </div>
              {t.is_trial ? (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium">Trial</span>
              ) : (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">Active</span>
              )}
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Users</span>
                <span className="font-medium">{t.users}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">Clients (Usage/Limit)</span>
                <span className="font-medium">{t.usage_clients} / {t.limit_clients}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-gray-100 dark:border-gray-800 pb-2">
                <span className="text-gray-500">AI Emails Gen</span>
                <span className="font-medium">{t.usage_emails} / {t.limit_emails}</span>
              </div>
            </div>

            <button 
              onClick={() => handleAnalyze(t.id)}
              disabled={analyzing === t.id}
              className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {analyzing === t.id ? "Analyzing AI Telemetry..." : "Run AI Analysis"}
            </button>
          </div>
        ))}
      </div>

      {/* Detailed Analysis Modal */}
      {analysisResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Detailed Tenant Analysis</h2>
              <button 
                onClick={() => setAnalysisResult(null)}
                className="text-gray-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="mb-8 bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-semibold text-lg text-blue-900 dark:text-blue-300">AI Sales Strategy</h3>
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-sm">
                    Conversion Score: {analysisResult.conversion_score}/100
                  </div>
                </div>
                <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">{analysisResult.insight}</p>
              </div>

              <h3 className="font-bold text-lg mb-4 text-gray-900 dark:text-white">Page Utilization (Telemetry)</h3>
              {analysisResult.page_stats?.length > 0 ? (
                <div className="overflow-hidden border border-gray-200 dark:border-gray-800 rounded-xl">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500">
                      <tr>
                        <th className="px-6 py-4 font-medium">Page Path</th>
                        <th className="px-6 py-4 font-medium">Total Time Spent</th>
                        <th className="px-6 py-4 font-medium">Total Visits</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {analysisResult.page_stats.map((stat: any, idx: number) => (
                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-100">{stat.path}</td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                            {stat.time_spent > 60 ? `${Math.floor(stat.time_spent / 60)}m ${stat.time_spent % 60}s` : `${stat.time_spent}s`}
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{stat.visits} visits</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                  <p className="text-gray-500">No telemetry data recorded yet for this tenant.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
