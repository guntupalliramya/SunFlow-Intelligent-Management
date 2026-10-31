import React from 'react';
import {
  Sun,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Users,
  Compass,
  FileText,
  FileCheck,
  CreditCard,
  Truck,
  Wrench,
  TrendingUp,
  Sparkles,
  Award,
} from 'lucide-react';
import { useSolar } from '../../context/SolarContext';

interface ProjectOverviewViewProps {
  onNavigate: (viewId: string) => void;
}

export const ProjectOverviewView: React.FC<ProjectOverviewViewProps> = ({ onNavigate }) => {
  const { switchRole } = useSolar();

  const workflowSteps = [
    {
      num: 1,
      title: 'Customer Enquiry & Lead Capture',
      role: 'Sales Executive',
      icon: Users,
      desc: 'Capture residential / commercial solar requirements, monthly power bill, and duplicate phone number verification.',
      targetView: 'customers',
    },
    {
      num: 2,
      title: 'Site Survey & Feasibility Approval',
      role: 'Survey Technician',
      icon: Compass,
      desc: 'Inspect roof structure, shadow-free area (sq. ft.), azimuth/tilt angles, and grid suitability. Approval gate unlocks quotations.',
      targetView: 'surveys',
    },
    {
      num: 3,
      title: 'Configurable BOM Quotation & Subsidy',
      role: 'Sales Executive',
      icon: FileText,
      desc: 'Select approved survey and 1kW–5kW package. Automated Bill of Materials, 12% GST, and PM Surya Ghar subsidy deduction.',
      targetView: 'quotations',
    },
    {
      num: 4,
      title: 'Sales Order & Advance Payment Gate',
      role: 'Admin / Director',
      icon: CreditCard,
      desc: 'Accept quotation to generate sales order. Record milestone payments. Enforce minimum 40% advance before dispatch.',
      targetView: 'orders',
    },
    {
      num: 5,
      title: 'Serial Number Barcode Dispatch',
      role: 'Warehouse Manager',
      icon: Truck,
      desc: 'Scan 1D/2D barcodes or enter serials for inverters, batteries, and panels. Prevent duplicate serials and deduct stock.',
      targetView: 'dispatch',
    },
    {
      num: 6,
      title: 'Field Installation & Testing Telemetry',
      role: 'Installation Technician',
      icon: Wrench,
      desc: 'Complete 6 mandatory structural checks, 3 safety rules, Voc/Isc electrical testing, power kW verification, and customer signature.',
      targetView: 'installations',
    },
    {
      num: 7,
      title: 'Automatic Warranty Activation',
      role: 'System / Operations',
      icon: ShieldCheck,
      desc: 'Instantly activates manufacturer warranties linked to serial numbers upon completion with audit trail adjustments.',
      targetView: 'warranty',
    },
    {
      num: 8,
      title: 'Warranty-Based Complaint Resolution',
      role: 'Service Technician',
      icon: Zap,
      desc: 'Log service tickets. System automatically verifies active warranty (₹0 for parts & labor) or generates paid service quote.',
      targetView: 'service',
    },
    {
      num: 9,
      title: 'Project Profitability & Margin Accounting',
      role: 'Admin / Director',
      icon: TrendingUp,
      desc: 'Live financial margin calculation: Project Profit = Revenue - (BOM Material Cost + Labour + Operational Expenses).',
      targetView: 'finance',
    },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-8 rounded-2xl text-white shadow-xl relative overflow-hidden border border-emerald-500/20">
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
            <Sun className="w-4 h-4 text-amber-400" />
            Hackathon Production Demonstration
          </div>

          <h1 className="text-3xl font-black tracking-tight text-white">
            SunFlow AI – Solar Installation Management System
          </h1>

          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            The unified enterprise software platform for <strong>SunPower Solutions</strong>, built to replace fragmented WhatsApp enquiries, manual paper quotes, un-tracked serial numbers, and paper warranty cards for residential and commercial rooftop solar installations (1 kW to 5 kW On-Grid & Off-Grid).
          </p>

          <div className="flex flex-wrap gap-3 pt-2 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              ⚡ <strong>Target Volume:</strong> ~40 Projects / Month
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              👷 <strong>Field Force:</strong> 15 Technicians & Crew
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-white/10 backdrop-blur-xs border border-white/10">
              🔋 <strong>System Capacities:</strong> 1 kW to 5 kW On-Grid / Off-Grid / Hybrid
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              ✨ <strong>Demo Credentials:</strong> demo@sunflow.ai / SunFlowDemo@123
            </div>
          </div>
        </div>
      </div>

      {/* 5-7 Minute Demonstration Flow Roadmap */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              5–7 Minute Live Demonstration Walkthrough
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Follow this step-by-step checklist to showcase the end-to-end solar ERP cycle to judges.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            9 Connected Workflows
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {workflowSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.num}
                className="p-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/40 hover:border-emerald-300 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                      {step.num}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {step.role}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Icon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{step.title}</span>
                  </h3>

                  <p className="text-[11px] text-slate-600 leading-normal">{step.desc}</p>
                </div>

                <button
                  onClick={() => onNavigate(step.targetView)}
                  className="mt-3.5 inline-flex items-center justify-between w-full text-xs font-bold text-emerald-700 hover:text-emerald-800 pt-2 border-t border-slate-200 cursor-pointer"
                >
                  <span>Test this step</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Role-Based Testing Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900">
          Role-Based Access Control (RBAC) Switcher
        </h3>
        <p className="text-xs text-slate-500">
          Click any role below to instantly switch active credentials and test view permissions:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
          {[
            { role: 'admin', name: 'Rajesh Sharma', title: 'Admin / Director', desc: 'Full ERP access, margins, approvals' },
            { role: 'sales_executive', name: 'Priya Sundaram', title: 'Sales Executive', desc: 'Leads, surveys, proposals, pricing' },
            { role: 'survey_technician', name: 'Amit Patel', title: 'Survey Technician', desc: 'Roof specs, shadow tests, feasibility' },
            { role: 'warehouse_manager', name: 'Vikram Verma', title: 'Warehouse Manager', desc: 'Serial register, stock re-orders, dispatch' },
            { role: 'installation_technician', name: 'Karthik Reddy', title: 'Installation Crew Lead', desc: 'Checklists, Voc/Isc tests, signatures' },
            { role: 'service_technician', name: 'Suresh Menon', title: 'Service & Maintenance', desc: 'Warranty eligibility, fault codes' },
          ].map((item) => (
            <button
              key={item.role}
              onClick={() => {
                switchRole(item.role as any);
                onNavigate('dashboard');
              }}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-colors cursor-pointer group"
            >
              <div className="font-bold text-slate-900 group-hover:text-emerald-700">
                {item.title}
              </div>
              <div className="text-[11px] text-slate-600 font-medium">{item.name}</div>
              <div className="text-[10px] text-slate-400 mt-1">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
