import React, { useState, useMemo } from 'react';
import {
  Wrench,
  AlertCircle,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ShieldCheck,
  DollarSign,
  UserCheck,
  History,
  X,
  FileText,
  Check,
} from 'lucide-react';
import { ServiceTicket, TicketStatus, TicketPriority } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

export const ServiceTicketsView: React.FC = () => {
  const {
    serviceTickets,
    customers,
    warranties,
    products,
    users,
    createServiceTicket,
    resolveServiceTicket,
  } = useSolar();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedTicket, setSelectedTicket] = useState<ServiceTicket | null>(null);

  // New Ticket Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newTicketForm, setNewTicketForm] = useState({
    customerId: customers[0]?.id || '',
    serialNumber: warranties[0]?.serialNumber || '',
    faultCode: 'E01-GRID-OVERVOLT',
    faultDescription: 'Inverter tripped with red warning LED. Error: Grid voltage exceeding limit.',
    priority: 'High' as TicketPriority,
    assignedTechnicianId: 'user-service',
  });

  // Resolution Modal
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [customerConfirmed, setCustomerConfirmed] = useState(true);

  // Available serials linked to warranties
  const customerWarranties = useMemo(() => {
    return warranties.filter((w) => w.customerId === newTicketForm.customerId);
  }, [warranties, newTicketForm.customerId]);

  const filteredTickets = useMemo(() => {
    return serviceTickets.filter((t) => {
      const matchesSearch =
        t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.faultCode.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [serviceTickets, searchQuery, statusFilter]);

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const warranty = warranties.find((w) => w.serialNumber === newTicketForm.serialNumber);

    const newTkt = createServiceTicket({
      customerId: newTicketForm.customerId,
      productId: warranty?.productId || 'prod-custom',
      serialNumber: newTicketForm.serialNumber,
      faultDescription: newTicketForm.faultDescription,
      faultCode: newTicketForm.faultCode,
      priority: newTicketForm.priority,
      assignedTechnicianId: newTicketForm.assignedTechnicianId,
    });

    setIsNewModalOpen(false);
    setSelectedTicket(newTkt);
  };

  const handleResolveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !resolutionNotes.trim()) return;

    resolveServiceTicket(selectedTicket.id, resolutionNotes.trim(), customerConfirmed);
    setIsResolveModalOpen(false);
    setSelectedTicket(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Service Tickets & Complaint Resolution</h1>
          <p className="text-xs text-slate-500 mt-1">
            Automated warranty eligibility checking: ₹0 parts & labour for in-warranty equipment, paid service billing otherwise.
          </p>
        </div>

        <button
          onClick={() => {
            setIsNewModalOpen(true);
            if (customerWarranties.length > 0) {
              setNewTicketForm((prev) => ({
                ...prev,
                serialNumber: customerWarranties[0].serialNumber,
              }));
            }
          }}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Log Service Complaint
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search ticket #, customer, fault code, serial..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Status:</span>
          {['all', 'Open', 'In Progress', 'Resolved', 'Closed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                statusFilter === status
                  ? 'bg-rose-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {status === 'all' ? 'All Tickets' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Ticket Number</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Serial Number</th>
                <th className="py-3 px-4">Fault Code & Issue</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Warranty Eligibility</th>
                <th className="py-3 px-4">Assigned Tech</th>
                <th className="py-3 px-4">Ticket Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-rose-600 text-sm">
                    {t.ticketNumber}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{t.customerName}</div>
                    <div className="text-[11px] text-slate-500">{t.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700 font-medium">
                    {t.serialNumber}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 font-bold mr-1">
                      {t.faultCode}
                    </span>
                    <span className="text-slate-600 truncate block mt-0.5">{t.faultDescription}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        t.priority === 'High' || t.priority === 'Emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {t.warrantyStatus === 'In Warranty' ? (
                      <div>
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          100% Covered (₹0)
                        </span>
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Paid (₹{t.totalInvoiceAmount.toLocaleString()})
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-800">
                    {t.assignedTechnicianName || 'Unassigned'}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        t.status === 'Closed'
                          ? 'bg-slate-100 text-slate-700'
                          : t.status === 'Resolved'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : t.status === 'In Progress'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                      }`}
                    >
                      {t.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedTicket(t)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium cursor-pointer"
                      >
                        History
                      </button>

                      {t.status !== 'Closed' && (
                        <button
                          onClick={() => {
                            setSelectedTicket(t);
                            setResolutionNotes(t.resolutionNotes || '');
                            setIsResolveModalOpen(true);
                          }}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold cursor-pointer shadow-xs"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Ticket History & Details Modal */}
      {selectedTicket && !isResolveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-400" />
                <div>
                  <h3 className="font-semibold text-sm">Service Ticket {selectedTicket.ticketNumber}</h3>
                  <p className="text-[11px] text-slate-400">{selectedTicket.customerName} • {selectedTicket.productName}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Coverage Highlight */}
              <div
                className={`p-3.5 rounded-lg border ${
                  selectedTicket.isCoveredUnderWarranty
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                <div className="flex items-center justify-between font-bold">
                  <span>Warranty Check: {selectedTicket.warrantyStatus}</span>
                  <span>Charges: ₹{selectedTicket.totalInvoiceAmount.toLocaleString()}</span>
                </div>
                <p className="text-[11px] mt-1 opacity-90">
                  {selectedTicket.isCoveredUnderWarranty
                    ? 'Serial equipment is verified under active manufacturer warranty. All labor and replacement parts are free of charge.'
                    : 'Equipment is out of warranty. Customer invoice will be generated upon closing.'}
                </p>
              </div>

              {/* Ticket Details */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Serial Number</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTicket.serialNumber}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Fault Code</span>
                  <span className="font-mono font-bold text-rose-700">{selectedTicket.faultCode}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Description</span>
                  <p className="text-slate-800">{selectedTicket.faultDescription}</p>
                </div>
              </div>

              {/* History Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                  <History className="w-4 h-4 text-emerald-600" />
                  Service & Resolution History
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedTicket.history.map((h) => (
                    <div key={h.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px]">
                      <div className="flex justify-between text-slate-500 mb-0.5">
                        <span className="font-bold text-slate-800">{h.author}</span>
                        <span>{h.date.split('T')[0]}</span>
                      </div>
                      <p className="text-slate-700">{h.note}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-500">Status: {selectedTicket.status}</span>
              <button
                onClick={() => setSelectedTicket(null)}
                className="px-4 py-1.5 text-slate-600 hover:bg-slate-200 rounded font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolve / Close Ticket Modal */}
      {isResolveModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Resolve Service Ticket {selectedTicket.ticketNumber}</h3>
              </div>
              <button
                onClick={() => setIsResolveModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleResolveSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Resolution Notes & Corrective Actions Taken *
                </label>
                <textarea
                  rows={3}
                  required
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Explain how fault was rectified (e.g. Inverter grid protection window adjusted, MC4 connector re-crimped, etc.)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2">
                <input
                  type="checkbox"
                  id="custConfirm"
                  checked={customerConfirmed}
                  onChange={(e) => setCustomerConfirmed(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded cursor-pointer"
                />
                <label htmlFor="custConfirm" className="text-emerald-900 font-semibold cursor-pointer">
                  Customer has confirmed that the problem is fully resolved (Ticket will be marked "Closed")
                </label>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsResolveModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Submit Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Log New Complaint Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-rose-400" />
                <h3 className="font-semibold text-sm">Log New Solar Service Complaint</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Customer *</label>
                <select
                  value={newTicketForm.customerId}
                  onChange={(e) => {
                    const cid = e.target.value;
                    const custWarr = warranties.filter((w) => w.customerId === cid);
                    setNewTicketForm({
                      ...newTicketForm,
                      customerId: cid,
                      serialNumber: custWarr[0]?.serialNumber || '',
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.city})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Installed Serial Number (Auto Warranty Lookup) *
                </label>
                <select
                  value={newTicketForm.serialNumber}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, serialNumber: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-mono"
                >
                  {customerWarranties.length > 0 ? (
                    customerWarranties.map((w) => (
                      <option key={w.id} value={w.serialNumber}>
                        {w.serialNumber} – {w.productName} [Expires: {w.warrantyExpiryDate}]
                      </option>
                    ))
                  ) : (
                    warranties.map((w) => (
                      <option key={w.id} value={w.serialNumber}>
                        {w.serialNumber} – {w.productName} ({w.customerName})
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Fault Code *</label>
                  <select
                    value={newTicketForm.faultCode}
                    onChange={(e) =>
                      setNewTicketForm({ ...newTicketForm, faultCode: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-mono font-semibold"
                  >
                    <option value="E01-GRID-OVERVOLT">E01: Grid Overvoltage</option>
                    <option value="E04-GROUND-FAULT">E04: Ground / Earthing Fault</option>
                    <option value="B02-BATT-UNDERVOLT">B02: Battery Under-voltage</option>
                    <option value="P03-PANEL-HOTSPOT">P03: Panel Hotspot / Cracking</option>
                    <option value="COMM-WIFI-OFFLINE">COMM: Wi-Fi Monitoring Offline</option>
                    <option value="MAINT-ROUTINE-30D">MAINT: Scheduled 30-Day Check</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">Priority</label>
                  <select
                    value={newTicketForm.priority}
                    onChange={(e) =>
                      setNewTicketForm({
                        ...newTicketForm,
                        priority: e.target.value as TicketPriority,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Low">Low (Telemetry/App)</option>
                    <option value="Medium">Medium (Low yield)</option>
                    <option value="High">High (Inverter Trip)</option>
                    <option value="Emergency">Emergency (Safety Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Customer Fault Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newTicketForm.faultDescription}
                  onChange={(e) =>
                    setNewTicketForm({ ...newTicketForm, faultDescription: e.target.value })
                  }
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Assign Service Technician
                </label>
                <select
                  value={newTicketForm.assignedTechnicianId}
                  onChange={(e) =>
                    setNewTicketForm({
                      ...newTicketForm,
                      assignedTechnicianId: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {users
                    .filter((u) => u.role === 'service_technician' || u.role === 'admin')
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
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Log Ticket & Verify Warranty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
