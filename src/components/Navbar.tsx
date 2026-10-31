import React, { useState } from 'react';
import {
  Menu,
  ShieldCheck,
  RotateCcw,
  UserCheck,
  ChevronDown,
  Sparkles,
  Zap,
  Building,
  LogOut,
} from 'lucide-react';
import { useSolar } from '../context/SolarContext';
import { UserRole } from '../types/solar';

interface NavbarProps {
  onToggleMobileMenu: () => void;
  onNavigate: (viewId: string) => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleMobileMenu, onNavigate, onLogout }) => {
  const { currentUser, switchRole, resetToDemoData, users, settings } = useSolar();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const rolesList: { role: UserRole; label: string; desc: string }[] = [
    { role: 'admin', label: 'Admin / Director', desc: 'Rajesh Sharma • Full ERP access & financial margins' },
    { role: 'sales_executive', label: 'Sales Executive', desc: 'Priya Sundaram • Leads, quotations, proposals' },
    { role: 'survey_technician', label: 'Survey Technician', desc: 'Amit Patel • Site surveys, roof azimuth, tilt' },
    { role: 'warehouse_manager', label: 'Warehouse Manager', desc: 'Vikram Verma • Stock, serial barcode scanning' },
    { role: 'installation_technician', label: 'Installation Crew Lead', desc: 'Karthik Reddy • Checklists, Voc/Isc, digital sign' },
    { role: 'service_technician', label: 'Service Technician', desc: 'Suresh Menon • Complaints, warranty lookup, fault codes' },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between z-20 shrink-0">
      {/* Left: Mobile hamburger & Organization Tag */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="text-xs">
            <span className="font-bold text-slate-900">{settings.companyName}</span>
            <span className="hidden sm:inline text-slate-400 ml-1.5">• Delhi NCR HQ</span>
          </div>
        </div>

        {/* Demo Mode Badge */}
        <div className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          Demo Mode: Active (Local Storage Persistent)
        </div>
      </div>

      {/* Right Controls: Role Switcher & Reset Button */}
      <div className="flex items-center gap-2.5">
        {/* Reset Demo Data Button */}
        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-800 hover:bg-amber-50 hover:border-amber-300 text-xs font-semibold transition-colors cursor-pointer"
          title="Reset database to initial 10 customers, 5 quotes, 5 orders"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-600" />
          <span>Reset Demo Data</span>
        </button>

        {/* 1-Click Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-900 text-xs font-semibold transition-colors cursor-pointer"
          >
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <div className="text-left hidden sm:block">
              <span className="block leading-tight capitalize text-[11px] text-slate-500">
                Switch Role ({currentUser.role.replace('_', ' ')})
              </span>
              <span className="font-bold text-slate-900 leading-tight block">{currentUser.name}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 border-b border-slate-100 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Switch Active User Role (Demo Mode)
              </div>
              <div className="max-h-72 overflow-y-auto">
                {rolesList.map((r) => {
                  const isSelected = currentUser.role === r.role;
                  return (
                    <button
                      key={r.role}
                      onClick={() => {
                        switchRole(r.role);
                        setIsRoleDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 hover:bg-slate-50 transition-colors flex items-start gap-2 cursor-pointer ${
                        isSelected ? 'bg-emerald-50/70 border-l-3 border-emerald-600' : ''
                      }`}
                    >
                      <div className="flex-1">
                        <div className="font-bold text-slate-900">{r.label}</div>
                        <div className="text-[11px] text-slate-500">{r.desc}</div>
                      </div>
                      {isSelected && <span className="text-emerald-600 font-bold">✓</span>}
                    </button>
                  );
                })}
              </div>

              {onLogout && (
                <div className="p-1.5 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setIsRoleDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 font-semibold transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out to Login Screen
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Sign Out Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors cursor-pointer"
            title="Sign Out to Login Dashboard"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-xs space-y-4 border border-slate-200">
            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">Reset Demo ERP Data?</h3>
              <p className="text-slate-500 mt-1">
                This will reload fresh sample records (10 customers, 6 site surveys, 5 accepted quotations, 5 orders, 30 serials, active warranties).
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="flex-1 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  resetToDemoData();
                  setIsResetConfirmOpen(false);
                }}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
