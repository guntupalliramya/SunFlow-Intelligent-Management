import React from 'react';
import { X, Printer, CheckCircle, Download } from 'lucide-react';
import { PaymentRecord } from '../types/solar';
import { useSolar } from '../context/SolarContext';

interface PrintableReceiptModalProps {
  payment: PaymentRecord | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableReceiptModal: React.FC<PrintableReceiptModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  const { settings, orders } = useSolar();

  if (!isOpen || !payment) return null;

  const order = orders.find((o) => o.id === payment.salesOrderId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
        <div className="print:hidden flex items-center justify-between px-5 py-3.5 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-sm">Payment Receipt ({payment.receiptNumber})</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Print"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Content */}
        <div className="p-6 bg-white text-slate-900 print:p-0">
          <div className="text-center border-b border-slate-200 pb-4 mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold mb-2">
              ☀️
            </div>
            <h2 className="text-lg font-bold text-slate-900">{settings.companyName}</h2>
            <p className="text-xs text-slate-500">{settings.companyAddress}</p>
            <p className="text-xs text-slate-500">GSTIN: {settings.gstNumber} • Phone: {settings.companyPhone}</p>
            <div className="inline-block mt-3 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              Official Payment Receipt
            </div>
          </div>

          <div className="space-y-3 text-xs mb-6">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Receipt Number:</span>
              <span className="font-mono font-bold text-slate-900">{payment.receiptNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Receipt Date:</span>
              <span className="font-medium text-slate-900">{payment.date}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Received From (Customer):</span>
              <span className="font-bold text-slate-900">{payment.customerName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Related Order:</span>
              <span className="font-mono font-semibold text-emerald-700">{payment.orderNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Milestone:</span>
              <span className="font-medium text-slate-800">{payment.paymentType}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-medium text-slate-800">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction Reference No:</span>
              <span className="font-mono text-slate-700">{payment.referenceNumber}</span>
            </div>
            {payment.notes && (
              <div className="py-1">
                <span className="text-slate-500 block mb-0.5">Remarks:</span>
                <span className="text-slate-700 italic">{payment.notes}</span>
              </div>
            )}
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-center mb-6">
            <span className="text-xs uppercase tracking-wider text-emerald-800 font-bold block mb-1">
              Amount Received
            </span>
            <span className="text-2xl font-black text-emerald-700">
              ₹{payment.amount.toLocaleString()}
            </span>
            {order && (
              <p className="text-[11px] text-emerald-900 mt-1">
                Total Order Value: ₹{order.orderAmount.toLocaleString()} • Remaining Balance: ₹{order.balanceAmount.toLocaleString()}
              </p>
            )}
          </div>

          <div className="flex justify-between items-end pt-4 border-t border-slate-200 text-xs">
            <div className="text-[10px] text-slate-400">
              Computer-generated receipt.<br />
              Generated via SunFlow AI ERP.
            </div>
            <div className="text-center">
              <div className="w-32 border-b border-slate-400 pb-1 text-slate-400 italic text-[10px]">
                [Authorized Seal]
              </div>
              <p className="text-[10px] font-bold text-slate-700 mt-1">SunPower Accounts</p>
            </div>
          </div>
        </div>

        <div className="print:hidden px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={handlePrint}
            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
