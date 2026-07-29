"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "../../config";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", business_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Signup failed");
      }
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white selection:bg-white selection:text-black">
      <div className="max-w-md w-full p-8 relative z-10">
        <div className="absolute inset-0 bg-white/5 blur-3xl -z-10 rounded-full" />
        <h1 className="text-3xl font-light tracking-tighter mb-2">Start your Free Trial.</h1>
        <p className="text-gray-400 mb-8 font-light text-sm">Create an account to unlock intelligent CRM capabilities.</p>
        
        {success ? (
          <div className="p-4 bg-green-900/30 border border-green-500/30 text-green-400 rounded-lg text-sm text-center">
            Account created successfully! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg text-sm">{error}</div>}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Full Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 transition-colors font-light" placeholder="John Doe" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Phone</label>
                <input required type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 transition-colors font-light" placeholder="+1 234 567 890" />
              </div>
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Business Name</label>
              <input required type="text" value={form.business_name} onChange={e => setForm({...form, business_name: e.target.value})} className="w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 transition-colors font-light" placeholder="Acme Corp" />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Email</label>
              <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 transition-colors font-light" placeholder="john@example.com" />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-1">Password</label>
              <input required type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 transition-colors font-light" placeholder="••••••••" />
            </div>

            <button disabled={loading} type="submit" className="w-full py-4 mt-8 bg-white text-black font-semibold tracking-wide hover:bg-gray-200 transition-colors disabled:opacity-50">
              {loading ? "CREATING ACCOUNT..." : "START FREE TRIAL"}
            </button>
            <div className="text-center mt-6">
              <a href="/login" className="text-xs text-gray-500 hover:text-white transition-colors">Already have an account? Log in.</a>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
