import React, { useState } from 'react';
import {
  Settings,
  Building,
  RotateCcw,
  Save,
  CheckCircle,
  AlertTriangle,
  Bot,
  Percent,
} from 'lucide-react';
import { useSolar } from '../../context/SolarContext';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetToDemoData } = useSolar();

  const [formState, setFormState] = useState({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formState);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleConfirmReset = () => {
    resetToDemoData();
    setIsResetConfirmOpen(false);
    setFormState({ ...settings });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ERP System & Company Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure SunPower Solutions company details, dispatch advance gates, taxation parameters, and demo datasets.
          </p>
        </div>

        <button
          onClick={() => setIsResetConfirmOpen(true)}
          className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-4 h-4 text-amber-600" />
          Reset Demo Data
        </button>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>System settings updated successfully!</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Profile Card */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building className="w-4 h-4 text-emerald-600" />
            Solar EPC Organization Details
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Company Legal Name</label>
              <input
                type="text"
                value={formState.companyName}
                onChange={(e) => setFormState({ ...formState, companyName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">GSTIN Registration</label>
              <input
                type="text"
                value={formState.gstNumber}
                onChange={(e) => setFormState({ ...formState, gstNumber: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Official Phone</label>
              <input
                type="text"
                value={formState.companyPhone}
                onChange={(e) => setFormState({ ...formState, companyPhone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Official Email</label>
              <input
                type="email"
                value={formState.companyEmail}
                onChange={(e) => setFormState({ ...formState, companyEmail: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-slate-700 font-semibold mb-1">Registered Business Address</label>
              <input
                type="text"
                value={formState.companyAddress}
                onChange={(e) => setFormState({ ...formState, companyAddress: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Business Rules & Dispatch Gate */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Percent className="w-4 h-4 text-emerald-600" />
            Financial Rules & Dispatch Security Gate
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Minimum Advance Payment % Required to Dispatch Equipment
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={10}
                  max={90}
                  step={5}
                  value={formState.minAdvancePaymentPercent}
                  onChange={(e) =>
                    setFormState({
                      ...formState,
                      minAdvancePaymentPercent: Number(e.target.value),
                    })
                  }
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
                <span className="text-slate-500">% of approved quotation</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Warehouse staff cannot confirm serial dispatch until customer has paid at least this percentage.
              </p>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">
                Standard Solar Equipment GST Rate (%)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={5}
                  max={28}
                  value={formState.defaultGstPercent}
                  onChange={(e) =>
                    setFormState({ ...formState, defaultGstPercent: Number(e.target.value) })
                  }
                  className="w-24 px-3 py-2 border border-slate-300 rounded-lg font-bold text-slate-900"
                />
                <span className="text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Model Configuration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            AI Copilot Integration
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">Model Route</label>
              <input
                type="text"
                disabled
                value="Secure Backend Proxy (OpenRouter / Gemini 2.0 Flash)"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600 font-mono"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-slate-700 font-semibold mb-1">API Key Storage</label>
              <div className="px-3 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-600">
                🔒 Injected on server via <code className="font-mono text-emerald-700">.env</code> (Zero frontend leakage)
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save ERP Configuration
          </button>
        </div>
      </form>

      {/* Reset Confirmation Modal */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6 text-xs space-y-4 border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>

            <div className="text-center">
              <h3 className="font-bold text-slate-900 text-sm">Reset Demo ERP Records?</h3>
              <p className="text-slate-500 mt-1">
                This will reload the initial 10 customer leads, 6 site surveys, 5 accepted quotations, 5 orders, 30 serial numbers, warranties, and service tickets.
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
                onClick={handleConfirmReset}
                className="flex-1 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold shadow-xs cursor-pointer"
              >
                Yes, Reset All Data
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
