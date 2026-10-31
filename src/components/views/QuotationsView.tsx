import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Eye,
  CheckCircle2,
  Send,
  Zap,
  Printer,
  ShieldCheck,
  AlertCircle,
  X,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { Quotation, QuotationItem, SolarSystemPreference } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';
import { PrintableQuotationModal } from '../PrintableQuotationModal';

interface QuotationsViewProps {
  onNavigateToOrders?: () => void;
  preselectedSurveyId?: string;
}

export const QuotationsView: React.FC<QuotationsViewProps> = ({
  onNavigateToOrders,
  preselectedSurveyId,
}) => {
  const {
    quotations,
    surveys,
    packages,
    products,
    customers,
    createQuotation,
    sendQuotation,
    acceptQuotation,
  } = useSolar();

  const [activeQuotationForPrint, setActiveQuotationForPrint] = useState<Quotation | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // Filter approved surveys only!
  const approvedSurveys = useMemo(() => {
    return surveys.filter((s) => s.status === 'Approved');
  }, [surveys]);

  // Form state
  const [selectedSurveyId, setSelectedSurveyId] = useState(
    preselectedSurveyId || approvedSurveys[0]?.id || ''
  );
  const [selectedPackageId, setSelectedPackageId] = useState(packages[0]?.id || '');
  const [discountAmount, setDiscountAmount] = useState<number>(5000);
  const [validityDays, setValidityDays] = useState<number>(15);
  const [quotationNotes, setQuotationNotes] = useState(
    'Includes Discom Net-Metering application coordination, DISCOM testing fee and bidirectional meter inspection.'
  );

  // Derived selected survey and customer
  const currentSurvey = useMemo(() => {
    return surveys.find((s) => s.id === selectedSurveyId) || approvedSurveys[0];
  }, [selectedSurveyId, surveys, approvedSurveys]);

  const currentPackage = useMemo(() => {
    return packages.find((p) => p.id === selectedPackageId) || packages[0];
  }, [selectedPackageId, packages]);

  // Dynamic automatic calculation of Bill of Materials (BOM) based on configured package
  const calculatedItems = useMemo<QuotationItem[]>(() => {
    if (!currentPackage) return [];

    return currentPackage.components.map((comp) => {
      const product = products.find((p) => p.id === comp.productId);
      const unitPrice = product?.unitPrice || 0;
      const unitCost = product?.purchaseCost || Math.round(unitPrice * 0.72);
      const totalPrice = unitPrice * comp.quantity;

      return {
        productId: comp.productId,
        productName: comp.productName,
        sku: comp.sku,
        quantity: comp.quantity,
        unitPrice,
        totalPrice,
        unitCost,
      };
    });
  }, [currentPackage, products]);

  // Totals Calculation
  const calculationSummary = useMemo(() => {
    const materialsTotal = calculatedItems.reduce((acc, item) => acc + item.totalPrice, 0);
    const capacityKw = currentPackage?.capacityKw || 3;
    const installationLabourCharges = capacityKw * 3500; // ₹3,500 per kW turnkey install
    const subtotal = materialsTotal + installationLabourCharges;
    const discount = Number(discountAmount) || 0;
    const gstRatePercent = 12; // Standard Solar GST rate
    const taxableAmount = Math.max(0, subtotal - discount);
    const gstAmount = Math.round((taxableAmount * gstRatePercent) / 100);
    const grandTotal = taxableAmount + gstAmount;

    // Subsidy calculation: PM Surya Ghar Muft Bijli Yojana
    // On-Grid residential: 1kW = ₹30k, 2kW = ₹60k, 3kW+ = ₹78k
    let subsidyAmount = 0;
    if (currentPackage?.systemType === 'On-Grid') {
      if (capacityKw === 1) subsidyAmount = 30000;
      else if (capacityKw === 2) subsidyAmount = 60000;
      else if (capacityKw >= 3) subsidyAmount = 78000;
    }

    const netPayableByCustomer = Math.max(0, grandTotal - subsidyAmount);

    return {
      materialsTotal,
      installationLabourCharges,
      subtotal,
      discount,
      gstRatePercent,
      gstAmount,
      grandTotal,
      subsidyAmount,
      netPayableByCustomer,
    };
  }, [calculatedItems, currentPackage, discountAmount]);

  const handleGenerateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSurvey || !currentPackage) return;

    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + Number(validityDays));
    const validUntil = expiryDate.toISOString().split('T')[0];

    const newQ = createQuotation({
      customerId: currentSurvey.customerId,
      customerName: currentSurvey.customerName,
      surveyId: currentSurvey.id,
      packageId: currentPackage.id,
      packageName: currentPackage.name,
      capacityKw: currentPackage.capacityKw,
      systemType: currentPackage.systemType,
      items: calculatedItems,
      materialsTotal: calculationSummary.materialsTotal,
      installationLabourCharges: calculationSummary.installationLabourCharges,
      subtotal: calculationSummary.subtotal,
      gstRatePercent: calculationSummary.gstRatePercent,
      gstAmount: calculationSummary.gstAmount,
      discountAmount: calculationSummary.discount,
      subsidyAmount: calculationSummary.subsidyAmount,
      grandTotal: calculationSummary.grandTotal,
      netPayableByCustomer: calculationSummary.netPayableByCustomer,
      validityDays: Number(validityDays),
      validUntil,
      status: 'Sent',
      notes: quotationNotes,
    });

    setIsNewModalOpen(false);
    setActiveQuotationForPrint(newQ);
    setIsPrintModalOpen(true);
  };

  const handleAcceptQuotation = (quotationId: string) => {
    acceptQuotation(quotationId);
    setIsPrintModalOpen(false);
    if (onNavigateToOrders) {
      onNavigateToOrders();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Solar Quotations & BOM Engine</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate formal solar system proposals from approved technical surveys with automated Bill of Materials & subsidy deduction.
          </p>
        </div>

        <button
          onClick={() => {
            if (approvedSurveys.length === 0) {
              alert('Please complete and approve at least one site survey first.');
              return;
            }
            setIsNewModalOpen(true);
          }}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Create New Quotation
        </button>
      </div>

      {/* Quotations List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <th className="py-3 px-4">Quote Number</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">System Package</th>
                <th className="py-3 px-4">Gross Value</th>
                <th className="py-3 px-4">PM Surya Subsidy</th>
                <th className="py-3 px-4">Net Customer Payable</th>
                <th className="py-3 px-4">Validity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {quotations.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                    {q.quotationNumber}
                  </td>
                  <td className="py-3 px-4 font-bold text-slate-900">{q.customerName}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{q.capacityKw} kW DC ({q.systemType})</div>
                    <div className="text-[11px] text-slate-500 truncate max-w-[200px]">{q.packageName}</div>
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-700">
                    ₹{q.grandTotal.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    {q.subsidyAmount > 0 ? (
                      <span className="font-bold text-emerald-700">
                        -₹{q.subsidyAmount.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-slate-400 font-medium">₹0</span>
                    )}
                  </td>
                  <td className="py-3 px-4 font-black text-emerald-700 text-sm">
                    ₹{q.netPayableByCustomer.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    Valid till {q.validUntil}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        q.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : q.status === 'Sent'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {q.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setActiveQuotationForPrint(q);
                          setIsPrintModalOpen(true);
                        }}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View PDF
                      </button>

                      {q.status !== 'Accepted' && (
                        <button
                          onClick={() => handleAcceptQuotation(q.id)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Accept & Order
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

      {/* New Quotation Generator Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-semibold text-sm">Solar Quotation & Bill of Materials Generator</h3>
                  <p className="text-[11px] text-slate-400">Strict technical workflow: only verified site surveys allowed</p>
                </div>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerateQuotation} className="p-6 space-y-5">
              {/* Step 1: Select Approved Survey */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  1. Select Approved Site Survey *
                </label>
                <select
                  value={selectedSurveyId}
                  onChange={(e) => setSelectedSurveyId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  {approvedSurveys.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.customerName} ({s.roofType}, Rec: {s.recommendedCapacityKw} kW DC) – Surveyed: {s.surveyDate}
                    </option>
                  ))}
                </select>
                {currentSurvey && (
                  <p className="mt-1 text-[11px] text-emerald-800 font-medium">
                    ✓ Verified Shadow-Free Area: {currentSurvey.shadowFreeAreaSqFt} sq. ft. • Tilt: {currentSurvey.roofTiltAngleDeg}° • Grid: {currentSurvey.gridSuitability}
                  </p>
                )}
              </div>

              {/* Step 2: Select Package Template */}
              <div>
                <label className="block text-slate-700 font-semibold mb-1">
                  2. Select Ready-Made Solar Package Template *
                </label>
                <select
                  value={selectedPackageId}
                  onChange={(e) => setSelectedPackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white font-bold text-emerald-900"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} ({pkg.capacityKw} kW {pkg.systemType}) – Base: ₹{pkg.basePrice.toLocaleString()}
                    </option>
                  ))}
                </select>
                {currentPackage && (
                  <p className="mt-1 text-slate-500 text-[11px]">
                    {currentPackage.description}
                  </p>
                )}
              </div>

              {/* Step 3: Auto-Calculated BOM Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                    Auto-Configured Bill of Materials (BOM)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Calculated for {currentPackage?.capacityKw} kW DC
                  </span>
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden max-h-44 overflow-y-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead className="bg-slate-50 text-slate-600 font-semibold sticky top-0 border-b border-slate-200">
                      <tr>
                        <th className="py-2 px-3">Component / Product</th>
                        <th className="py-2 px-3 text-center">Qty</th>
                        <th className="py-2 px-3 text-right">Unit Price</th>
                        <th className="py-2 px-3 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {calculatedItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-1.5 px-3">
                            <span className="font-medium text-slate-900">{item.productName}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">{item.sku}</span>
                          </td>
                          <td className="py-1.5 px-3 text-center font-bold text-slate-700">{item.quantity}</td>
                          <td className="py-1.5 px-3 text-right text-slate-600">₹{item.unitPrice.toLocaleString()}</td>
                          <td className="py-1.5 px-3 text-right font-medium text-slate-900">₹{item.totalPrice.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Adjustments: Discount, Validity, Notes */}
              <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Promotional Discount (₹)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={500}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Quotation Validity (Days)
                  </label>
                  <input
                    type="number"
                    min={5}
                    max={60}
                    value={validityDays}
                    onChange={(e) => setValidityDays(Number(e.target.value))}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-semibold mb-1">
                    Turnkey Installation Charge
                  </label>
                  <div className="px-3 py-1.5 border border-slate-200 bg-slate-100 rounded-lg font-bold text-slate-800">
                    ₹{calculationSummary.installationLabourCharges.toLocaleString()} (Fixed)
                  </div>
                </div>

                <div className="col-span-3">
                  <label className="block text-slate-700 font-semibold mb-1">
                    Terms & DISCOM Net-Metering Remarks
                  </label>
                  <input
                    type="text"
                    value={quotationNotes}
                    onChange={(e) => setQuotationNotes(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                  />
                </div>
              </div>

              {/* Live Price Calculation Summary */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex flex-col gap-1.5">
                <div className="flex justify-between text-slate-700">
                  <span>Subtotal (Materials + Erection):</span>
                  <span className="font-semibold">₹{calculationSummary.subtotal.toLocaleString()}</span>
                </div>
                {calculationSummary.discount > 0 && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Green Discount Applied:</span>
                    <span>-₹{calculationSummary.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-700">
                  <span>GST ({calculationSummary.gstRatePercent}%):</span>
                  <span>₹{calculationSummary.gstAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-emerald-200 pt-1">
                  <span>Gross Approved Value:</span>
                  <span>₹{calculationSummary.grandTotal.toLocaleString()}</span>
                </div>
                {calculationSummary.subsidyAmount > 0 && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-100/80 px-2 py-1 rounded">
                    <span>PM Surya Ghar Muft Bijli Central Subsidy (DBT):</span>
                    <span>-₹{calculationSummary.subsidyAmount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-emerald-950 font-black text-base border-t-2 border-emerald-600 pt-1.5">
                  <span>Net Customer Investment:</span>
                  <span className="text-lg text-emerald-700">₹{calculationSummary.netPayableByCustomer.toLocaleString()}</span>
                </div>
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
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <FileText className="w-4 h-4" />
                  Generate & Send Quotation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Printable Quotation Modal */}
      <PrintableQuotationModal
        quotation={activeQuotationForPrint}
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        onAccept={
          activeQuotationForPrint
            ? () => handleAcceptQuotation(activeQuotationForPrint.id)
            : undefined
        }
      />
    </div>
  );
};
