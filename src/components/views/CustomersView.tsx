import React, { useState, useMemo } from 'react';
import {
  UserPlus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CheckCircle2,
  Clock,
  MessageSquare,
  AlertCircle,
  FileText,
  ChevronRight,
  ExternalLink,
  Edit2,
  X,
  Plus,
} from 'lucide-react';
import {
  Customer,
  LeadStatus,
  ElectricityConnectionType,
  SolarSystemPreference,
} from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

interface CustomersViewProps {
  onScheduleSurvey?: (customerId: string) => void;
  onNavigate?: (viewId: string) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onScheduleSurvey, onNavigate }) => {
  const { customers, addCustomer, updateCustomer, addFollowUpNote, users, currentUser } = useSolar();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // New Customer Modal
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: 'New Delhi',
    connectionType: 'Single Phase LT' as ElectricityConnectionType,
    monthlyElectricityBill: 4500,
    requiredCapacityKw: 3,
    systemPreference: 'On-Grid' as SolarSystemPreference,
    subsidyRequirement: true,
    additionalNotes: '',
    status: 'New' as LeadStatus,
    assignedSalesExecId: 'user-sales',
  });

  // Follow-up Note state
  const [newNote, setNewNote] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.address.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = selectedStatus === 'all' || c.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [customers, searchQuery, selectedStatus]);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!formData.name.trim() || !formData.phone.trim()) {
      setFormError('Customer name and phone number are mandatory.');
      return;
    }

    const assignedUser = users.find((u) => u.id === formData.assignedSalesExecId);

    const result = addCustomer({
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      connectionType: formData.connectionType,
      monthlyElectricityBill: Number(formData.monthlyElectricityBill),
      requiredCapacityKw: Number(formData.requiredCapacityKw),
      systemPreference: formData.systemPreference,
      subsidyRequirement: formData.subsidyRequirement,
      additionalNotes: formData.additionalNotes.trim(),
      status: formData.status,
      assignedSalesExecId: formData.assignedSalesExecId,
      assignedSalesExecName: assignedUser?.name || 'Assigned Sales Executive',
    });

    if (!result.success) {
      setFormError(result.error || 'Failed to create customer');
      return;
    }

    setFormSuccess('Customer enquiry registered successfully! Dashboard stats updated.');
    setTimeout(() => {
      setIsNewModalOpen(false);
      setFormSuccess(null);
      // Reset form
      setFormData({
        name: '',
        phone: '',
        email: '',
        address: '',
        city: 'New Delhi',
        connectionType: 'Single Phase LT',
        monthlyElectricityBill: 4500,
        requiredCapacityKw: 3,
        systemPreference: 'On-Grid',
        subsidyRequirement: true,
        additionalNotes: '',
        status: 'New',
        assignedSalesExecId: 'user-sales',
      });
    }, 1200);
  };

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !newNote.trim()) return;

    addFollowUpNote(selectedCustomer.id, newNote.trim(), nextFollowUpDate || undefined);
    setNewNote('');
    setNextFollowUpDate('');

    // Refresh selected customer state
    const updated = customers.find((c) => c.id === selectedCustomer.id);
    if (updated) setSelectedCustomer(updated);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customer & Lead Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Capture enquiries, prevent duplicate phone numbers, track follow-ups, and transition leads to site survey.
          </p>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          New Customer Enquiry
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
            placeholder="Search by name, phone, city..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Status:</span>
          {['all', 'New', 'Contacted', 'Survey Scheduled', 'Survey Approved', 'Quotation Sent', 'Converted'].map(
            (status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {status === 'all' ? 'All Leads' : status}
              </button>
            )
          )}
        </div>
      </div>

      {/* Main Customers Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">City / Address</th>
                <th className="py-3 px-4">Capacity & System</th>
                <th className="py-3 px-4">Monthly Bill</th>
                <th className="py-3 px-4">Subsidy</th>
                <th className="py-3 px-4">Lead Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-400">
                    No customer enquiries found matching your search criteria.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[11px] text-slate-400">
                        Added: {cust.createdAt.split('T')[0]}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </div>
                      {cust.email && (
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 truncate max-w-xs">
                          <Mail className="w-3 h-3 text-slate-400" />
                          {cust.email}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{cust.city}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[180px]">
                        {cust.address}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-700">
                        {cust.requiredCapacityKw} kW DC
                      </div>
                      <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                        {cust.systemPreference}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">
                      ₹{cust.monthlyElectricityBill.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      {cust.subsidyRequirement ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          PM Surya Ghar
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">No Subsidy</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          cust.status === 'Converted'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : cust.status === 'Survey Approved'
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : cust.status === 'Quotation Sent'
                            ? 'bg-purple-100 text-purple-800 border border-purple-300'
                            : cust.status === 'Survey Scheduled'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {cust.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedCustomer(cust)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-medium transition-colors cursor-pointer"
                        >
                          History / Notes
                        </button>
                        {cust.status === 'New' || cust.status === 'Contacted' ? (
                          <button
                            onClick={() => onScheduleSurvey && onScheduleSurvey(cust.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold transition-colors shadow-xs cursor-pointer"
                          >
                            Survey
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail & Follow-up Timeline Drawer/Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{selectedCustomer.name}</h3>
                <p className="text-xs text-slate-500">
                  {selectedCustomer.city} • {selectedCustomer.phone} • Status: <span className="font-semibold text-emerald-700">{selectedCustomer.status}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Profile summary grid */}
              <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">Electricity Connection</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.connectionType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Monthly Power Bill</span>
                  <span className="font-semibold text-slate-900">₹{selectedCustomer.monthlyElectricityBill.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Requested Solar Capacity</span>
                  <span className="font-semibold text-emerald-700">{selectedCustomer.requiredCapacityKw} kW {selectedCustomer.systemPreference}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Assigned Sales Executive</span>
                  <span className="font-semibold text-slate-900">{selectedCustomer.assignedSalesExecName || 'Priya Sundaram'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block mb-0.5">Full Site Address</span>
                  <span className="text-slate-700">{selectedCustomer.address}</span>
                </div>
                {selectedCustomer.additionalNotes && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-0.5">Technical & Customer Notes</span>
                    <span className="text-slate-700 italic">{selectedCustomer.additionalNotes}</span>
                  </div>
                )}
              </div>

              {/* Follow-up Notes Timeline */}
              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-3 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  Follow-up Log & Interaction History
                </h4>

                {selectedCustomer.followUps.length === 0 ? (
                  <p className="text-slate-400 text-xs italic">No follow-up notes logged yet.</p>
                ) : (
                  <div className="space-y-3 relative before:absolute before:inset-0 before:left-2.5 before:w-0.5 before:bg-slate-200 pl-6">
                    {selectedCustomer.followUps.map((fu) => (
                      <div key={fu.id} className="relative">
                        <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-white" />
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                          <div className="flex justify-between items-center text-[11px] mb-1">
                            <span className="font-bold text-slate-800">{fu.author}</span>
                            <span className="text-slate-400">{fu.date.split('T')[0]}</span>
                          </div>
                          <p className="text-slate-700">{fu.note}</p>
                          {fu.nextFollowUpDate && (
                            <p className="mt-1 text-[11px] text-amber-700 font-medium">
                              📅 Next follow-up due: {fu.nextFollowUpDate}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Follow-up Note Form */}
              <form onSubmit={handleAddFollowUp} className="space-y-3 pt-3 border-t border-slate-200">
                <h4 className="font-bold text-slate-900 text-xs">Record New Follow-Up</h4>
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Record customer reaction, quotation discussion, or site visit feedback..."
                  className="w-full p-2.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">Next Follow-up:</span>
                    <input
                      type="date"
                      value={nextFollowUpDate}
                      onChange={(e) => setNextFollowUpDate(e.target.value)}
                      className="px-2 py-1 text-xs border border-slate-300 rounded focus:outline-hidden"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!newNote.trim()}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Save Follow-up
                  </button>
                </div>
              </form>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
              <span className="text-[11px] text-slate-500">ID: {selectedCustomer.id}</span>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-200 rounded font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Enquiry Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full my-8 overflow-hidden border border-slate-200">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">New Solar Customer Enquiry Form</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}
              {formSuccess && (
                <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Customer Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Vikramaditya Singhania"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Phone Number (Duplicate Protected) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+91 98XXX XXXXX"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="customer@email.com"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">City / Town *</label>
                  <input
                    type="text"
                    required
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="e.g. Noida, Delhi, Bengaluru"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Installation Site Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="House/Plot No., Street, Area, Landmark"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Electricity Connection Type
                  </label>
                  <select
                    value={formData.connectionType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        connectionType: e.target.value as ElectricityConnectionType,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="Single Phase LT">Single Phase LT (Residential)</option>
                    <option value="Three Phase LT">Three Phase LT (Large Villa / Small Biz)</option>
                    <option value="Commercial HT">Commercial HT (Commercial / Industrial)</option>
                    <option value="Agricultural">Agricultural Pump</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Average Monthly Electricity Bill (₹)
                  </label>
                  <input
                    type="number"
                    min={500}
                    step={100}
                    value={formData.monthlyElectricityBill}
                    onChange={(e) =>
                      setFormData({ ...formData, monthlyElectricityBill: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Required Solar Capacity (kW)
                  </label>
                  <select
                    value={formData.requiredCapacityKw}
                    onChange={(e) =>
                      setFormData({ ...formData, requiredCapacityKw: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-semibold text-emerald-800"
                  >
                    <option value={1}>1 kW (Compact ~130 units/mo)</option>
                    <option value={2}>2 kW (2BHK ~260 units/mo)</option>
                    <option value={3}>3 kW (3BHK with AC ~400 units/mo)</option>
                    <option value={4}>4 kW (Large Villa ~520 units/mo)</option>
                    <option value={5}>5 kW (Commercial / High Load ~680 units/mo)</option>
                  </select>
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-slate-700 font-semibold mb-1">
                    System Preference
                  </label>
                  <select
                    value={formData.systemPreference}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        systemPreference: e.target.value as SolarSystemPreference,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    <option value="On-Grid">On-Grid (Net Metering, No Battery)</option>
                    <option value="Off-Grid">Off-Grid (With Lithium Battery)</option>
                    <option value="Hybrid">Hybrid (Grid Tied + Battery Backup)</option>
                  </select>
                </div>

                <div className="col-span-2 flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <input
                    type="checkbox"
                    id="subsidyReq"
                    checked={formData.subsidyRequirement}
                    onChange={(e) =>
                      setFormData({ ...formData, subsidyRequirement: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <label htmlFor="subsidyReq" className="font-semibold text-emerald-900 cursor-pointer">
                    Apply under PM Surya Ghar Muft Bijli Yojana Central Subsidy (Up to ₹78,000 direct benefit)
                  </label>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Assigned Sales Executive
                  </label>
                  <select
                    value={formData.assignedSalesExecId}
                    onChange={(e) =>
                      setFormData({ ...formData, assignedSalesExecId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  >
                    {users
                      .filter((u) => u.role === 'sales_executive' || u.role === 'admin')
                      .map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Additional Site / Customer Notes
                  </label>
                  <textarea
                    rows={2}
                    value={formData.additionalNotes}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalNotes: e.target.value })
                    }
                    placeholder="e.g. Roof shadow details, terrace access, preferred installation schedule"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <UserPlus className="w-4 h-4" />
                  Save Customer & Update Dashboard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
