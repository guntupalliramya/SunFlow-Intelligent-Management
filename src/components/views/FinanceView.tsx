import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  CreditCard,
  DollarSign,
  Download,
  Plus,
  Filter,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  X,
  PieChart as PieIcon,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ExpenseRecord, SubsidyRecord } from '../../types/solar';
import { useSolar } from '../../context/SolarContext';

export const FinanceView: React.FC = () => {
  const {
    projectProfitabilityList,
    expenses,
    subsidies,
    orders,
    payments,
    addExpense,
    updateSubsidyRecord,
  } = useSolar();

  const [activeTab, setActiveTab] = useState<'projects' | 'expenses' | 'subsidies'>('projects');
  const [searchQuery, setSearchQuery] = useState('');

  // Add Expense Modal
  const [isAddExpenseModalOpen, setIsAddExpenseModalOpen] = useState(false);
  const [expenseForm, setExpenseForm] = useState({
    category: 'Technician Wages' as ExpenseRecord['category'],
    amount: 5000,
    date: new Date().toISOString().split('T')[0],
    relatedOrderId: orders[0]?.id || '',
    vendorName: 'SunPower Installation Crew',
    description: 'Labour payout for installation',
    receiptReference: 'VOUCHER-01',
  });

  // Financial Rollups
  const financeRollup = useMemo(() => {
    // Total approved sales value (not double-counting advance payments!)
    const totalApprovedRevenue = orders.reduce((sum, o) => sum + o.orderAmount, 0);
    const totalCollectedCash = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalOutstandingReceivables = orders.reduce((sum, o) => sum + o.balanceAmount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const netProfit = totalApprovedRevenue - totalExpenses;
    const overallMargin =
      totalApprovedRevenue > 0 ? Math.round((netProfit / totalApprovedRevenue) * 1000) / 10 : 0;

    return {
      totalApprovedRevenue,
      totalCollectedCash,
      totalOutstandingReceivables,
      totalExpenses,
      netProfit,
      overallMargin,
    };
  }, [orders, payments, expenses]);

  // Expenses by Category Data for Pie
  const expensesByCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });

    const colors = ['#059669', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#64748b'];
    return Object.entries(map).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [expenses]);

  // Filtered project list
  const filteredProjects = useMemo(() => {
    return projectProfitabilityList.filter((p) => {
      return (
        p.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.customerName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [projectProfitabilityList, searchQuery]);

  // Export to CSV
  const handleExportCSV = () => {
    let headers = 'Order Number,Customer,Capacity (kW),System Type,Revenue (INR),Material Cost (INR),Labour Cost (INR),Total Cost (INR),Net Profit (INR),Margin (%),Status\n';
    let rows = projectProfitabilityList
      .map(
        (p) =>
          `"${p.orderNumber}","${p.customerName}",${p.capacityKw},"${p.systemType}",${p.revenue},${p.materialCost},${p.labourCost},${p.totalCost},${p.netProfit},${p.profitMarginPercent}%,"${p.status}"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SunFlow_Project_Profitability_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSaveExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseForm.amount || !expenseForm.vendorName) return;

    addExpense({
      category: expenseForm.category,
      amount: Number(expenseForm.amount),
      date: expenseForm.date,
      relatedOrderId: expenseForm.relatedOrderId || undefined,
      vendorName: expenseForm.vendorName,
      description: expenseForm.description,
      receiptReference: expenseForm.receiptReference,
    });

    setIsAddExpenseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Finance, Expenses & Project Profitability</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real margin accounting: Project Profit = Revenue - (Materials + Labour + Operations). Advance payments tracked cleanly.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-600" />
            Export CSV
          </button>

          <button
            onClick={() => setIsAddExpenseModalOpen(true)}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Record Operational Expense
          </button>
        </div>
      </div>

      {/* 4 Core Financial Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Approved Sales Value</span>
          <p className="text-2xl font-black text-slate-900 mt-1">
            ₹{(financeRollup.totalApprovedRevenue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total booked projects</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Collected Cash (Payments)</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ₹{(financeRollup.totalCollectedCash / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Pending: ₹{(financeRollup.totalOutstandingReceivables / 1000).toFixed(0)}k
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Cost of Goods & Ops</span>
          <p className="text-2xl font-black text-red-600 mt-1">
            ₹{(financeRollup.totalExpenses / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Materials, wages, transport</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Net Realized Profit</span>
          <p className="text-2xl font-black text-emerald-800 mt-1">
            ₹{(financeRollup.netProfit / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-emerald-700 font-bold mt-0.5">
            {financeRollup.overallMargin}% Overall Profit Margin
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs">
        <button
          onClick={() => setActiveTab('projects')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'projects'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Project-by-Project Profit & Margins ({projectProfitabilityList.length})
        </button>

        <button
          onClick={() => setActiveTab('expenses')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'expenses'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Expense Ledger ({expenses.length})
        </button>

        <button
          onClick={() => setActiveTab('subsidies')}
          className={`px-4 py-2.5 font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'subsidies'
              ? 'border-emerald-600 text-emerald-800'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          PM Surya Ghar Subsidy Tracker ({subsidies.length})
        </button>
      </div>

      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Order Ref</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">System Spec</th>
                    <th className="py-3 px-4 text-right">Revenue (₹)</th>
                    <th className="py-3 px-4 text-right">Material Cost</th>
                    <th className="py-3 px-4 text-right">Labour & Transport</th>
                    <th className="py-3 px-4 text-right">Total Cost</th>
                    <th className="py-3 px-4 text-right">Net Profit</th>
                    <th className="py-3 px-4 text-right">Margin (%)</th>
                    <th className="py-3 px-4">Project Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProjects.map((p) => (
                    <tr key={p.salesOrderId} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.orderNumber}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900">{p.customerName}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {p.capacityKw} kW {p.systemType}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-slate-900">
                        ₹{p.revenue.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{p.materialCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right text-slate-600">
                        ₹{(p.labourCost + p.otherExpenses).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-slate-800">
                        ₹{p.totalCost.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-700">
                        ₹{p.netProfit.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <span
                          className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                            p.profitMarginPercent >= 25
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {p.profitMarginPercent}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-600 text-[11px]">
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Vendor / Payee</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {expenses.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-4 text-slate-600">{e.date}</td>
                      <td className="py-2.5 px-4 font-semibold text-slate-800">{e.category}</td>
                      <td className="py-2.5 px-4 text-slate-700">{e.vendorName}</td>
                      <td className="py-2.5 px-4 text-slate-500 truncate max-w-xs">{e.description}</td>
                      <td className="py-2.5 px-4 text-right font-black text-red-600">
                        ₹{e.amount.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
            <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Expense Distribution
            </h3>
            <div className="h-56 w-full flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expensesByCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expensesByCategoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'subsidies' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                  <th className="py-3 px-4">Application Number</th>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Scheme</th>
                  <th className="py-3 px-4 text-right">Eligible Subsidy</th>
                  <th className="py-3 px-4">National Portal Status</th>
                  <th className="py-3 px-4">Submitted Date</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subsidies.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {sub.applicationNumber}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900">{sub.customerName}</td>
                    <td className="py-3 px-4 text-slate-700">{sub.subsidyScheme}</td>
                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      ₹{sub.eligibleAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{sub.submissionDate}</td>
                    <td className="py-3 px-4 text-slate-500 italic max-w-xs truncate">
                      {sub.remarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {isAddExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full my-8 overflow-hidden border border-slate-200 text-xs">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h3 className="font-semibold text-sm">Record Operational Expense</h3>
              </div>
              <button
                onClick={() => setIsAddExpenseModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Category *</label>
                <select
                  value={expenseForm.category}
                  onChange={(e) =>
                    setExpenseForm({
                      ...expenseForm,
                      category: e.target.value as ExpenseRecord['category'],
                    })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Purchases / Inventory">Purchases / Inventory</option>
                  <option value="Technician Wages">Technician Wages (Installation Payout)</option>
                  <option value="Transportation">Transportation & Logistics</option>
                  <option value="Net Metering / Permitting">Net Metering & Discom Fees</option>
                  <option value="Tools & Safety">Tools & Safety Equipment</option>
                  <option value="Office & Admin">Office & Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Amount (₹) *</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={expenseForm.amount}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, amount: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-sm font-bold text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Vendor / Payee *</label>
                <input
                  type="text"
                  required
                  value={expenseForm.vendorName}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, vendorName: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Expense Date *</label>
                <input
                  type="date"
                  required
                  value={expenseForm.date}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Related Project Order</label>
                <select
                  value={expenseForm.relatedOrderId}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, relatedOrderId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="">None (General Overhead)</option>
                  {orders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.orderNumber} – {o.customerName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-semibold mb-1">Description</label>
                <input
                  type="text"
                  value={expenseForm.description}
                  onChange={(e) =>
                    setExpenseForm({ ...expenseForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddExpenseModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-lg font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs cursor-pointer"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
