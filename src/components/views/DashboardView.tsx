import React, { useState, useMemo } from 'react';
import {
  Users,
  UserPlus,
  FileCheck,
  CheckCircle,
  Clock,
  TrendingUp,
  CreditCard,
  AlertTriangle,
  Wrench,
  DollarSign,
  ArrowUpRight,
  Calendar,
  Sparkles,
  Zap,
  ArrowRight,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useSolar } from '../../context/SolarContext';

interface DashboardViewProps {
  onNavigate: (viewId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onNavigate }) => {
  const {
    dashboardStats,
    customers,
    orders,
    payments,
    installations,
    serviceTickets,
    products,
    expenses,
    currentUser,
  } = useSolar();

  const [dateFilter, setDateFilter] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Chart data: Monthly Revenue vs Expenses
  const financialTrendData = useMemo(() => {
    return [
      { month: 'Jun', revenue: 145000, expenses: 95000, profit: 50000 },
      { month: 'Jul', revenue: 210000, expenses: 135000, profit: 75000 },
      { month: 'Aug', revenue: 290000, expenses: 180000, profit: 110000 },
      { month: 'Sep', revenue: 380000, expenses: 240000, profit: 140000 },
      {
        month: 'Oct (Current)',
        revenue: dashboardStats.totalRevenue,
        expenses: dashboardStats.totalExpenses,
        profit: dashboardStats.totalProfit,
      },
    ];
  }, [dashboardStats]);

  // Installation status breakdown data
  const installationStatusData = useMemo(() => {
    const scheduled = installations.filter((i) => i.status === 'Scheduled').length;
    const inProgress = installations.filter((i) => i.status === 'In Progress').length;
    const completed = installations.filter((i) => i.status === 'Completed').length;
    const delayed = installations.filter((i) => i.status === 'Delayed').length;

    return [
      { name: 'Completed', value: completed, color: '#059669' },
      { name: 'Scheduled', value: scheduled, color: '#3b82f6' },
      { name: 'In Progress', value: inProgress, color: '#f59e0b' },
      { name: 'Delayed', value: delayed, color: '#ef4444' },
    ].filter((item) => item.value > 0);
  }, [installations]);

  // Capacity distribution (kW)
  const capacityDistributionData = useMemo(() => {
    const dist: Record<string, number> = { '1-2 kW': 0, '3 kW': 0, '4-5 kW': 0 };
    orders.forEach((o) => {
      if (o.capacityKw <= 2) dist['1-2 kW'] += 1;
      else if (o.capacityKw === 3) dist['3 kW'] += 1;
      else dist['4-5 kW'] += 1;
    });
    return Object.entries(dist).map(([key, val]) => ({ capacity: key, orders: val }));
  }, [orders]);

  // Recent enquiries
  const recentEnquiries = useMemo(() => {
    return [...customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [customers]);

  // Upcoming installations
  const upcomingInstallations = useMemo(() => {
    return installations
      .filter((i) => i.status === 'Scheduled' || i.status === 'In Progress')
      .slice(0, 4);
  }, [installations]);

  // Recent payments
  const recentPayments = useMemo(() => {
    return [...payments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 4);
  }, [payments]);

  // Open complaints
  const openComplaints = useMemo(() => {
    return serviceTickets
      .filter((t) => t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress')
      .slice(0, 4);
  }, [serviceTickets]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900">
              Welcome back, {currentUser.name}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 capitalize">
              {currentUser.role.replace('_', ' ')}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            SunPower Solutions Rooftop Solar Operations • Live ERP Metrics
          </p>
        </div>

        {/* Date Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 self-start sm:self-auto">
          {(['today', 'week', 'month', 'all'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all capitalize cursor-pointer ${
                dateFilter === filter
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {filter === 'all' ? 'All Time' : `This ${filter}`}
            </button>
          ))}
        </div>
      </div>

      {/* 10 Core Live KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Total Customers */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Customers</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {dashboardStats.totalCustomers}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
            Active pipeline <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </p>
        </div>

        {/* New Enquiries */}
        <div
          onClick={() => onNavigate('customers')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">New Enquiries</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {dashboardStats.newEnquiries}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Awaiting survey</p>
        </div>

        {/* Confirmed Orders */}
        <div
          onClick={() => onNavigate('orders')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Confirmed Orders</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">
            {dashboardStats.confirmedOrders}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Sales agreements</p>
        </div>

        {/* Installations Completed */}
        <div
          onClick={() => onNavigate('installations')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Commissioned</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-600 mt-2">
            {dashboardStats.installationsCompleted}
          </p>
          <p className="text-[11px] text-emerald-700 font-medium mt-0.5">Grid synchronized</p>
        </div>

        {/* Installations Pending */}
        <div
          onClick={() => onNavigate('installations')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Pending Installs</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-700 mt-2">
            {dashboardStats.installationsPending}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Crew scheduled</p>
        </div>

        {/* Total Revenue */}
        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            ₹{(dashboardStats.totalRevenue / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Total project value</p>
        </div>

        {/* Total Expenses */}
        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Expenses</span>
            <div className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            ₹{(dashboardStats.totalExpenses / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Materials & wages</p>
        </div>

        {/* Total Net Profit */}
        <div
          onClick={() => onNavigate('finance')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Net Profit</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-emerald-700 mt-2">
            ₹{(dashboardStats.totalProfit / 100000).toFixed(2)}L
          </p>
          <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
            {dashboardStats.totalRevenue > 0
              ? `${Math.round((dashboardStats.totalProfit / dashboardStats.totalRevenue) * 100)}% margin`
              : '0% margin'}
          </p>
        </div>

        {/* Low Stock Alert */}
        <div
          onClick={() => onNavigate('inventory')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-amber-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Low Stock Alert</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-600 mt-2">
            {dashboardStats.lowStockProductsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Need re-ordering</p>
        </div>

        {/* Open Service Tickets */}
        <div
          onClick={() => onNavigate('service')}
          className="bg-white p-4 rounded-xl border border-slate-200 hover:border-emerald-500 transition-all shadow-xs cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Open Tickets</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-rose-600 mt-2">
            {dashboardStats.openServiceTicketsCount}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Maintenance active</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Financial Growth Chart (Area) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Revenue & Expense Performance</h2>
              <p className="text-xs text-slate-500">Actual billing value vs material & operational costs</p>
            </div>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Live Database
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={financialTrendData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} />
                <YAxis
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  axisLine={false}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString()}`, '']}
                  contentStyle={{
                    borderRadius: '8px',
                    borderColor: '#cbd5e1',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorRev)"
                  name="Revenue"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorExp)"
                  name="Expenses"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Installation Status Breakdown Pie */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col">
          <div className="mb-2">
            <h2 className="text-sm font-bold text-slate-900">Installation Status Distribution</h2>
            <p className="text-xs text-slate-500">Current state of {installations.length} total projects</p>
          </div>

          <div className="h-52 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={installationStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {installationStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Projects`, '']}
                  contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4 Multi-Module Operational Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Enquiries & Leads */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Customer Enquiries</h3>
            </div>
            <button
              onClick={() => onNavigate('customers')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              View All ({customers.length}) →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentEnquiries.map((cust) => (
              <div key={cust.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                <div>
                  <div className="font-semibold text-slate-900">{cust.name}</div>
                  <div className="text-slate-500">
                    {cust.city} • {cust.requiredCapacityKw} kW {cust.systemPreference}
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      cust.status === 'Converted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : cust.status === 'Survey Approved'
                        ? 'bg-blue-100 text-blue-800'
                        : cust.status === 'Quotation Sent'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {cust.status}
                  </span>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Bill: ₹{cust.monthlyElectricityBill.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Installations */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <h3 className="font-bold text-slate-900 text-sm">Upcoming Solar Installations</h3>
            </div>
            <button
              onClick={() => onNavigate('installations')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              Schedule Crew →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {upcomingInstallations.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No installations currently scheduled.
              </div>
            ) : (
              upcomingInstallations.map((inst) => (
                <div key={inst.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                  <div>
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="font-mono text-emerald-700">{inst.installationNumber}</span>
                      <span>•</span>
                      <span>{inst.customerName}</span>
                    </div>
                    <div className="text-slate-500">
                      Crew Lead: {inst.crewLeaderName} • {inst.capacityKw} kW {inst.systemType}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-slate-800">{inst.scheduledDate}</div>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                      {inst.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Payments Received */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">Recent Customer Payments</h3>
            </div>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold cursor-pointer"
            >
              All Receipts ({payments.length}) →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {recentPayments.map((pay) => (
              <div key={pay.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                <div>
                  <div className="font-semibold text-slate-900">{pay.customerName}</div>
                  <div className="text-slate-500">
                    {pay.receiptNumber} • {pay.paymentMethod}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-700 text-sm">
                    +₹{pay.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {pay.paymentType} • {pay.date}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Open Complaints / Service Tickets */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-rose-600" />
              <h3 className="font-bold text-slate-900 text-sm">Open Service Complaints</h3>
            </div>
            <button
              onClick={() => onNavigate('service')}
              className="text-xs text-rose-700 hover:text-rose-800 font-semibold cursor-pointer"
            >
              Manage Tickets →
            </button>
          </div>
          <div className="divide-y divide-slate-100">
            {openComplaints.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-xs">
                No open complaints at this time. All customer solar systems generating normally.
              </div>
            ) : (
              openComplaints.map((ticket) => (
                <div key={ticket.id} className="p-3.5 hover:bg-slate-50 flex items-center justify-between text-xs transition-colors">
                  <div className="max-w-[70%]">
                    <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                      <span className="font-mono text-rose-600">{ticket.ticketNumber}</span>
                      <span>•</span>
                      <span className="truncate">{ticket.customerName}</span>
                    </div>
                    <div className="text-slate-500 truncate mt-0.5">
                      Code: <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px]">{ticket.faultCode}</code> – {ticket.faultDescription}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ticket.priority === 'High' || ticket.priority === 'Emergency'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ticket.priority} Priority
                    </span>
                    <div className="text-[10px] text-slate-400 mt-0.5">{ticket.status}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
