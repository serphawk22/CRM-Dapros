"use client";
import React, { useEffect, useState } from "react";
import { API_BASE_URL } from "../../config";
import { useRole } from "../../context/RoleContext";

export default function SuperAdminPage() {
  const { user } = useRole();
  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_BASE_URL}/superadmin/tenants`)
      .then(res => res.json())
      .then(data => {
        setTenants(data);
        setLoading(false);
      });
  }, []);

  const handleAnalyze = async (id: number) => {
    try {
      const res = await fetch(`${API_BASE_URL}/superadmin/tenants/${id}/analyze`, { method: "POST" });
      const data = await res.json();
      alert(`AI Insight: ${data.insight}\n\nConversion Score: ${data.conversion_score}/100`);
    } catch (e: any) {
      alert("Error analyzing tenant.");
    }
  };

  if (loading) return <div className="p-8">Loading Telemetry Data...</div>;

  return (
    <div className="p-8 max-w-6xl mx-auto font-sans">
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
              className="w-full bg-black dark:bg-white text-white dark:text-black py-2 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
            >
              Run AI Analysis
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
