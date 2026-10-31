import React, { useState } from 'react';
import {
  FileCheck,
  CreditCard,
  CheckCircle,
  Clock,
  AlertCircle,
  Receipt,
  Truck,
  DollarSign,
  Calendar,
  X,
  ExternalLink,
} from 'lucide-react';
import { SalesOrder, PaymentRecord, PaymentMethod } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';
import { PrintableReceiptModal } from '../PrintableReceiptModal';

interface OrdersViewProps {
  onNavigateToDispatch?: (orderId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({ onNavigateToDispatch }) => {
  const { orders, payments, recordPayment, settings } = useSolar();

  const [activePaymentModalOrder, setActivePaymentModalOrder] = useState<SalesOrder | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<PaymentRecord | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Payment form state
  const [payAmount, setPayAmount] = useState<number>(50000);
  const [paymentType, setPaymentType] = useState<PaymentRecord['paymentType']>('Advance');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer / NEFT');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const openPaymentModal = (order: SalesOrder) => {
    setActivePaymentModalOrder(order);
    const minAdvance = (order.orderAmount * (order.minAdvancePercent || 40)) / 100;
    const suggested =
      order.totalPaid === 0
        ? Math.round(minAdvance)
        : Math.min(50000, order.balanceAmount);

    setPayAmount(suggested);
    setPaymentType(order.totalPaid === 0 ? 'Advance' : order.balanceAmount <= suggested ? 'Final Balance' : 'Milestone / Partial');
    setReferenceNumber(`TXN-${Date.now().toString().slice(-6)}`);
    setPaymentNotes('');
  };

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePaymentModalOrder || payAmount <= 0) return;

    const receipt = recordPayment({
      salesOrderId: activePaymentModalOrder.id,
      amount: Number(payAmount),
      paymentType,
      paymentMethod,
      referenceNumber: referenceNumber || `REF-${Date.now().toString().slice(-6)}`,
      notes: paymentNotes,
    });

    setActivePaymentModalOrder(null);
    setActiveReceipt(receipt);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales Orders & Payment Gate</h1>
          <p className="text-xs text-slate-500 mt-1">
            Confirmed rooftop solar projects, milestone invoicing, and minimum advance payment gate for equipment dispatch.
          </p>
        </div>

        <div className="text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200 text-slate-700">
          Min. Dispatch Advance: <strong className="text-emerald-700">{settings.minAdvancePaymentPercent}%</strong> of order value
        </div>
      </div>

      {/* Orders List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Order ID & Date</th>
                <th className="py-3 px-4">Customer Details</th>
                <th className="py-3 px-4">Package Capacity</th>
                <th className="py-3 px-4">Total Order Value</th>
                <th className="py-3 px-4">Paid / Balance</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4">Dispatch Gate</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const minAdvanceRequired = (order.orderAmount * (order.minAdvancePercent || 40)) / 100;
                const advanceSatisfied = order.totalPaid >= minAdvanceRequired;

                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {order.orderNumber}
                      </span>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        Quote: {order.quotationNumber}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{order.customerName}</div>
                      <div className="text-[11px] text-slate-500">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-800">
                        {order.capacityKw} kW {order.systemType}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Exp. Install: {order.expectedInstallationDate}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 text-sm">
                      ₹{order.orderAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-emerald-700">
                        ₹{order.totalPaid.toLocaleString()} paid
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Balance: ₹{order.balanceAmount.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          order.paymentStatus === 'Paid'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : order.paymentStatus === 'Partially Paid'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-red-100 text-red-800 border border-red-300'
                        }`}
                      >
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {advanceSatisfied ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Ready to Dispatch
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          Need {order.minAdvancePercent}% Advance
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.balanceAmount > 0 && (
                          <button
                            onClick={() => openPaymentModal(order)}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded text-xs font-semibold cursor-pointer transition-colors"
                          >
                            + Record Pay
                          </button>
                        )}

                        {advanceSatisfied && !order.isInventoryDispatched && onNavigateToDispatch && (
                          <button
                            onClick={() => onNavigateToDispatch(order.id)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Dispatch Serials
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Ledger / Receipts List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-sm">Customer Payment Receipts Log</h3>
          </div>
          <span className="text-xs text-slate-500">{payments.length} transactions recorded</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-4">Receipt No</th>
                <th className="py-2.5 px-4">Order Ref</th>
                <th className="py-2.5 px-4">Customer</th>
                <th className="py-2.5 px-4">Milestone</th>
                <th className="py-2.5 px-4">Payment Mode</th>
                <th className="py-2.5 px-4">Reference No</th>
                <th className="py-2.5 px-4">Date</th>
                <th className="py-2.5 px-4 text-right">Amount (₹)</th>
                <th className="py-2.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50">
                  <td className="py-2.5 px-4 font-mono font-bold text-slate-900">{p.receiptNumber}</td>
                  <td className="py-2.5 px-4 font-mono text-emerald-700 font-semibold">{p.orderNumber}</td>
                  <td className="py-2.5 px-4 font-medium text-slate-800">{p.customerName}</td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                      {p.paymentType}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-slate-600">{p.paymentMethod}</td>
                  <td className="py-2.5 px-4 font-mono text-slate-500">{p.referenceNumber}</td>
                  <td className="py-2.5 px-4 text-slate-600">{p.date}</td>
                  <td className="py-2.5 px-4 text-right font-black text-emerald-700">
                    ₹{p.amount.toLocaleString()}
                  </td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => {
                        setActiveReceipt(p);
                        setIsReceiptModalOpen(true);
                      }}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded text-xs font-medium cursor-pointer"
                    >
                      Receipt PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      {activePaymentModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-semibold text-sm">Record Customer Payment</h3>
                  <p className="text-[11px] text-slate-400">{activePaymentModalOrder.orderNumber} • {activePaymentModalOrder.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setActivePaymentModalOrder(null)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4">
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Order Value:</span>
                  <span className="font-bold text-slate-900">₹{activePaymentModalOrder.orderAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Already Received:</span>
                  <span className="font-bold text-emerald-700">₹{activePaymentModalOrder.totalPaid.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-1">
                  <span className="text-slate-700 font-semibold">Remaining Balance:</span>
                  <span className="font-bold text-red-600">₹{activePaymentModalOrder.balanceAmount.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Payment Amount to Receive (₹) *
                </label>
                <input
                  type="number"
                  min={100}
                  max={activePaymentModalOrder.balanceAmount}
                  required
                  value={payAmount}
                  onChange={(e) => setPayAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Milestone *</label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as PaymentRecord['paymentType'])}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Advance">Advance (Pre-requisite for stock dispatch)</option>
                  <option value="Milestone / Partial">Milestone / Partial Payment</option>
                  <option value="Final Balance">Final Balance (Handover & Commissioning)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Bank Transfer / NEFT">Bank Transfer / NEFT</option>
                  <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                  <option value="Cheque">Bank Cheque</option>
                  <option value="Credit Card">Credit Card / Debit Card</option>
                  <option value="Cash">Cash Receipt</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  Transaction / UTR / Cheque Reference Number
                </label>
                <input
                  type="text"
                  required
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. UTR-HDFC-994821"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Payment Notes</label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="Optional notes or remarks"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActivePaymentModalOrder(null)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Receipt className="w-4 h-4" />
                  Confirm & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Receipt Modal */}
      <PrintableReceiptModal
        payment={activeReceipt}
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
      />
    </div>
  );
};
