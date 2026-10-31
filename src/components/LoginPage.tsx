import React, { useState } from 'react';
import {
  Sun,
  ShieldCheck,
  UserCheck,
  ArrowRight,
  Lock,
  Mail,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Zap,
  TrendingUp,
  Boxes,
  Wrench,
  CheckCircle2,
} from 'lucide-react';
import { useSolar } from '../context/SolarContext';
import { UserRole } from '../types/solar';

interface LoginPageProps {
  onSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess }) => {
  const { login, switchRole } = useSolar();

  const [email, setEmail] = useState('demo@sunflow.ai');
  const [password, setPassword] = useState('SunFlowDemo@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFillDemoCredentials = () => {
    setEmail('demo@sunflow.ai');
    setPassword('SunFlowDemo@123');
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Validate demo credentials or allowed emails
      if (
        (email.toLowerCase() === 'demo@sunflow.ai' && password === 'SunFlowDemo@123') ||
        email.toLowerCase().includes('@sunpower.com') ||
        email.toLowerCase().includes('@sunflow.ai')
      ) {
        login(email, 'admin');
        if (rememberMe) {
          localStorage.setItem('sunflow_auth_session', 'true');
        }
        setIsLoading(false);
        onSuccess();
        return;
      }

      setIsLoading(false);
      setError('Invalid credentials. Please use demo@sunflow.ai / SunFlowDemo@123 or select a role below.');
    }, 400);
  };

  const handleQuickRoleLogin = (role: UserRole) => {
    switchRole(role);
    if (rememberMe) {
      localStorage.setItem('sunflow_auth_session', 'true');
    }
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans">
      {/* Background ambient solar glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl w-full bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
        {/* Left Side: Brand & Solar Operations Showcase */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 sm:p-10 flex flex-col justify-between text-white border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg ring-4 ring-emerald-500/20">
                ☀️
              </div>
              <div>
                <span className="text-xl font-black tracking-tight text-white block">
                  SunFlow <span className="text-emerald-400">AI</span>
                </span>
                <span className="text-xs text-emerald-300 font-medium tracking-wide uppercase">
                  SunPower Solutions ERP
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h2 className="text-lg font-bold text-slate-100 leading-snug">
                Unified Rooftop Solar Operations & Lifecycle ERP
              </h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                Seamless end-to-end management for leads, technical surveys, automated BOM quotations, serial dispatch, commissioning, and warranty service.
              </p>
            </div>

            {/* Quick Operational Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Monthly Capacity</span>
                <span className="text-base font-bold text-emerald-400 mt-0.5 block">~40 Projects</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Field Crew</span>
                <span className="text-base font-bold text-amber-400 mt-0.5 block">15 Technicians</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Systems Sold</span>
                <span className="text-base font-bold text-slate-200 mt-0.5 block">1 kW – 5 kW</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
                <span className="text-[10px] text-slate-400 block font-medium">Govt. Subsidy</span>
                <span className="text-base font-bold text-emerald-300 mt-0.5 block">PM Surya Ghar</span>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Role-Based Access Control
            </span>
            <span className="font-mono text-slate-500">v2.4.0</span>
          </div>
        </div>

        {/* Right Side: Login Form & Role Switcher */}
        <div className="lg:col-span-7 bg-white p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-slate-900 tracking-tight">Sign In to Dashboard</h3>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Authorized Staff
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Enter your SunFlow employee credentials to access operational records.
            </p>
          </div>

          {/* Preset Demo Credentials Quick Fill Banner */}
          <div className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[11px] font-bold text-emerald-900 block flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Demo Credentials Ready:
              </span>
              <div className="font-mono text-xs text-emerald-800 font-semibold">
                Email: <span className="underline">demo@sunflow.ai</span> • Pass: <span className="underline">SunFlowDemo@123</span>
              </div>
            </div>
            <button
              type="button"
              onClick={handleFillDemoCredentials}
              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              Auto-Fill
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">
                Staff Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@sunflow.ai"
                  className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 text-xs font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-slate-700 font-semibold">Staff Password</label>
                <span className="text-[11px] text-slate-400">Encrypted</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="SunFlowDemo@123"
                  className="w-full pl-10 pr-10 py-2.5 border border-slate-300 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 text-slate-900 text-xs font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                />
                <span>Remember this terminal</span>
              </label>
              <button
                type="button"
                onClick={handleFillDemoCredentials}
                className="text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
              >
                Reset to default demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs shadow-md hover:shadow-lg cursor-pointer flex items-center justify-center gap-2 transition-all mt-2"
            >
              {isLoading ? (
                <span>Authenticating with SunFlow ERP...</span>
              ) : (
                <>
                  <span>Sign In to Solar Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* 1-Click Role Direct Launch Matrix */}
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block text-center">
              Or 1-Click Access by Role Persona
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { role: 'admin', label: 'Admin / Director', name: 'Rajesh S.' },
                { role: 'sales_executive', label: 'Sales Exec', name: 'Priya S.' },
                { role: 'survey_technician', label: 'Survey Tech', name: 'Amit P.' },
                { role: 'warehouse_manager', label: 'Warehouse Mgr', name: 'Vikram V.' },
                { role: 'installation_technician', label: 'Install Lead', name: 'Karthik R.' },
                { role: 'service_technician', label: 'Service Tech', name: 'Suresh M.' },
              ].map((item) => (
                <button
                  key={item.role}
                  type="button"
                  onClick={() => handleQuickRoleLogin(item.role as UserRole)}
                  className="p-2 text-left rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-700 hover:text-emerald-800 font-medium transition-all cursor-pointer group"
                >
                  <div className="font-bold text-[11px] text-slate-900 group-hover:text-emerald-700 truncate">
                    {item.label}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">{item.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
