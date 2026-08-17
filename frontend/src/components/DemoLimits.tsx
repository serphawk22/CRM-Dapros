import React, { useState, useEffect } from "react";
import { useRole } from "@/context/RoleContext";
import { API_BASE_URL } from "@/config";
import { AlertTriangle, ArrowUpCircle, CheckCircle2 } from "lucide-react";

interface DemoLimitsProps {
  type: "clients" | "emails" | "searches" | "projects";
}

export default function DemoLimits({ type }: DemoLimitsProps) {
  const { user } = useRole();
  const [limits, setLimits] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [upgraded, setUpgraded] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  useEffect(() => {
    if (user?.role !== "Demo") {
      setLoading(false);
      return;
    }

    const fetchLimits = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/demo/limits`, {
          headers: { "X-Tenant-ID": user?.tenant_id?.toString() || "" }
        });
        const data = await res.json();
        if (data.success) {
          setLimits(data.limits);
        }
      } catch (err) {}
      setLoading(false);
    };

    fetchLimits();
  }, [user]);

  if (user?.role !== "Demo" || loading || !limits) return null;

  const currentLimit = limits[type];
  if (!currentLimit) return null;

  const percentage = (currentLimit.usage / currentLimit.limit) * 100;
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/demo/upgrade`, {
        method: "POST",
        headers: { "X-Tenant-ID": user?.tenant_id?.toString() || "" }
      });
      if (res.ok) {
        setUpgraded(true);
      }
    } catch (err) {}
    setUpgrading(false);
  };

  return (
    <div className={`p-4 rounded-xl border ${isAtLimit ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30' : isNearLimit ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30' : 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700'} flex flex-col md:flex-row items-center justify-between gap-4 mb-6 shadow-sm`}>
      <div className="flex items-center gap-4 w-full">
        <div className={`p-2 rounded-full ${isAtLimit ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : isNearLimit ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'}`}>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className={`text-sm font-bold ${isAtLimit ? 'text-red-800 dark:text-red-300' : isNearLimit ? 'text-amber-800 dark:text-amber-300' : 'text-slate-800 dark:text-slate-200'}`}>
            Demo Account Limitation ({type.charAt(0).toUpperCase() + type.slice(1)})
          </h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
            You have used {currentLimit.usage} out of your {currentLimit.limit} allowed {type}.
          </p>
          <div className="mt-2 w-full max-w-xs h-1.5 bg-slate-200 dark:bg-zinc-700 rounded-full overflow-hidden">
            <div 
              className={`h-full ${isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-blue-500'} transition-all`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="flex-shrink-0 w-full md:w-auto">
        {upgraded ? (
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-50 dark:bg-green-900/20 px-4 py-2 rounded-lg border border-green-200 dark:border-green-900/30">
            <CheckCircle2 className="w-4 h-4" />
            Upgrade Requested!
          </div>
        ) : (
          <button 
            onClick={handleUpgrade}
            disabled={upgrading}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50"
          >
            {upgrading ? "Sending..." : (
              <>
                <ArrowUpCircle className="w-4 h-4" />
                Upgrade Now
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
