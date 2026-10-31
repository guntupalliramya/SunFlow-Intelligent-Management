import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Customer,
  SiteSurvey,
  Product,
  SolarPackage,
  ProductSerialNumber,
  Quotation,
  SalesOrder,
  PaymentRecord,
  Installation,
  WarrantyRecord,
  ServiceTicket,
  ExpenseRecord,
  SubsidyRecord,
  UserProfile,
  SystemSettings,
  ProjectProfitability,
  UserRole,
  TicketStatus,
} from '../types/solar';
import {
  DEMO_USERS,
  INITIAL_CUSTOMERS,
  INITIAL_EXPENSES,
  INITIAL_INSTALLATIONS,
  INITIAL_ORDERS,
  INITIAL_PACKAGES,
  INITIAL_PAYMENTS,
  INITIAL_PRODUCTS,
  INITIAL_SERIAL_NUMBERS,
  INITIAL_SETTINGS,
  INITIAL_SUBSIDIES,
  INITIAL_SURVEYS,
  INITIAL_WARRANTIES,
  INITIAL_SERVICE_TICKETS,
  INITIAL_QUOTATIONS,
} from '../data/initialDemoData';

interface DashboardStats {
  totalCustomers: number;
  newEnquiries: number;
  confirmedOrders: number;
  installationsCompleted: number;
  installationsPending: number;
  totalRevenue: number;
  totalExpenses: number;
  totalProfit: number;
  lowStockProductsCount: number;
  openServiceTicketsCount: number;
}

interface SolarContextType {
  // Current user & authentication
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
  users: UserProfile[];
  switchRole: (role: UserRole) => void;
  logout: () => void;
  login: (email: string, role?: UserRole) => boolean;

  // Data Collections
  customers: Customer[];
  surveys: SiteSurvey[];
  products: Product[];
  packages: SolarPackage[];
  serialNumbers: ProductSerialNumber[];
  quotations: Quotation[];
  orders: SalesOrder[];
  payments: PaymentRecord[];
  installations: Installation[];
  warranties: WarrantyRecord[];
  serviceTickets: ServiceTicket[];
  expenses: ExpenseRecord[];
  subsidies: SubsidyRecord[];
  settings: SystemSettings;

  // Live Calculations & Stats
  dashboardStats: DashboardStats;
  projectProfitabilityList: ProjectProfitability[];

  // Customer actions
  addCustomer: (cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'followUps'>) => { success: boolean; error?: string; customer?: Customer };
  updateCustomer: (customer: Customer) => void;
  addFollowUpNote: (customerId: string, note: string, nextFollowUpDate?: string) => void;

