import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
  History,
  Edit2,
  X,
  CheckCircle,
} from 'lucide-react';
import { WarrantyRecord, WarrantyStatus } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

export const WarrantyView: React.FC = () => {
  const { warranties, adjustWarrantyDate, currentUser } = useSolar();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedWarranty, setSelectedWarranty] = useState<WarrantyRecord | null>(null);

  // Manual adjustment modal state
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  const filteredWarranties = useMemo(() => {
    return warranties.filter((w) => {
      const matchesSearch =
        w.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.customerPhone.includes(searchQuery);

      const matchesStatus = statusFilter === 'all' || w.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [warranties, searchQuery, statusFilter]);

  const openAdjustModal = (warranty: WarrantyRecord) => {
    setSelectedWarranty(warranty);
    setNewExpiryDate(warranty.warrantyExpiryDate);
    setAdjustmentReason('');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWarranty || !newExpiryDate || !adjustmentReason.trim()) return;

    adjustWarrantyDate(selectedWarranty.id, newExpiryDate, adjustmentReason.trim());
    setIsAdjustModalOpen(false);
    setSelectedWarranty(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Warranty Register & Lifecycle Tracking</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated manufacturer and EPC warranty activation linked to individual equipment serial numbers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          {warranties.filter((w) => w.status === 'Active').length} Active Warranties Protected
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by serial number, customer, product..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Status:</span>
          {['all', 'Active', 'Expired', 'Replaced'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'all' ? 'All Records' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Warranties Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Component & Category</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Installation Ref</th>
                <th className="py-3 px-4">Start Date</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4">Duration</th>
                <th className="py-3 px-4">Warranty Status</th>
                <th className="py-3 px-4 text-right">Audit & Adjust</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredWarranties.map((w) => (
                <tr key={w.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                    {w.serialNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{w.productName}</div>
                    <div className="text-[11px] text-slate-500">{w.category}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{w.customerName}</div>
                    <div className="text-[11px] text-slate-500">{w.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-emerald-700 font-medium">
                    {w.installationNumber}
                  </td>
                  <td className="py-3 px-4 text-slate-600">{w.warrantyStartDate}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{w.warrantyExpiryDate}</td>
                  <td className="py-3 px-4 text-slate-700 font-semibold">
                    {w.durationYears} Years
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        w.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : w.status === 'Expired'
                          ? 'bg-red-100 text-red-800 border border-red-300'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {w.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => openAdjustModal(w)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors ml-auto"
                    >
                      <History className="w-3.5 h-3.5 text-slate-500" />
                      Audit Trail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Warranty Adjustment & Audit Trail Modal */}
      {isAdjustModalOpen && selectedWarranty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-sm">Warranty Record & Audit History</h3>
                  <p className="text-[11px] text-slate-400">
                    Serial: {selectedWarranty.serialNumber} • {selectedWarranty.customerName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Current Status Box */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Equipment:</span>
                  <span className="font-bold text-slate-900">{selectedWarranty.productName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Warranty Start:</span>
                  <span className="font-medium text-slate-800">{selectedWarranty.warrantyStartDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Expiry Date:</span>
                  <span className="font-bold text-emerald-700">{selectedWarranty.warrantyExpiryDate}</span>
                </div>
              </div>

              {/* Audit Trail Log */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  Audit Trail & Adjustment History
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {selectedWarranty.auditTrail.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                      <div className="flex justify-between text-slate-500 mb-1">
                        <span className="font-semibold text-slate-800">{log.adjustedBy}</span>
                        <span>{log.date.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-700">{log.reason}</p>
                      <p className="text-slate-400 mt-0.5 text-[10px]">
                        Changed to: <strong className="text-slate-600">{log.newExpiryDate}</strong> (was {log.previousExpiryDate})
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Manual Adjustment Form */}
              <form onSubmit={handleSaveAdjustment} className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-3">
                <h4 className="font-bold text-amber-900 text-xs">
                  Authorize Manual Date Correction
                </h4>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    New Expiry Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newExpiryDate}
                    onChange={(e) => setNewExpiryDate(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Justification / Reason for Audit Record *
                  </label>
                  <input
                    type="text"
                    required
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="e.g. Extended manufacturer warranty replacement agreement"
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                  >
                    Commit Adjustment to Audit Log
                  </button>
                </div>
              </form>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-1.5 text-slate-600 hover:bg-slate-200 rounded font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
