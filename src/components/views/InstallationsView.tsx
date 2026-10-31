import React, { useState, useMemo } from 'react';
import {
  Wrench,
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  ShieldCheck,
  Zap,
  FileCheck,
  AlertTriangle,
  UserCheck,
  FileText,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Installation, InstallationStatus } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';
import { SignaturePad } from '../SignaturePad';

interface InstallationsViewProps {
  onNavigateToWarranty?: () => void;
}

export const InstallationsView: React.FC<InstallationsViewProps> = ({ onNavigateToWarranty }) => {
  const {
    installations,
    orders,
    users,
    currentUser,
    scheduleInstallation,
    completeInstallation,
  } = useSolar();

  const [selectedInst, setSelectedInst] = useState<Installation | null>(null);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isExecutionSheetOpen, setIsExecutionSheetOpen] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [executionSuccess, setExecutionSuccess] = useState<string | null>(null);

  // Scheduling Form
  const [scheduleForm, setScheduleForm] = useState({
    salesOrderId: orders[0]?.id || '',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    crewLeaderId: 'user-install',
    technicianNames: ['Karthik Reddy', 'Suresh Kumar'],
  });
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // Execution Sheet State for Mobile Technician
  const [activeChecklist, setActiveChecklist] = useState<Installation['checklist']>([]);
  const [activeSafetyChecklist, setActiveSafetyChecklist] = useState<Installation['safetyChecklist']>([]);
  const [electricalTesting, setElectricalTesting] = useState({
    vocMeasuredVolts: 492.5,
    iscMeasuredAmps: 12.8,
    inverterOutputWatts: 4850,
    gridVoltageVolts: 234.2,
    gridFrequencyHz: 50.01,
    earthingResistanceOhms: 1.9,
  });
  const [finishTime, setFinishTime] = useState('16:30');
  const [siteObservations, setSiteObservations] = useState(
    'Rooftop structure anchored into RCC slab. Voc and Isc verified within 2% of STC design values. Grid synchronization completed on bidirectional net meter.'
  );
  const [customerSignature, setCustomerSignature] = useState('');
  const [customerSignedName, setCustomerSignedName] = useState('');

  const openExecutionSheet = (inst: Installation) => {
    setSelectedInst(inst);
    setActiveChecklist(inst.checklist.map((c) => ({ ...c })));
    setActiveSafetyChecklist(inst.safetyChecklist.map((s) => ({ ...s })));
    setCustomerSignedName(inst.customerName);
    setExecutionError(null);
    setExecutionSuccess(null);
    setIsExecutionSheetOpen(true);
  };

  const handleToggleChecklist = (id: string) => {
    setActiveChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleToggleSafety = (id: string) => {
    setActiveSafetyChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
  };

  const handleCompleteHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInst) return;
    setExecutionError(null);
    setExecutionSuccess(null);

    const result = completeInstallation({
      installationId: selectedInst.id,
      finishTime,
      checklist: activeChecklist,
      safetyChecklist: activeSafetyChecklist,
      electricalTesting,
      siteObservations,
      completionPhotographs: [
        'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1508873696983-2df5293cb395?auto=format&fit=crop&w=600&q=80',
      ],
      customerSignature,
      customerSignedName: customerSignedName || selectedInst.customerName,
    });

    if (!result.success) {
      setExecutionError(result.error || 'Failed to complete installation.');
      return;
    }

    setExecutionSuccess(
      `✓ Installation successfully commissioned! Sales order completed, serials updated to Installed, and manufacturer warranties automatically activated.`
    );

    setTimeout(() => {
      setIsExecutionSheetOpen(false);
      setSelectedInst(null);
      if (onNavigateToWarranty) {
        onNavigateToWarranty();
      }
    }, 1800);
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(null);

    const result = scheduleInstallation({
      salesOrderId: scheduleForm.salesOrderId,
      scheduledDate: scheduleForm.scheduledDate,
      startTime: scheduleForm.startTime,
      crewLeaderId: scheduleForm.crewLeaderId,
      technicianNames: scheduleForm.technicianNames,
    });

    if (!result.success) {
      setScheduleError(result.error || 'Failed to schedule crew');
      return;
    }

    setIsScheduleModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Installation Management & Field Handover</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch crew assignments, conflict detection, mandatory safety checklists, live electrical telemetry, and digital sign-off.
          </p>
        </div>

        <button
          onClick={() => setIsScheduleModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Calendar className="w-4 h-4" />
          Schedule Installation Job
        </button>
      </div>

      {/* Installations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Installation ID</th>
                <th className="py-3 px-4">Customer & Location</th>
                <th className="py-3 px-4">System Spec</th>
                <th className="py-3 px-4">Scheduled Date</th>
                <th className="py-3 px-4">Crew Lead / Technicians</th>
                <th className="py-3 px-4">Assigned Serials</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {installations.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 text-sm">
                      {inst.installationNumber}
                    </span>
                    <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Order: {inst.orderNumber}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{inst.customerName}</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                      {inst.customerAddress}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-emerald-800">
                      {inst.capacityKw} kW {inst.systemType}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-800">{inst.scheduledDate}</div>
                    <div className="text-[11px] text-slate-500">
                      {inst.startTime} {inst.finishTime ? `– ${inst.finishTime}` : ''}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      {inst.crewLeaderName}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[150px]">
                      {inst.technicianNames.join(', ')}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[180px]">
                      {inst.assignedSerialNumbers.map((sn) => (
                        <span key={sn} className="font-mono text-[10px] bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                          {sn}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        inst.status === 'Completed'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : inst.status === 'Scheduled'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : inst.status === 'In Progress'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {inst.status !== 'Completed' ? (
                      <button
                        onClick={() => openExecutionSheet(inst)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs ml-auto"
                      >
                        <Wrench className="w-3.5 h-3.5" />
                        Execute / Sign-off
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setSelectedInst(inst);
                          setIsExecutionSheetOpen(true);
                        }}
                        className="px-2.5 py-1 text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-medium cursor-pointer"
                      >
                        Handover Certificate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile-Friendly Technician Field Execution Sheet Modal */}
      {isExecutionSheetOpen && selectedInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-sm">Technician Field Execution & Handover Sheet</h3>
                  <p className="text-[11px] text-slate-400">
                    {selectedInst.installationNumber} • {selectedInst.customerName} ({selectedInst.capacityKw} kW {selectedInst.systemType})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsExecutionSheetOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCompleteHandover} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              {executionError && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{executionError}</span>
                </div>
              )}

              {executionSuccess && (
                <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{executionSuccess}</span>
                </div>
              )}

              {/* Mandatory Structural Checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-emerald-600" />
                    1. Mandatory Installation & Engineering Checklist
                  </h4>
                  <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    All Required
                  </span>
                </div>

                <div className="space-y-1.5 bg-slate-50 p-3 rounded-lg border border-slate-200">
                  {activeChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleChecklist(item.id)}
                        disabled={selectedInst.status === 'Completed'}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-slate-800 font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Mandatory Safety Checklist */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  2. Mandatory Rooftop Safety Protocol (HSE)
                </h4>

                <div className="space-y-1.5 bg-amber-50/50 p-3 rounded-lg border border-amber-200">
                  {activeSafetyChecklist.map((item) => (
                    <label
                      key={item.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleSafety(item.id)}
                        disabled={selectedInst.status === 'Completed'}
                        className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                      />
                      <span className={`text-slate-800 font-medium ${item.completed ? 'line-through text-slate-400' : ''}`}>
                        {item.title}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Electrical Testing & Generation Verification */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  3. Electrical Testing Readings & Generation Verification
                </h4>

                <div className="grid grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">
                      Voc Measured (Volts)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.vocMeasuredVolts}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          vocMeasuredVolts: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">
                      Isc Measured (Amps)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.iscMeasuredAmps}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          iscMeasuredAmps: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-emerald-800 text-[10px] uppercase font-bold mb-1">
                      Inverter Output (Watts)
                    </label>
                    <input
                      type="number"
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.inverterOutputWatts}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          inverterOutputWatts: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-emerald-400 rounded font-mono text-xs bg-emerald-50 text-emerald-900 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">
                      Grid Voltage (Volts)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.gridVoltageVolts}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          gridVoltageVolts: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">
                      Grid Frequency (Hz)
                    </label>
                    <input
                      type="number"
                      step={0.01}
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.gridFrequencyHz}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          gridFrequencyHz: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-600 text-[10px] uppercase font-bold mb-1">
                      Earthing Pit (&lt;2.5 Ω)
                    </label>
                    <input
                      type="number"
                      step={0.1}
                      disabled={selectedInst.status === 'Completed'}
                      value={electricalTesting.earthingResistanceOhms}
                      onChange={(e) =>
                        setElectricalTesting({
                          ...electricalTesting,
                          earthingResistanceOhms: Number(e.target.value),
                        })
                      }
                      className="w-full px-2.5 py-1.5 border border-slate-300 rounded font-mono text-xs bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Site Observations */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Site Observations & Commissioning Notes
                </label>
                <textarea
                  rows={2}
                  disabled={selectedInst.status === 'Completed'}
                  value={siteObservations}
                  onChange={(e) => setSiteObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              {/* Customer Digital Signature Handover */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer Digital Acceptance & Handover Signature *
                </label>
                {selectedInst.status === 'Completed' ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg text-center">
                    <p className="text-emerald-700 font-bold mb-2">✓ Verified Customer Signature on Record</p>
                    <div className="text-slate-500">Signed by: {selectedInst.customerSignedName} on {selectedInst.signedAt?.split('T')[0]}</div>
                  </div>
                ) : (
                  <SignaturePad
                    onSave={(sig) => setCustomerSignature(sig)}
                    initialSignature={customerSignature}
                  />
                )}
              </div>

              {selectedInst.status !== 'Completed' && (
                <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsExecutionSheetOpen(false)}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Complete Handover & Activate Warranties
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Schedule Job Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Schedule Solar Installation Crew</h3>
              </div>
              <button
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-6 space-y-4">
              {scheduleError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{scheduleError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Select Sales Order *
                </label>
                <select
                  value={scheduleForm.salesOrderId}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, salesOrderId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} – {o.customerName} ({o.capacityKw} kW {o.systemType})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Installation Date *</label>
                <input
                  type="date"
                  required
                  value={scheduleForm.scheduledDate}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, scheduledDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Start Time</label>
                <input
                  type="time"
                  value={scheduleForm.startTime}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, startTime: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Crew Leader *</label>
                <select
                  value={scheduleForm.crewLeaderId}
                  onChange={(e) =>
                    setScheduleForm({ ...scheduleForm, crewLeaderId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {users
                    .filter((u) => u.role === 'installation_technician' || u.role === 'admin')
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role.replace('_', ' ')})
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Calendar className="w-4 h-4" />
                  Confirm Job Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