  // Survey actions
  scheduleSurvey: (survey: Omit<SiteSurvey, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => SiteSurvey;
  updateSurvey: (survey: SiteSurvey) => void;
  approveSurvey: (surveyId: string, notes?: string) => void;
  rejectSurvey: (surveyId: string, notes?: string) => void;

  // Product & Inventory actions
  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (product: Product) => void;
  addSerialNumber: (sn: Omit<ProductSerialNumber, 'id'>) => { success: boolean; error?: string; item?: ProductSerialNumber };
  updatePackageBOM: (pkg: SolarPackage) => void;

  // Quotation actions
  createQuotation: (q: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>) => Quotation;
  updateQuotation: (q: Quotation) => void;
  sendQuotation: (quotationId: string) => void;
  acceptQuotation: (quotationId: string) => SalesOrder;

  // Order & Payment actions
  updateOrder: (order: SalesOrder) => void;
  recordPayment: (params: {
    salesOrderId: string;
    amount: number;
    paymentType: 'Advance' | 'Milestone / Partial' | 'Final Balance';
    paymentMethod: PaymentRecord['paymentMethod'];
    referenceNumber: string;
    notes?: string;
  }) => PaymentRecord;

  // Dispatch & Serial scanning workflow
  dispatchOrderEquipment: (orderId: string, serialNumbersList: string[]) => { success: boolean; error?: string };

  // Installation actions
  scheduleInstallation: (params: {
    salesOrderId: string;
    scheduledDate: string;
    startTime: string;
    crewLeaderId: string;
    technicianNames: string[];
  }) => { success: boolean; error?: string; installation?: Installation };
  updateInstallation: (installation: Installation) => void;
  completeInstallation: (params: {
    installationId: string;
    finishTime: string;
    checklist: Installation['checklist'];
    safetyChecklist: Installation['safetyChecklist'];
    electricalTesting: Installation['electricalTesting'];
    siteObservations: string;
    completionPhotographs: string[];
    customerSignature: string;
    customerSignedName: string;
  }) => { success: boolean; error?: string };

  // Warranty actions
  adjustWarrantyDate: (warrantyId: string, newExpiryDate: string, reason: string) => void;

  // Service ticket actions
  createServiceTicket: (params: {
    customerId: string;
    productId: string;
    serialNumber: string;
    faultDescription: string;
    faultCode: string;
    priority: ServiceTicket['priority'];
    assignedTechnicianId?: string;
  }) => ServiceTicket;
  updateServiceTicket: (ticket: ServiceTicket) => void;
  resolveServiceTicket: (ticketId: string, resolutionNotes: string, customerConfirmed: boolean) => void;

  // Finance & Settings actions
  addExpense: (expense: Omit<ExpenseRecord, 'id'>) => ExpenseRecord;
  updateSubsidyRecord: (subsidy: SubsidyRecord) => void;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetToDemoData: () => void;
}

const STORAGE_KEY = 'sunflow_ai_solar_erp_v1';

const SolarContext = createContext<SolarContextType | undefined>(undefined);

export const SolarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load saved state or initial demo data
  const [hasLoaded, setHasLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile>(DEMO_USERS[0]); // Default Rajesh Sharma (Admin)
  const [users] = useState<UserProfile[]>(DEMO_USERS);

  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [surveys, setSurveys] = useState<SiteSurvey[]>(INITIAL_SURVEYS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [packages, setPackages] = useState<SolarPackage[]>(INITIAL_PACKAGES);
  const [serialNumbers, setSerialNumbers] = useState<ProductSerialNumber[]>(INITIAL_SERIAL_NUMBERS);
  const [quotations, setQuotations] = useState<Quotation[]>(INITIAL_QUOTATIONS);
  const [orders, setOrders] = useState<SalesOrder[]>(INITIAL_ORDERS);
  const [payments, setPayments] = useState<PaymentRecord[]>(INITIAL_PAYMENTS);
  const [installations, setInstallations] = useState<Installation[]>(INITIAL_INSTALLATIONS);
  const [warranties, setWarranties] = useState<WarrantyRecord[]>(INITIAL_WARRANTIES);
  const [serviceTickets, setServiceTickets] = useState<ServiceTicket[]>(INITIAL_SERVICE_TICKETS);
  const [expenses, setExpenses] = useState<ExpenseRecord[]>(INITIAL_EXPENSES);
  const [subsidies, setSubsidies] = useState<SubsidyRecord[]>(INITIAL_SUBSIDIES);
  const [settings, setSettings] = useState<SystemSettings>(INITIAL_SETTINGS);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.surveys) setSurveys(parsed.surveys);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.packages) setPackages(parsed.packages);
        if (parsed.serialNumbers) setSerialNumbers(parsed.serialNumbers);
        if (parsed.quotations) setQuotations(parsed.quotations);
        if (parsed.orders) setOrders(parsed.orders);
        if (parsed.payments) setPayments(parsed.payments);
        if (parsed.installations) setInstallations(parsed.installations);
        if (parsed.warranties) setWarranties(parsed.warranties);
        if (parsed.serviceTickets) setServiceTickets(parsed.serviceTickets);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.subsidies) setSubsidies(parsed.subsidies);
        if (parsed.settings) setSettings(parsed.settings);
      }
    } catch (e) {
      console.error('Failed to load SunFlow state from localStorage:', e);
    }
    setHasLoaded(true);
  }, []);

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      const stateToSave = {
        customers,
        surveys,
        products,
        packages,
        serialNumbers,
        quotations,
        orders,
        payments,
        installations,
        warranties,
        serviceTickets,
        expenses,
        subsidies,
        settings,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.error('Failed to save SunFlow state to localStorage:', e);
    }
  }, [
    hasLoaded,
    customers,
    surveys,
    products,
    packages,
    serialNumbers,
    quotations,
    orders,
    payments,
    installations,
    warranties,
    serviceTickets,
    expenses,
    subsidies,
    settings,
  ]);

  // Role switching
  const switchRole = (role: UserRole) => {
    const found = users.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
    } else {
      setCurrentUser({
        id: `user-${role}`,
        name: `${role.replace('_', ' ').toUpperCase()} User`,
        email: `${role}@sunflow.ai`,
        role,
        phone: '+91 99999 00000',
      });
    }
  };

  const login = (email: string, role?: UserRole): boolean => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase()) ||
      (role ? users.find((u) => u.role === role) : users[0]);
    if (user) {
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const logout = () => {
    // Revert to demo admin or guest
    setCurrentUser(DEMO_USERS[0]);
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    setCustomers(INITIAL_CUSTOMERS);
    setSurveys(INITIAL_SURVEYS);
    setProducts(INITIAL_PRODUCTS);
    setPackages(INITIAL_PACKAGES);
    setSerialNumbers(INITIAL_SERIAL_NUMBERS);
    setQuotations(INITIAL_QUOTATIONS);
    setOrders(INITIAL_ORDERS);
    setPayments(INITIAL_PAYMENTS);
    setInstallations(INITIAL_INSTALLATIONS);
    setWarranties(INITIAL_WARRANTIES);
    setServiceTickets(INITIAL_SERVICE_TICKETS);
    setExpenses(INITIAL_EXPENSES);
    setSubsidies(INITIAL_SUBSIDIES);
    setSettings(INITIAL_SETTINGS);
    setCurrentUser(DEMO_USERS[0]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Customer Management
  const addCustomer = (
    cust: Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'followUps'>
  ): { success: boolean; error?: string; customer?: Customer } => {
    // Duplicate phone check
    const normalizedPhone = cust.phone.replace(/[\s\-\+]/g, '');
    const exists = customers.some(
      (c) => c.phone.replace(/[\s\-\+]/g, '') === normalizedPhone
    );
    if (exists) {
      return {
        success: false,
        error: `Customer with phone ${cust.phone} already exists in the system!`,
      };
    }

    const newCust: Customer = {
      ...cust,
      id: `cust-${Date.now().toString().slice(-5)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      followUps: [],
    };

    setCustomers((prev) => [newCust, ...prev]);
    return { success: true, customer: newCust };
  };

  const updateCustomer = (updated: Customer) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : c))
    );
  };

  const addFollowUpNote = (customerId: string, note: string, nextFollowUpDate?: string) => {
    const newNote = {
      id: `fu-${Date.now()}`,
      date: new Date().toISOString(),
      author: currentUser.name,
      note,
      nextFollowUpDate,
    };
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === customerId) {
          return {
            ...c,
            updatedAt: new Date().toISOString(),
            followUps: [newNote, ...c.followUps],
          };
        }
        return c;
      })
    );
  };

  // Site Survey Management
  const scheduleSurvey = (
    surveyData: Omit<SiteSurvey, 'id' | 'createdAt' | 'updatedAt' | 'status'>
  ): SiteSurvey => {
    const newSurvey: SiteSurvey = {
      ...surveyData,
      id: `srv-${Date.now().toString().slice(-4)}`,
      status: 'Scheduled',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setSurveys((prev) => [newSurvey, ...prev]);

    // Update customer status to 'Survey Scheduled'
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === surveyData.customerId && c.status === 'New' || c.status === 'Contacted'
          ? { ...c, status: 'Survey Scheduled', updatedAt: new Date().toISOString() }
          : c
      )
    );

    return newSurvey;
  };

  const updateSurvey = (survey: SiteSurvey) => {
    setSurveys((prev) =>
      prev.map((s) => (s.id === survey.id ? { ...survey, updatedAt: new Date().toISOString() } : s))
    );
  };

  const approveSurvey = (surveyId: string, notes?: string) => {
    setSurveys((prev) =>
      prev.map((s) => {
        if (s.id === surveyId) {
          const updated: SiteSurvey = {
            ...s,
            status: 'Approved',
            approvalNotes: notes || 'Site survey reviewed and approved for quotation generation.',
            approvedBy: `${currentUser.name} (${currentUser.role})`,
            approvedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          // Update customer status to 'Survey Approved'
          setCustomers((custs) =>
            custs.map((c) =>
              c.id === s.customerId
                ? { ...c, status: 'Survey Approved', updatedAt: new Date().toISOString() }
                : c
            )
          );
          return updated;
        }
        return s;
      })
    );
  };

  const rejectSurvey = (surveyId: string, notes?: string) => {
    setSurveys((prev) =>
      prev.map((s) =>
        s.id === surveyId
          ? {
              ...s,
              status: 'Rejected',
              approvalNotes: notes || 'Site survey not approved due to shading or structural constraints.',
              updatedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  // Products & Inventory
  const addProduct = (prod: Omit<Product, 'id'>): Product => {
    const newProd: Product = {
      ...prod,
      id: `prod-${Date.now().toString().slice(-5)}`,
    };
    setProducts((prev) => [...prev, newProd]);
    return newProd;
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const addSerialNumber = (
    sn: Omit<ProductSerialNumber, 'id'>
  ): { success: boolean; error?: string; item?: ProductSerialNumber } => {
    // Check uniqueness
    const exists = serialNumbers.some(
      (item) => item.serialNumber.trim().toUpperCase() === sn.serialNumber.trim().toUpperCase()
    );
    if (exists) {
      return { success: false, error: `Serial Number ${sn.serialNumber} already exists in database!` };
    }

    const newItem: ProductSerialNumber = {
      ...sn,
      id: `sn-${Date.now()}`,
      serialNumber: sn.serialNumber.trim().toUpperCase(),
    };

    setSerialNumbers((prev) => [newItem, ...prev]);

    // Increase product stock quantity
    setProducts((prev) =>
      prev.map((p) => (p.id === sn.productId ? { ...p, stockQuantity: p.stockQuantity + 1 } : p))
    );

    return { success: true, item: newItem };
  };

  const updatePackageBOM = (pkg: SolarPackage) => {
    setPackages((prev) => prev.map((p) => (p.id === pkg.id ? pkg : p)));
  };

  // Quotation Management
  const createQuotation = (
    qData: Omit<Quotation, 'id' | 'quotationNumber' | 'createdAt'>
  ): Quotation => {
    const quoteNumber = `QTN-2024-${String(quotations.length + 1).padStart(3, '0')}`;
    const newQuotation: Quotation = {
      ...qData,
      id: `qtn-${Date.now()}`,
      quotationNumber: quoteNumber,
      createdAt: new Date().toISOString(),
    };

    setQuotations((prev) => [newQuotation, ...prev]);

    // Update customer status to 'Quotation Sent'
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === qData.customerId
          ? { ...c, status: 'Quotation Sent', updatedAt: new Date().toISOString() }
          : c
      )
    );

    return newQuotation;
  };

  const updateQuotation = (q: Quotation) => {
    setQuotations((prev) => prev.map((item) => (item.id === q.id ? q : item)));
  };

  const sendQuotation = (quotationId: string) => {
    setQuotations((prev) =>
      prev.map((q) => (q.id === quotationId ? { ...q, status: 'Sent' } : q))
    );
  };

  const acceptQuotation = (quotationId: string): SalesOrder => {
    const quotation = quotations.find((q) => q.id === quotationId);
    if (!quotation) throw new Error('Quotation not found');

    const customer = customers.find((c) => c.id === quotation.customerId);
    const orderNumber = `SO-2024-${String(orders.length + 1).padStart(3, '0')}`;
    const minAdvance = settings.minAdvancePaymentPercent || 40;
    const advanceRequired = Math.round((quotation.grandTotal * minAdvance) / 100);

    // Calculate default installation date (e.g. 10 days from now)
    const expectedDate = new Date();
    expectedDate.setDate(expectedDate.getDate() + 10);
    const expectedDateStr = expectedDate.toISOString().split('T')[0];

    const newOrder: SalesOrder = {
      id: `so-${Date.now()}`,
      orderNumber,
      customerId: quotation.customerId,
      customerName: quotation.customerName,
      customerPhone: customer?.phone || '+91 00000 00000',
      customerAddress: customer?.address || 'Site Address',
      quotationId: quotation.id,
      quotationNumber: quotation.quotationNumber,
      packageId: quotation.packageId,
      packageName: quotation.packageName,
      capacityKw: quotation.capacityKw,
      systemType: quotation.systemType,
      orderAmount: quotation.grandTotal,
      advancePaymentRequired: advanceRequired,
      advancePaid: 0,
      totalPaid: 0,
      balanceAmount: quotation.grandTotal,
      paymentStatus: 'Pending',
      status: 'Confirmed',
      minAdvancePercent: minAdvance,
      expectedInstallationDate: expectedDateStr,
      dispatchedSerialNumbers: [],
      isInventoryDispatched: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update quotation status
    setQuotations((prev) =>
      prev.map((q) =>
        q.id === quotationId
          ? { ...q, status: 'Accepted', acceptedAt: new Date().toISOString() }
          : q
      )
    );

    // Update customer status to 'Converted'
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === quotation.customerId
          ? { ...c, status: 'Converted', updatedAt: new Date().toISOString() }
          : c
      )
    );

    // Add order
    setOrders((prev) => [newOrder, ...prev]);

    // If subsidy is applicable, automatically register subsidy record
    if (quotation.subsidyAmount > 0) {
      const newSub: SubsidyRecord = {
        id: `sub-${Date.now()}`,
        salesOrderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        customerName: newOrder.customerName,
        applicationNumber: `PMSURYA-2024-${Math.floor(10000 + Math.random() * 90000)}`,
        subsidyScheme: 'PM Surya Ghar Muft Bijli Yojana',
        eligibleAmount: quotation.subsidyAmount,
        status: 'Applied',
        submissionDate: new Date().toISOString().split('T')[0],
        remarks: 'Auto-registered from accepted solar quotation.',
      };
      setSubsidies((prev) => [newSub, ...prev]);
    }

    return newOrder;
  };

  // Orders & Payment
  const updateOrder = (order: SalesOrder) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...order, updatedAt: new Date().toISOString() } : o))
    );
  };

  const recordPayment = ({
    salesOrderId,
    amount,
    paymentType,
    paymentMethod,
    referenceNumber,
    notes,
  }: {
    salesOrderId: string;
    amount: number;
    paymentType: 'Advance' | 'Milestone / Partial' | 'Final Balance';
    paymentMethod: PaymentRecord['paymentMethod'];
    referenceNumber: string;
    notes?: string;
  }): PaymentRecord => {
    const order = orders.find((o) => o.id === salesOrderId);
    if (!order) throw new Error('Sales Order not found');

    const receiptNumber = `RCPT-2024-${String(payments.length + 1).padStart(3, '0')}`;
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      receiptNumber,
      salesOrderId,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      amount,
      paymentType,
      paymentMethod,
      referenceNumber,
      date: new Date().toISOString().split('T')[0],
      notes,
    };

    setPayments((prev) => [newPayment, ...prev]);

    // Recalculate order balances
    const newTotalPaid = order.totalPaid + amount;
    const newBalance = Math.max(0, order.orderAmount - newTotalPaid);
    const newAdvancePaid =
      paymentType === 'Advance' ? order.advancePaid + amount : order.advancePaid;

    let newPaymentStatus: PaymentRecord['paymentType'] | SalesOrder['paymentStatus'] =
      newTotalPaid >= order.orderAmount ? 'Paid' : newTotalPaid > 0 ? 'Partially Paid' : 'Pending';

    setOrders((prev) =>
      prev.map((o) =>
        o.id === salesOrderId
          ? {
              ...o,
              totalPaid: newTotalPaid,
              advancePaid: newAdvancePaid,
              balanceAmount: newBalance,
              paymentStatus: newPaymentStatus as SalesOrder['paymentStatus'],
              updatedAt: new Date().toISOString(),
            }
          : o
      )
    );

    return newPayment;
  };

  // Dispatch & Serial Number Tracking
  const dispatchOrderEquipment = (
    orderId: string,
    serialNumbersList: string[]
  ): { success: boolean; error?: string } => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, error: 'Sales Order not found' };

    // Check payment conditions: Order must satisfy minimum advance payment percentage!
    const minAdvanceRequired = (order.orderAmount * (order.minAdvancePercent || 40)) / 100;
    if (order.totalPaid < minAdvanceRequired) {
      return {
        success: false,
        error: `Cannot dispatch equipment: Advance payment is below configured minimum (${order.minAdvancePercent}% = ₹${minAdvanceRequired.toLocaleString()}). Total paid so far: ₹${order.totalPaid.toLocaleString()}. Please record advance payment first.`,
      };
    }

    if (serialNumbersList.length === 0) {
      return { success: false, error: 'No serial numbers provided for dispatch.' };
    }

    // Check for duplicate serials in list
    const uniqueSerials = new Set(serialNumbersList);
    if (uniqueSerials.size !== serialNumbersList.length) {
      return { success: false, error: 'Duplicate serial numbers found in dispatch list.' };
    }

    // Validate that each serial exists in database and is Available or Reserved for this order
    for (const sn of serialNumbersList) {
      const record = serialNumbers.find(
        (s) => s.serialNumber.toUpperCase() === sn.trim().toUpperCase()
      );
      if (!record) {
        return { success: false, error: `Serial Number ${sn} was not found in inventory register!` };
      }
      if (record.status !== 'Available' && record.salesOrderId !== orderId) {
        return {
          success: false,
          error: `Serial Number ${sn} cannot be dispatched: current status is "${record.status}". Must be Available.`,
        };
      }
    }

    // Mark serial numbers as Dispatched
    const nowIso = new Date().toISOString();
    setSerialNumbers((prev) =>
      prev.map((s) => {
        if (serialNumbersList.map((x) => x.toUpperCase()).includes(s.serialNumber.toUpperCase())) {
          return {
            ...s,
            status: 'Dispatched',
            customerId: order.customerId,
            customerName: order.customerName,
            salesOrderId: order.id,
            dispatchedAt: nowIso,
          };
        }
        return s;
      })
    );

    // Update order
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              isInventoryDispatched: true,
              dispatchedSerialNumbers: Array.from(
                new Set([...o.dispatchedSerialNumbers, ...serialNumbersList])
              ),
              status: 'Dispatched',
              updatedAt: nowIso,
            }
          : o
      )
    );

    // Auto-create or link installation record if not already created
    const existingInst = installations.find((i) => i.salesOrderId === orderId);
    if (!existingInst) {
      const instNumber = `INST-2024-${String(installations.length + 1).padStart(3, '0')}`;
      const defaultChecklist = [
        { id: 'c1', title: 'Rooftop mounting structure anchored with M10 expansion fasteners', isMandatory: true, completed: false },
        { id: 'c2', title: 'Solar panel mid-clamps and end-clamps torqued to 12 Nm', isMandatory: true, completed: false },
        { id: 'c3', title: 'DC cables enclosed in UV-resistant PVC conduits with gland seals', isMandatory: true, completed: false },
        { id: 'c4', title: 'Inverter mounted vertically with 300mm side ventilation clearance', isMandatory: true, completed: false },
        { id: 'c5', title: 'AC and DC surge protection devices (SPDs) verified and grounded', isMandatory: true, completed: false },
        { id: 'c6', title: 'Chemical earth pit resistance tested (< 2.5 Ohms)', isMandatory: true, completed: false },
      ];
      const defaultSafety = [
        { id: 's1', title: 'Full body safety harness worn by all roof crew with lifeline anchoring', isMandatory: true, completed: false },
        { id: 's2', title: 'Non-conductive insulated safety shoes and rubber gloves used', isMandatory: true, completed: false },
        { id: 's3', title: 'Lockout-Tagout (LOTO) procedure followed on main distribution board', isMandatory: true, completed: false },
      ];

      const newInst: Installation = {
        id: `inst-${Date.now()}`,
        installationNumber: instNumber,
        salesOrderId: order.id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerAddress: order.customerAddress,
        capacityKw: order.capacityKw,
        systemType: order.systemType,
        scheduledDate: order.expectedInstallationDate,
        startTime: '09:00',
        crewLeaderId: 'user-install',
        crewLeaderName: 'Karthik Reddy',
        technicianNames: ['Karthik Reddy', 'Suresh Kumar'],
        status: 'Scheduled',
        assignedSerialNumbers: serialNumbersList,
        checklist: defaultChecklist,
        safetyChecklist: defaultSafety,
        electricalTesting: {
          vocMeasuredVolts: 0,
          iscMeasuredAmps: 0,
          inverterOutputWatts: 0,
          gridVoltageVolts: 0,
          gridFrequencyHz: 0,
          earthingResistanceOhms: 0,
        },
        siteObservations: 'Dispatched serial components allocated. Ready for technician execution.',
        completionPhotographs: [],
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      setInstallations((prev) => [newInst, ...prev]);
    } else {
      // Append serials to existing installation
      setInstallations((prev) =>
        prev.map((i) =>
          i.id === existingInst.id
            ? {
                ...i,
                assignedSerialNumbers: Array.from(
                  new Set([...i.assignedSerialNumbers, ...serialNumbersList])
                ),
                updatedAt: nowIso,
              }
            : i
        )
      );
    }

    return { success: true };
  };

  // Installation Scheduling & Completion
  const scheduleInstallation = ({
    salesOrderId,
    scheduledDate,
    startTime,
    crewLeaderId,
    technicianNames,
  }: {
    salesOrderId: string;
    scheduledDate: string;
    startTime: string;
    crewLeaderId: string;
    technicianNames: string[];
  }): { success: boolean; error?: string; installation?: Installation } => {
    // Conflict check: Check if crew leader or technician is already scheduled at this date & time
    const conflicting = installations.find(
      (inst) =>
        inst.scheduledDate === scheduledDate &&
        inst.status === 'Scheduled' &&
        (inst.crewLeaderId === crewLeaderId ||
          inst.technicianNames.some((t) => technicianNames.includes(t)))
    );

    if (conflicting) {
      return {
        success: false,
        error: `Schedule conflict: Technician/Crew is already assigned to ${conflicting.installationNumber} on ${scheduledDate}! Please choose another date or technician.`,
      };
    }

    const order = orders.find((o) => o.id === salesOrderId);
    if (!order) return { success: false, error: 'Sales Order not found' };

    const crewLeader = users.find((u) => u.id === crewLeaderId);
    const instNumber = `INST-2024-${String(installations.length + 1).padStart(3, '0')}`;

    const defaultChecklist = [
      { id: 'c1', title: 'Rooftop mounting structure anchored with M10 expansion fasteners', isMandatory: true, completed: false },
      { id: 'c2', title: 'Solar panel mid-clamps and end-clamps torqued to 12 Nm', isMandatory: true, completed: false },
      { id: 'c3', title: 'DC cables enclosed in UV-resistant PVC conduits with gland seals', isMandatory: true, completed: false },
      { id: 'c4', title: 'Inverter mounted vertically with 300mm side ventilation clearance', isMandatory: true, completed: false },
      { id: 'c5', title: 'AC and DC surge protection devices (SPDs) verified and grounded', isMandatory: true, completed: false },
      { id: 'c6', title: 'Chemical earth pit resistance tested (< 2.5 Ohms)', isMandatory: true, completed: false },
    ];
    const defaultSafety = [
      { id: 's1', title: 'Full body safety harness worn by all roof crew with lifeline anchoring', isMandatory: true, completed: false },
      { id: 's2', title: 'Non-conductive insulated safety shoes and rubber gloves used', isMandatory: true, completed: false },
      { id: 's3', title: 'Lockout-Tagout (LOTO) procedure followed on main distribution board', isMandatory: true, completed: false },
    ];

    const newInst: Installation = {
      id: `inst-${Date.now()}`,
      installationNumber: instNumber,
      salesOrderId: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerAddress: order.customerAddress,
      capacityKw: order.capacityKw,
      systemType: order.systemType,
      scheduledDate,
      startTime,
      crewLeaderId,
      crewLeaderName: crewLeader?.name || 'Assigned Crew Leader',
      technicianNames,
      status: 'Scheduled',
      assignedSerialNumbers: order.dispatchedSerialNumbers,
      checklist: defaultChecklist,
      safetyChecklist: defaultSafety,
      electricalTesting: {
        vocMeasuredVolts: 0,
        iscMeasuredAmps: 0,
        inverterOutputWatts: 0,
        gridVoltageVolts: 0,
        gridFrequencyHz: 0,
        earthingResistanceOhms: 0,
      },
      siteObservations: '',
      completionPhotographs: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setInstallations((prev) => [newInst, ...prev]);
    return { success: true, installation: newInst };
  };

  const updateInstallation = (inst: Installation) => {
    setInstallations((prev) => prev.map((i) => (i.id === inst.id ? inst : i)));
  };

  const completeInstallation = ({
    installationId,
    finishTime,
    checklist,
    safetyChecklist,
    electricalTesting,
    siteObservations,
    completionPhotographs,
    customerSignature,
    customerSignedName,
  }: {
    installationId: string;
    finishTime: string;
    checklist: Installation['checklist'];
    safetyChecklist: Installation['safetyChecklist'];
    electricalTesting: Installation['electricalTesting'];
    siteObservations: string;
    completionPhotographs: string[];
    customerSignature: string;
    customerSignedName: string;
  }): { success: boolean; error?: string } => {
    const inst = installations.find((i) => i.id === installationId);
    if (!inst) return { success: false, error: 'Installation record not found' };

    // Validate mandatory checklists
    const uncompletedMandatory = [
      ...checklist.filter((c) => c.isMandatory && !c.completed),
      ...safetyChecklist.filter((s) => s.isMandatory && !s.completed),
    ];

    if (uncompletedMandatory.length > 0) {
      return {
        success: false,
        error: `Cannot complete installation: ${uncompletedMandatory.length} mandatory checklist / safety items are not checked! Please verify all safety and structural requirements.`,
      };
    }

    if (!customerSignature || customerSignature.length < 50) {
      return {
        success: false,
        error: 'Customer digital signature is required before completing handover!',
      };
    }

    const completionDateStr = new Date().toISOString().split('T')[0];
    const nowIso = new Date().toISOString();

    // 1. Update Installation Record
    const updatedInst: Installation = {
      ...inst,
      finishTime,
      checklist,
      safetyChecklist,
      electricalTesting,
      siteObservations,
      completionPhotographs,
      customerSignature,
      customerSignedName,
      signedAt: nowIso,
      status: 'Completed',
      updatedAt: nowIso,
    };

    setInstallations((prev) => prev.map((i) => (i.id === installationId ? updatedInst : i)));

    // 2. Update Sales Order status
    setOrders((prev) =>
      prev.map((o) =>
        o.id === inst.salesOrderId
          ? { ...o, status: 'Completed', updatedAt: nowIso }
          : o
      )
    );

    // 3. Update all assigned Serial Numbers to status = 'Installed'
    setSerialNumbers((prev) =>
      prev.map((s) => {
        if (inst.assignedSerialNumbers.includes(s.serialNumber)) {
          return {
            ...s,
            status: 'Installed',
            installedAt: nowIso,
            installationId: inst.id,
            warrantyStartDate: completionDateStr,
          };
        }
        return s;
      })
    );

    // 4. AUTOMATIC WARRANTY ACTIVATION
    // For every assigned serial number, create an active warranty record based on product warranty config
    const newWarrantyRecords: WarrantyRecord[] = [];

    inst.assignedSerialNumbers.forEach((sn) => {
      const serialItem = serialNumbers.find((s) => s.serialNumber === sn);
      const product = products.find((p) => p.id === serialItem?.productId);
      const durationYears = product?.warrantyYears || 5;

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + durationYears);
      const expiryDateStr = expiryDate.toISOString().split('T')[0];

      // Check if already registered
      const alreadyHas = warranties.some((w) => w.serialNumber === sn);
      if (!alreadyHas) {
        newWarrantyRecords.push({
          id: `war-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          serialNumber: sn,
          productId: product?.id || 'prod-custom',
          productName: product?.name || serialItem?.productName || 'Solar Equipment',
          category: product?.category || serialItem?.category || 'Inverters',
          customerId: inst.customerId,
          customerName: inst.customerName,
          customerPhone: inst.customerPhone,
          installationId: inst.id,
          installationNumber: inst.installationNumber,
          installationDate: completionDateStr,
          warrantyStartDate: completionDateStr,
          warrantyExpiryDate: expiryDateStr,
          durationYears,
          status: 'Active',
          auditTrail: [
            {
              id: `aud-${Date.now()}`,
              adjustedBy: 'System (Automatic Handover Activation)',
              date: nowIso,
              previousExpiryDate: 'None',
              newExpiryDate: expiryDateStr,
              reason: `Automatic warranty activation upon verified installation completion and customer sign-off.`,
            },
          ],
          createdAt: nowIso,
          updatedAt: nowIso,
        });
      }
    });

    if (newWarrantyRecords.length > 0) {
      setWarranties((prev) => [...newWarrantyRecords, ...prev]);
    }

    return { success: true };
  };

  // Warranty Date Adjustment with Audit Trail
  const adjustWarrantyDate = (warrantyId: string, newExpiryDate: string, reason: string) => {
    setWarranties((prev) =>
      prev.map((w) => {
        if (w.id === warrantyId) {
          const auditLog = {
            id: `aud-${Date.now()}`,
            adjustedBy: `${currentUser.name} (${currentUser.role})`,
            date: new Date().toISOString(),
            previousExpiryDate: w.warrantyExpiryDate,
            newExpiryDate,
            reason,
          };
          return {
            ...w,
            warrantyExpiryDate: newExpiryDate,
            auditTrail: [auditLog, ...w.auditTrail],
            updatedAt: new Date().toISOString(),
          };
        }
        return w;
      })
    );
  };

  // Service Complaints & Tickets
  const createServiceTicket = ({
    customerId,
    productId,
    serialNumber,
    faultDescription,
    faultCode,
    priority,
    assignedTechnicianId,
  }: {
    customerId: string;
    productId: string;
    serialNumber: string;
    faultDescription: string;
    faultCode: string;
    priority: ServiceTicket['priority'];
    assignedTechnicianId?: string;
  }): ServiceTicket => {
    const customer = customers.find((c) => c.id === customerId);
    const product = products.find((p) => p.id === productId);
    const tech = users.find((u) => u.id === assignedTechnicianId);

    // Look up warranty status for this exact serial number
    const warranty = warranties.find((w) => w.serialNumber === serialNumber);
    const todayStr = new Date().toISOString().split('T')[0];

    const isWarrantyActive =
      warranty && warranty.status === 'Active' && warranty.warrantyExpiryDate >= todayStr;

    const partsCost = isWarrantyActive ? 0 : 4500;
    const labourCost = isWarrantyActive ? 0 : 1500;
    const totalInvoiceAmount = partsCost + labourCost;

    const ticketNumber = `TKT-2024-${String(serviceTickets.length + 1).padStart(3, '0')}`;
    const nowIso = new Date().toISOString();

    const newTicket: ServiceTicket = {
      id: `tkt-${Date.now()}`,
      ticketNumber,
      customerId,
      customerName: customer?.name || 'Customer',
      customerPhone: customer?.phone || '',
      customerAddress: customer?.address || '',
      productId,
      productName: product?.name || 'Equipment',
      serialNumber,
      installationId: warranty?.installationId || 'INST-UNKNOWN',
      installationNumber: warranty?.installationNumber || 'INST-UNKNOWN',
      faultDescription,
      faultCode,
      complaintDate: todayStr,
      priority,
      assignedTechnicianId: tech?.id,
      assignedTechnicianName: tech?.name,
      warrantyStatus: isWarrantyActive ? 'In Warranty' : 'Out of Warranty',
      warrantyRecordId: warranty?.id,
      partsCost,
      labourCost,
      isCoveredUnderWarranty: !!isWarrantyActive,
      totalInvoiceAmount,
      status: assignedTechnicianId ? 'Assigned' : 'Open',
      customerConfirmedResolution: false,
      history: [
        {
          id: `h-${Date.now()}`,
          date: nowIso,
          author: currentUser.name,
          note: `Complaint logged: ${faultDescription}. Warranty verified: ${
            isWarrantyActive ? 'Covered under manufacturer warranty (₹0 charge).' : 'Warranty expired (Service charges apply).'
          }`,
          statusChange: assignedTechnicianId ? 'Assigned' : 'Open',
        },
      ],
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    setServiceTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateServiceTicket = (ticket: ServiceTicket) => {
    setServiceTickets((prev) => prev.map((t) => (t.id === ticket.id ? ticket : t)));
  };

  const resolveServiceTicket = (
    ticketId: string,
    resolutionNotes: string,
    customerConfirmed: boolean
  ) => {
    const nowIso = new Date().toISOString();
    setServiceTickets((prev) =>
      prev.map((t) => {
        if (t.id === ticketId) {
          const newStatus: TicketStatus = customerConfirmed ? 'Closed' : 'Resolved';
          const historyEntry = {
            id: `h-${Date.now()}`,
            date: nowIso,
            author: currentUser.name,
            note: customerConfirmed
              ? `Customer confirmed resolution. Ticket closed. Notes: ${resolutionNotes}`
              : `Technician completed resolution. Awaiting customer confirmation. Notes: ${resolutionNotes}`,
            statusChange: newStatus,
          };
          return {
            ...t,
            status: newStatus,
            customerConfirmedResolution: customerConfirmed,
            resolutionNotes,
            resolvedAt: t.resolvedAt || nowIso,
            closedAt: customerConfirmed ? nowIso : undefined,
            history: [historyEntry, ...t.history],
            updatedAt: nowIso,
          };
        }
        return t;
      })
    );
  };

  // Expenses & Finance
  const addExpense = (expenseData: Omit<ExpenseRecord, 'id'>): ExpenseRecord => {
    const newExp: ExpenseRecord = {
      ...expenseData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExp, ...prev]);
    return newExp;
  };

  const updateSubsidyRecord = (subsidy: SubsidyRecord) => {
    setSubsidies((prev) => prev.map((s) => (s.id === subsidy.id ? subsidy : s)));
  };

  const updateSettings = (newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Calculate live project profitability
  const projectProfitabilityList = useMemo<ProjectProfitability[]>(() => {
    return orders.map((order) => {
      const quotation = quotations.find((q) => q.id === order.quotationId);

      // Material cost based on quotation items unitCost
      let materialCost = 0;
      if (quotation && quotation.items) {
        materialCost = quotation.items.reduce(
          (sum, item) => sum + (item.unitCost || item.unitPrice * 0.72) * item.quantity,
          0
        );
      } else {
        materialCost = Math.round(order.orderAmount * 0.65);
      }

      // Labour cost from expenses related to this order or standard rate (₹2000 per kW)
      const relatedExpenses = expenses.filter((e) => e.relatedOrderId === order.id);
      const orderLabourExpenses = relatedExpenses
        .filter((e) => e.category === 'Technician Wages')
        .reduce((sum, e) => sum + e.amount, 0);
      const labourCost = orderLabourExpenses > 0 ? orderLabourExpenses : order.capacityKw * 2000;

      // Other project expenses (transportation, net metering)
      const otherExpenses = relatedExpenses
        .filter((e) => e.category !== 'Technician Wages' && e.category !== 'Purchases / Inventory')
        .reduce((sum, e) => sum + e.amount, 0);

      const totalCost = materialCost + labourCost + otherExpenses;
      const netProfit = order.orderAmount - totalCost;
      const profitMarginPercent =
        order.orderAmount > 0 ? Math.round((netProfit / order.orderAmount) * 1000) / 10 : 0;

      const inst = installations.find((i) => i.salesOrderId === order.id);

      return {
        salesOrderId: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        capacityKw: order.capacityKw,
        systemType: order.systemType,
        revenue: order.orderAmount,
        materialCost,
        labourCost,
        otherExpenses,
        totalCost,
        netProfit,
        profitMarginPercent,
        status: order.status,
        installationDate: inst?.scheduledDate,
      };
    });
  }, [orders, quotations, expenses, installations]);

  // Live Dashboard Statistics
  const dashboardStats = useMemo<DashboardStats>(() => {
    const totalCustomers = customers.length;
    const newEnquiries = customers.filter(
      (c) => c.status === 'New' || c.status === 'Contacted'
    ).length;
    const confirmedOrders = orders.filter((o) => o.status !== 'Cancelled').length;
    const installationsCompleted = installations.filter((i) => i.status === 'Completed').length;
    const installationsPending = installations.filter(
      (i) => i.status === 'Scheduled' || i.status === 'In Progress'
    ).length;

    // Total revenue = sum of approved sales orders (Do NOT double-count advance payments!)
    const totalRevenue = orders.reduce((sum, o) => sum + o.orderAmount, 0);

    // Total expenses = sum of all logged expenses
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

    const totalProfit = totalRevenue - totalExpenses;

    const lowStockProductsCount = products.filter(
      (p) => p.category !== 'Installation Services' && p.stockQuantity <= p.minStockAlert
    ).length;

    const openServiceTicketsCount = serviceTickets.filter(
      (t) => t.status === 'Open' || t.status === 'Assigned' || t.status === 'In Progress'
    ).length;

    return {
      totalCustomers,
      newEnquiries,
      confirmedOrders,
      installationsCompleted,
      installationsPending,
      totalRevenue,
      totalExpenses,
      totalProfit,
      lowStockProductsCount,
      openServiceTicketsCount,
    };
  }, [customers, orders, installations, expenses, products, serviceTickets]);

  return (
    <SolarContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        users,
        switchRole,
        logout,
        login,
        customers,
        surveys,
        products,
        packages,
        serialNumbers,
        quotations,
        orders,
        payments,
        installations,
        warranties,
        serviceTickets,
        expenses,
        subsidies,
        settings,
        dashboardStats,
        projectProfitabilityList,
        addCustomer,
        updateCustomer,
        addFollowUpNote,
        scheduleSurvey,
        updateSurvey,
        approveSurvey,
        rejectSurvey,
        addProduct,
        updateProduct,
        addSerialNumber,
        updatePackageBOM,
        createQuotation,
        updateQuotation,
        sendQuotation,
        acceptQuotation,
        updateOrder,
        recordPayment,
        dispatchOrderEquipment,
        scheduleInstallation,
        updateInstallation,
        completeInstallation,
        adjustWarrantyDate,
        createServiceTicket,
        updateServiceTicket,
        resolveServiceTicket,
        addExpense,
        updateSubsidyRecord,
        updateSettings,
        resetToDemoData,
      }}
    >
      {children}
    </SolarContext.Provider>
  );
};

export const useSolar = () => {
  const context = useContext(SolarContext);
  if (!context) {
    throw new Error('useSolar must be used within a SolarProvider');
  }
  return context;
};
