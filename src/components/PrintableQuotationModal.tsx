import React from 'react';
import { X, Printer, CheckCircle2, ShieldCheck, Zap, Download } from 'lucide-react';
import { Quotation } from '../types/solar';
import { useSolar } from '../context/SolarContext';

interface PrintableQuotationModalProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrintableQuotationModal: React.FC<PrintableQuotationModalProps> = ({
  quotation,
  isOpen,
  onClose,
  onAccept,
}) => {
  const { settings, customers } = useSolar();

  if (!isOpen || !quotation) return null;

  const customer = customers.find((c) => c.id === quotation.customerId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        {/* Modal Top Bar (hidden during print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Zap className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Official Solar Proposal & Quotation</h2>
              <p className="text-xs text-slate-400">{quotation.quotationNumber} • {quotation.packageName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {quotation.status !== 'Accepted' && onAccept && (
              <button
                onClick={onAccept}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Accept & Create Order
              </button>
            )}
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors border border-slate-700 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Quotation Sheet */}
        <div className="p-8 overflow-y-auto flex-1 bg-white print:p-0 print:m-0 text-slate-900 print:overflow-visible">
          {/* Header */}
          <div className="border-b-2 border-emerald-600 pb-6 flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-lg">
                  ☀️
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                    {settings.companyName || 'SunPower Solutions Pvt. Ltd.'}
                  </h1>
                  <p className="text-xs font-medium text-emerald-700">Rooftop Solar EPC • MNRE Approved Channel Partner</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-2 max-w-sm">
                {settings.companyAddress}
              </p>
              <p className="text-xs text-slate-500">
                GSTIN: <span className="font-mono font-semibold text-slate-700">{settings.gstNumber}</span> • Phone: {settings.companyPhone}
              </p>
            </div>

            <div className="text-right">
              <span className="inline-block px-3 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider mb-2">
                Commercial Quotation
              </span>
              <table className="text-xs text-right ml-auto border-separate border-spacing-y-1">
                <tbody>
                  <tr>
                    <td className="text-slate-500 pr-3">Quotation No:</td>
                    <td className="font-mono font-bold text-slate-900">{quotation.quotationNumber}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 pr-3">Date:</td>
                    <td className="font-medium text-slate-900">{quotation.createdAt.split('T')[0]}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 pr-3">Valid Until:</td>
                    <td className="font-medium text-amber-700 font-semibold">{quotation.validUntil}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-500 pr-3">Status:</td>
                    <td>
                      <span className="font-semibold text-emerald-600">{quotation.status}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Customer & Project Info */}
          <div className="grid grid-cols-2 gap-6 my-6 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs">
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 text-emerald-800">
                Quotation Issued To
              </h3>
              <p className="font-bold text-slate-900 text-sm">{quotation.customerName}</p>
              <p className="text-slate-600 mt-0.5">{customer?.address || 'Site Terrace'}</p>
              <p className="text-slate-600">{customer?.city}</p>
              <p className="text-slate-600 mt-1">Phone: <span className="font-medium text-slate-800">{customer?.phone}</span></p>
              <p className="text-slate-600">Grid Connection: <span className="font-medium text-slate-800">{customer?.connectionType}</span></p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] mb-2 text-emerald-800">
                Technical System Specification
              </h3>
              <p className="font-bold text-slate-900 text-sm">{quotation.packageName}</p>
              <p className="text-slate-600 mt-0.5">Capacity: <span className="font-bold text-emerald-700">{quotation.capacityKw} kW DC</span></p>
              <p className="text-slate-600">System Architecture: <span className="font-semibold text-slate-800">{quotation.systemType}</span></p>
              <p className="text-slate-600">Estimated Solar Output: <span className="font-semibold text-slate-800">~{quotation.capacityKw * 125} – {quotation.capacityKw * 140} units/month</span></p>
              <p className="text-slate-600">Expected CO2 Reduction: <span className="font-semibold text-slate-800">~{quotation.capacityKw * 1.3} tonnes / year</span></p>
            </div>
          </div>

          {/* Bill of Materials (BOM) Table */}
          <div className="mb-6">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2 text-emerald-800">
              Itemized Bill of Materials (BOM) & Scope of Work
            </h3>
            <div className="border border-slate-200 rounded-lg overflow-hidden">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-2.5 px-3 w-10 text-center">#</th>
                    <th className="py-2.5 px-3">Item Description / Specification</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Unit Rate (₹)</th>
                    <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {quotation.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 text-center text-slate-400 font-mono">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-semibold text-slate-900">{item.productName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{item.sku}</td>
                      <td className="py-2.5 px-3 text-center font-medium text-slate-800">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right text-slate-600">₹{item.unitPrice.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-medium text-slate-900">₹{item.totalPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/40 font-medium">
                    <td colSpan={4} className="py-2 px-3 text-slate-700">Turnkey Erection, Cabling & Commissioning Charges</td>
                    <td className="py-2 px-3 text-right text-slate-500">Fixed</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-900">
                      ₹{quotation.installationLabourCharges.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Calculation Summary */}
          <div className="grid grid-cols-2 gap-6 items-start mb-6">
            <div className="text-xs space-y-2 text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Guaranteed Warranties & Support
              </h4>
              <p>• <strong>Solar Panels:</strong> 25-Year Linear Power Performance Warranty</p>
              <p>• <strong>Inverter:</strong> 5-Year Standard Manufacturer Replacement Warranty</p>
              <p>• <strong>Mounting Structure:</strong> 10-Year Anti-Corrosion Hot-Dip Galvanized Guarantee</p>
              <p>• <strong>Workmanship:</strong> 5-Year Free Maintenance & Bi-annual Preventive Service Checkups</p>
              <p className="pt-2 text-[11px] text-slate-500 italic">
                * Note: Net metering and Discom bi-directional meter testing fees included in turnkey scope.
              </p>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <table className="w-full text-right border-separate border-spacing-y-1.5">
                <tbody>
                  <tr>
                    <td className="text-slate-600">Total Materials (BOM):</td>
                    <td className="font-medium text-slate-900">₹{quotation.materialsTotal.toLocaleString()}</td>
                  </tr>
                  <tr>
                    <td className="text-slate-600">Installation & Civil Works:</td>
                    <td className="font-medium text-slate-900">₹{quotation.installationLabourCharges.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-slate-200">
                    <td className="text-slate-700 font-semibold pt-1">Subtotal:</td>
                    <td className="font-semibold text-slate-900 pt-1">₹{quotation.subtotal.toLocaleString()}</td>
                  </tr>
                  {quotation.discountAmount > 0 && (
                    <tr>
                      <td className="text-emerald-700">Promotional Green Discount:</td>
                      <td className="font-medium text-emerald-700">-₹{quotation.discountAmount.toLocaleString()}</td>
                    </tr>
                  )}
                  <tr>
                    <td className="text-slate-600">Applicable GST ({quotation.gstRatePercent}%):</td>
                    <td className="font-medium text-slate-900">₹{quotation.gstAmount.toLocaleString()}</td>
                  </tr>
                  <tr className="border-t border-slate-300">
                    <td className="text-slate-900 font-bold text-sm pt-1">Gross Project Value:</td>
                    <td className="font-bold text-slate-900 text-sm pt-1">₹{quotation.grandTotal.toLocaleString()}</td>
                  </tr>

                  {/* Subsidy Highlight */}
                  {quotation.subsidyAmount > 0 && (
                    <tr className="bg-emerald-100/70 text-emerald-900 font-semibold">
                      <td className="py-1 px-2 text-left rounded-l">
                        PM Surya Ghar Muft Bijli Subsidy (DBT):
                      </td>
                      <td className="py-1 px-2 rounded-r font-bold text-emerald-800">
                        -₹{quotation.subsidyAmount.toLocaleString()}
                      </td>
                    </tr>
                  )}

                  <tr className="border-t-2 border-emerald-600">
                    <td className="text-emerald-900 font-black text-base pt-2">
                      Net Effective Cost to Customer:
                    </td>
                    <td className="font-black text-emerald-700 text-lg pt-2">
                      ₹{quotation.netPayableByCustomer.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment Terms & Authorization Signatures */}
          <div className="border-t border-slate-200 pt-6 mt-4 grid grid-cols-2 gap-8 text-xs">
            <div>
              <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                Standard Payment Terms
              </h4>
              <ul className="list-disc list-inside text-slate-600 space-y-0.5">
                <li><strong>40% Advance:</strong> Upon quotation approval for procurement & booking.</li>
                <li><strong>50% On Dispatch:</strong> Before material loading & serial dispatch to site.</li>
                <li><strong>10% On Handover:</strong> Post grid synchronization & customer sign-off.</li>
              </ul>
            </div>
            <div className="flex justify-between items-end pt-4">
              <div className="text-center">
                <div className="w-40 border-b border-slate-400 pb-1 text-slate-400 italic">
                  [Authorized Signature]
                </div>
                <p className="text-[11px] font-semibold text-slate-800 mt-1">SunPower Solutions</p>
                <p className="text-[10px] text-slate-500">Authorized Signatory</p>
              </div>

              <div className="text-center">
                <div className="w-40 border-b border-slate-400 pb-1 text-slate-400 italic">
                  {quotation.status === 'Accepted' ? '✓ Accepted by Customer' : '[Customer Signature]'}
                </div>
                <p className="text-[11px] font-semibold text-slate-800 mt-1">{quotation.customerName}</p>
                <p className="text-[10px] text-slate-500">Customer Acceptance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer (hidden in print) */}
        <div className="print:hidden px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
          <span>Official document issued under SunFlow AI ERP</span>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              Download / Print PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
