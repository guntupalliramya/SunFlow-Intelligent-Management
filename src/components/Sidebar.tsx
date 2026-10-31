import React from 'react';
import {
  LayoutDashboard,
  Users,
  Compass,
  FileText,
  FileCheck,
  Boxes,
  Truck,
  Wrench,
  ShieldCheck,
  AlertOctagon,
  TrendingUp,
  Sparkles,
  Settings as SettingsIcon,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Sun,
  Award,
  LogOut,
} from 'lucide-react';
import { useSolar } from '../context/SolarContext';

interface SidebarProps {
  currentView: string;
  onSelectView: (viewId: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isCollapsed,
  onToggleCollapse,
  onLogout,
}) => {
  const { dashboardStats, currentUser } = useSolar();

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    {
      id: 'customers',
      label: 'Customers & Leads',
      icon: Users,
      badge: dashboardStats.newEnquiries > 0 ? `${dashboardStats.newEnquiries}` : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'surveys', label: 'Site Surveys', icon: Compass },
    { id: 'quotations', label: 'Quotations & BOM', icon: FileText },
    { id: 'orders', label: 'Orders & Payments', icon: FileCheck },
    {
      id: 'inventory',
      label: 'Inventory Catalog',
      icon: Boxes,
      badge:
        dashboardStats.lowStockProductsCount > 0
          ? `${dashboardStats.lowStockProductsCount}`
          : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    { id: 'dispatch', label: 'Serial & Dispatch', icon: Truck },
    {
      id: 'installations',
      label: 'Installations',
      icon: Wrench,
      badge:
        dashboardStats.installationsPending > 0
          ? `${dashboardStats.installationsPending}`
          : undefined,
      badgeColor: 'bg-purple-100 text-purple-800',
    },
    { id: 'warranty', label: 'Warranty Register', icon: ShieldCheck },
    {
      id: 'service',
      label: 'Service Tickets',
      icon: AlertOctagon,
      badge:
        dashboardStats.openServiceTicketsCount > 0
          ? `${dashboardStats.openServiceTicketsCount}`
          : undefined,
      badgeColor: 'bg-rose-100 text-rose-800',
    },
    { id: 'finance', label: 'Finance & Reports', icon: TrendingUp },
    {
      id: 'ai',
      label: 'SunFlow AI Copilot',
      icon: Sparkles,
      highlight: true,
    },
    {
      id: 'overview',
      label: 'Demo Walkthrough',
      icon: Award,
    },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`bg-slate-900 text-slate-300 transition-all duration-300 flex flex-col shrink-0 border-r border-slate-800 relative z-30 ${
        isCollapsed ? 'w-18' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div
          onClick={() => onSelectView('dashboard')}
          className="flex items-center gap-3 cursor-pointer overflow-hidden"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
            ☀️
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <span className="font-black text-white text-base tracking-tight block">
                SunFlow <span className="text-emerald-400">AI</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium block -mt-0.5">
                Solar ERP Suite
              </span>
            </div>
          )}
        </div>

        <button
          onClick={onToggleCollapse}
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-xs">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all cursor-pointer group ${
                isActive
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : item.highlight
                  ? 'bg-emerald-950/60 text-emerald-300 hover:bg-emerald-900/60 border border-emerald-500/20'
                  : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isActive
                    ? 'text-white'
                    : item.highlight
                    ? 'text-emerald-400'
                    : 'text-slate-400 group-hover:text-emerald-400'
                }`}
              />
              {!isCollapsed && (
                <div className="flex-1 flex items-center justify-between truncate">
                  <span className="truncate">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`ml-2 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </nav>

      {/* Active User Mini Box at bottom */}
      {!isCollapsed ? (
        <div className="p-3 border-t border-slate-800 bg-slate-950/40">
          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 border border-slate-700/50">
            <div className="flex items-center gap-2.5 truncate">
              <img
                src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover shrink-0 border border-emerald-400/40"
              />
              <div className="truncate text-left text-xs">
                <div className="font-bold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-emerald-400 font-semibold capitalize truncate">
                  {currentUser.role.replace('_', ' ')}
                </div>
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded text-slate-400 hover:text-red-400 hover:bg-slate-700/60 transition-colors cursor-pointer shrink-0"
                title="Sign Out to Login Screen"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="p-2 border-t border-slate-800 flex flex-col items-center gap-2">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=128&q=80'}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover border border-emerald-400/40"
            title={`${currentUser.name} (${currentUser.role})`}
          />
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}
    </aside>
  );
};
