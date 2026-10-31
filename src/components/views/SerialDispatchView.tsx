import React, { useState, useMemo } from 'react';
import {
  Barcode,
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  AlertTriangle,
  Camera,
  Layers,
  X,
  User,
  FileCheck,
  Zap,
} from 'lucide-react';
import { ProductSerialNumber, SerialStatus } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';
import { BarcodeScannerModal } from '../BarcodeScannerModal';

interface SerialDispatchViewProps {
  initialOrderId?: string;
  onNavigateToInstallations?: () => void;
}

export const SerialDispatchView: React.FC<SerialDispatchViewProps> = ({
  initialOrderId,
  onNavigateToInstallations,
}) => {
  const {
    serialNumbers,
    orders,
    products,
    addSerialNumber,
    dispatchOrderEquipment,
  } = useSolar();

  const [activeTab, setActiveTab] = useState<'dispatch' | 'register'>('dispatch');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Dispatch Workflow State
  const confirmedOrders = useMemo(() => {
    return orders.filter(
      (o) => o.status === 'Confirmed' || (o.status === 'Dispatched' && !o.isInventoryDispatched)
    );
  }, [orders]);

  const [selectedOrderId, setSelectedOrderId] = useState<string>(
    initialOrderId || confirmedOrders[0]?.id || orders[0]?.id || ''
  );
  const [stagedSerials, setStagedSerials] = useState<string[]>([]);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [dispatchSuccess, setDispatchSuccess] = useState<string | null>(null);

  // Scanner modal state
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // Register New Serial Modal
  const [isNewSerialModalOpen, setIsNewSerialModalOpen] = useState(false);
  const [newSerialForm, setNewSerialForm] = useState({
    serialNumber: '',
    productId: products[0]?.id || '',
    supplier: 'Growatt India Logistics',
    purchaseDate: new Date().toISOString().split('T')[0],
    purchaseCost: 24000,
  });
  const [addSerialError, setAddSerialError] = useState<string | null>(null);

  const selectedOrder = useMemo(() => {
    return orders.find((o) => o.id === selectedOrderId);
  }, [orders, selectedOrderId]);

  // Available stock serials for quick pick
  const availableSerials = useMemo(() => {
    return serialNumbers.filter((s) => s.status === 'Available');
  }, [serialNumbers]);

  const filteredSerialRegister = useMemo(() => {
    return serialNumbers.filter((s) => {
      const matchesSearch =
        s.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.customerName && s.customerName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (s.supplier && s.supplier.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [serialNumbers, searchQuery, selectedStatus]);

  const handleAddStagedSerial = (serial: string) => {
    setDispatchError(null);
    const upper = serial.trim().toUpperCase();

    // Check duplicate in staged list
    if (stagedSerials.includes(upper)) {
      setDispatchError(`Serial ${upper} is already in the dispatch queue.`);
      return;
    }

    // Check availability
    const record = serialNumbers.find((s) => s.serialNumber === upper);
    if (!record) {
      setDispatchError(`Serial Number "${upper}" is not registered in the system inventory.`);
      return;
    }

    if (record.status !== 'Available' && record.salesOrderId !== selectedOrderId) {
      setDispatchError(
        `Serial ${upper} is currently marked as "${record.status}". Only "Available" units can be dispatched.`
      );
      return;
    }

    setStagedSerials((prev) => [...prev, upper]);
  };

  const handleRemoveStagedSerial = (serial: string) => {
    setStagedSerials((prev) => prev.filter((s) => s !== serial));
  };

  const handleExecuteDispatch = () => {
    if (!selectedOrder) return;
    setDispatchError(null);
    setDispatchSuccess(null);

    const result = dispatchOrderEquipment(selectedOrder.id, stagedSerials);
    if (!result.success) {
      setDispatchError(result.error || 'Failed to dispatch equipment.');
      return;
    }

    setDispatchSuccess(
      `✓ All ${stagedSerials.length} serial components successfully dispatched to ${selectedOrder.customerName}! Inventory deducted and installation crew record populated.`
    );
    setStagedSerials([]);

    setTimeout(() => {
      if (onNavigateToInstallations) {
        onNavigateToInstallations();
      }
    }, 1500);
  };

  const handleSaveNewSerial = (e: React.FormEvent) => {
    e.preventDefault();
    setAddSerialError(null);

    const prod = products.find((p) => p.id === newSerialForm.productId);
    if (!prod) return;

    const result = addSerialNumber({
      serialNumber: newSerialForm.serialNumber.trim().toUpperCase(),
      productId: prod.id,
      productName: prod.name,
      category: prod.category,
      supplier: newSerialForm.supplier,
      purchaseDate: newSerialForm.purchaseDate,
      purchaseCost: Number(newSerialForm.purchaseCost),
      status: 'Available',
    });

    if (!result.success) {
      setAddSerialError(result.error || 'Duplicate serial number');
      return;
    }

    setIsNewSerialModalOpen(false);
    setNewSerialForm({
      serialNumber: '',
      productId: products[0]?.id || '',
      supplier: 'Growatt India Logistics',
      purchaseDate: new Date().toISOString().split('T')[0],
      purchaseCost: 24000,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Serial Tracking & Barcode Dispatch</h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan and allocate unique serial numbers for inverters, batteries, and panels with strict duplicate prevention and advance payment validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsNewSerialModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Receive Inward Serial Stock
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('dispatch')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'dispatch'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          Dispatch Workflow for Confirmed Orders
        </button>

        <button
          onClick={() => setActiveTab('register')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'register'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Barcode className="w-4 h-4" />
          Master Serial Number Register ({serialNumbers.length})
        </button>
      </div>

      {activeTab === 'dispatch' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Step 1: Select Confirmed Sales Order */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              1. Select Confirmed Order
            </h3>

            <div>
              <label className="block text-slate-600 text-xs font-medium mb-1">
                Choose Order for Dispatch
              </label>
              <select
                value={selectedOrderId}
                onChange={(e) => {
                  setSelectedOrderId(e.target.value);
                  setStagedSerials([]);
                  setDispatchError(null);
                  setDispatchSuccess(null);
                }}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-semibold"
              >
                {orders.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.orderNumber} – {o.customerName} ({o.capacityKw} kW {o.systemType})
                  </option>
                ))}
              </select>
            </div>

            {selectedOrder && (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-bold text-slate-900">{selectedOrder.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Package:</span>
                  <span className="font-semibold text-emerald-700">{selectedOrder.capacityKw} kW {selectedOrder.systemType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Value:</span>
                  <span className="font-bold text-slate-900">₹{selectedOrder.orderAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Advance Paid:</span>
                  <span className="font-bold text-emerald-700">₹{selectedOrder.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1.5">
                  <span className="text-slate-600 font-medium">Advance Gate Check:</span>
                  {selectedOrder.totalPaid >= (selectedOrder.orderAmount * (selectedOrder.minAdvancePercent || 40)) / 100 ? (
                    <span className="font-bold text-emerald-700 flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      Passed ({selectedOrder.minAdvancePercent}% Met)
                    </span>
                  ) : (
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failed (&lt;{selectedOrder.minAdvancePercent}% Advance)
                    </span>
                  )}
                </div>

                {selectedOrder.dispatchedSerialNumbers.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-slate-500 block mb-1">Already Dispatched Serials:</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedOrder.dispatchedSerialNumbers.map((sn) => (
                        <span key={sn} className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-700">
                          {sn}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 2 & 3: Scan / Select Serials to Dispatch */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-emerald-600" />
                  2. Scan / Enter Serial Numbers for Dispatch
                </h3>
                <p className="text-xs text-slate-500">
                  Barcode verification guarantees zero duplication and ties units to customer warranty.
                </p>
              </div>

              <button
                onClick={() => setIsScannerOpen(true)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                Open Camera Scanner
              </button>
            </div>

            {dispatchError && (
              <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{dispatchError}</span>
              </div>
            )}

            {dispatchSuccess && (
              <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{dispatchSuccess}</span>
              </div>
            )}

            {/* Staged Serials List */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">
                  Equipment Queued for Dispatch ({stagedSerials.length})
                </span>
                <span className="text-[11px] text-slate-400">
                  Ready to link to sales order {selectedOrder?.orderNumber}
                </span>
              </div>

              {stagedSerials.length === 0 ? (
                <div className="p-8 border-2 border-dashed border-slate-200 rounded-lg text-center text-slate-400 text-xs">
                  <Barcode className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  No serial numbers scanned yet. Click "Open Camera Scanner" or pick from available stock below.
                </div>
              ) : (
                <div className="space-y-2">
                  {stagedSerials.map((serial) => {
                    const record = serialNumbers.find((s) => s.serialNumber === serial);
                    return (
                      <div
                        key={serial}
                        className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm mr-2">{serial}</span>
                          <span className="text-slate-600 font-medium">{record?.productName || 'Solar Component'}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveStagedSerial(serial)}
                          className="text-red-500 hover:text-red-700 font-semibold cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Quick Pick from Available Units in Warehouse */}
            <div className="pt-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Available Inverter & Battery Stock in Warehouse (Click to Queue)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                {availableSerials.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleAddStagedSerial(item.serialNumber)}
                    className="p-2.5 rounded-lg border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-colors cursor-pointer group"
                  >
                    <div className="font-mono text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                      {item.serialNumber}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{item.productName}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Supplier: {item.supplier}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatch Action Button */}
            <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
              <button
                type="button"
                disabled={stagedSerials.length === 0}
                onClick={handleExecuteDispatch}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer flex items-center gap-2"
              >
                <Truck className="w-4 h-4" />
                Confirm Dispatch & Allocate to Installation
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Master Serial Register Table */
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search serial number, customer, model..."
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-slate-50 focus:bg-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-600 whitespace-nowrap">Status:</span>
              {['all', 'Available', 'Dispatched', 'Installed', 'Under Repair'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {status === 'all' ? 'All Units' : status}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Serial Number</th>
                    <th className="py-3 px-4">Component Model</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Supplier</th>
                    <th className="py-3 px-4">Stock Status</th>
                    <th className="py-3 px-4">Allocated Customer</th>
                    <th className="py-3 px-4">Order / Installation</th>
                    <th className="py-3 px-4">Warranty Expiry</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSerialRegister.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900 text-sm">
                        {item.serialNumber}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.productName}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{item.supplier}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            item.status === 'Installed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'Dispatched'
                              ? 'bg-purple-100 text-purple-800 border border-purple-300'
                              : item.status === 'Available'
                              ? 'bg-blue-100 text-blue-800 border border-blue-300'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-800">
                        {item.customerName || '—'}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-700">
                        {item.salesOrderId || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.warrantyExpiryDate ? (
                          <span className="font-semibold text-emerald-700">
                            {item.warrantyExpiryDate}
                          </span>
                        ) : (
                          <span className="text-slate-400">Pending Install</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Scanner Modal */}
      <BarcodeScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleAddStagedSerial}
        availableSerials={availableSerials}
      />

      {/* Register New Serial Inward Modal */}
      {isNewSerialModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Barcode className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Receive Inward Serial Stock</h3>
              </div>
              <button
                onClick={() => setIsNewSerialModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewSerial} className="p-6 space-y-4">
              {addSerialError && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{addSerialError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Serial Number (Barcode) *
                </label>
                <input
                  type="text"
                  required
                  value={newSerialForm.serialNumber}
                  onChange={(e) =>
                    setNewSerialForm({ ...newSerialForm, serialNumber: e.target.value })
                  }
                  placeholder="e.g. GRW-5KW-2026-9050"
                  className="w-full px-3 py-2 text-sm font-mono uppercase border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Product SKU *</label>
                <select
                  value={newSerialForm.productId}
                  onChange={(e) =>
                    setNewSerialForm({ ...newSerialForm, productId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {products
                    .filter((p) => p.requiresSerialTracking)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.sku})
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Supplier Name</label>
                <input
                  type="text"
                  required
                  value={newSerialForm.supplier}
                  onChange={(e) =>
                    setNewSerialForm({ ...newSerialForm, supplier: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Date</label>
                <input
                  type="date"
                  required
                  value={newSerialForm.purchaseDate}
                  onChange={(e) =>
                    setNewSerialForm({ ...newSerialForm, purchaseDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Purchase Cost (₹)</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newSerialForm.purchaseCost}
                  onChange={(e) =>
                    setNewSerialForm({ ...newSerialForm, purchaseCost: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewSerialModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Serial Stock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
