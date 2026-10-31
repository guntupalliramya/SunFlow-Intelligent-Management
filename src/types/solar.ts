export type UserRole =
  | 'admin'
  | 'sales_executive'
  | 'survey_technician'
  | 'warehouse_manager'
  | 'installation_technician'
  | 'service_technician';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar?: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Survey Scheduled'
  | 'Survey Approved'
  | 'Quotation Sent'
  | 'Converted'
  | 'Lost';

export type ElectricityConnectionType =
  | 'Single Phase LT'
  | 'Three Phase LT'
  | 'Commercial HT'
  | 'Agricultural';

export type SolarSystemPreference = 'On-Grid' | 'Off-Grid' | 'Hybrid';

export interface FollowUpNote {
  id: string;
  date: string;
  author: string;
  note: string;
  nextFollowUpDate?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  connectionType: ElectricityConnectionType;
  monthlyElectricityBill: number; // in INR / currency
  requiredCapacityKw: number; // e.g. 1 to 5 kW
  systemPreference: SolarSystemPreference;
  subsidyRequirement: boolean;
  additionalNotes?: string;
  status: LeadStatus;
  assignedSalesExecId?: string;
  assignedSalesExecName?: string;
  createdAt: string;
  updatedAt: string;
  followUps: FollowUpNote[];
}

export type SurveyStatus = 'Scheduled' | 'In Progress' | 'Submitted' | 'Approved' | 'Rejected';

export type RoofType = 'RCC Flat Roof' | 'Slanted Metal Sheet' | 'Tiled Roof' | 'Industrial Shed';

export interface SiteSurvey {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  assignedTechnicianId: string;
  assignedTechnicianName: string;
  surveyDate: string;
  roofType: RoofType;
  shadowFreeAreaSqFt: number;
  roofDirection: string; // e.g., 'True South', 'South-West', 'South-East'
  roofTiltAngleDeg: number; // e.g., 15, 20
  cableDistanceMeters: number; // Cable distance to main distribution box
  gridSuitability: 'Excellent' | 'Adequate' | 'Requires Phase Upgrade' | 'High Voltage Fluctuation';
  roofPhotographs: string[];
  technicalObservations: string;
  recommendedCapacityKw: number;
  status: SurveyStatus;
  approvalNotes?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProductCategory =
  | 'Solar Panels'
  | 'Inverters'
  | 'Batteries'
  | 'Charge Controllers'
  | 'Mounting Structures'
  | 'Wiring & Connectors'
  | 'Safety Switches'
  | 'Earthing Components'
  | 'Installation Services';

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: ProductCategory;
  unitPrice: number; // Selling price per unit
  purchaseCost: number; // Cost to company
  stockQuantity: number;
  minStockAlert: number;
  warrantyYears: number; // Configurable duration
  applicableSystemTypes: ('On-Grid' | 'Off-Grid' | 'Hybrid')[];
  requiresSerialTracking: boolean;
  description?: string;
  supplierName?: string;
}

export interface PackageComponent {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unit: string;
}

export interface SolarPackage {
  id: string;
  name: string;
  capacityKw: number; // 1, 2, 3, 4, 5 kW
  systemType: SolarSystemPreference;
  basePrice: number;
  description: string;
  components: PackageComponent[];
}

export type SerialStatus =
  | 'Available'
  | 'Reserved'
  | 'Dispatched'
  | 'Installed'
  | 'Under Repair'
  | 'Replaced';

export interface ProductSerialNumber {
  id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  supplier: string;
  purchaseDate: string;
  purchaseCost: number;
  status: SerialStatus;
  customerId?: string;
  customerName?: string;
  salesOrderId?: string;
  installationId?: string;
  dispatchedAt?: string;
  installedAt?: string;
  warrantyStartDate?: string;
  warrantyExpiryDate?: string;
}

export type QuotationStatus = 'Draft' | 'Sent' | 'Accepted' | 'Rejected' | 'Expired';

export interface QuotationItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  unitCost: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string; // e.g. QTN-2024-001
  customerId: string;
  customerName: string;
  surveyId: string;
  packageId: string;
  packageName: string;
  capacityKw: number;
  systemType: SolarSystemPreference;
  items: QuotationItem[];
  materialsTotal: number;
  installationLabourCharges: number;
  subtotal: number;
  gstRatePercent: number; // e.g. 12%
  gstAmount: number;
  discountAmount: number;
  subsidyAmount: number; // PM Surya Ghar / State subsidy
  grandTotal: number; // Subtotal + GST - Discount
  netPayableByCustomer: number; // GrandTotal - Subsidy
  validityDays: number;
  validUntil: string;
  status: QuotationStatus;
  notes?: string;
  createdAt: string;
  acceptedAt?: string;
}

export type PaymentStatus = 'Pending' | 'Partially Paid' | 'Paid' | 'Refunded';

export type PaymentMethod = 'Bank Transfer / NEFT' | 'UPI' | 'Cheque' | 'Credit Card' | 'Cash';

export interface PaymentRecord {
  id: string;
  receiptNumber: string; // RCPT-2024-001
  salesOrderId: string;
  orderNumber: string;
  customerName: string;
  amount: number;
  paymentType: 'Advance' | 'Milestone / Partial' | 'Final Balance';
  paymentMethod: PaymentMethod;
  referenceNumber: string;
  date: string;
  notes?: string;
}

export type OrderStatus =
  | 'Draft'
  | 'Confirmed'
  | 'Inventory Reserved'
  | 'Dispatched'
  | 'Under Installation'
  | 'Completed'
  | 'Cancelled';

export interface SalesOrder {
  id: string;
  orderNumber: string; // SO-2024-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  quotationId: string;
  quotationNumber: string;
  packageId: string;
  packageName: string;
  capacityKw: number;
  systemType: SolarSystemPreference;
  orderAmount: number; // Total order value
  advancePaymentRequired: number; // e.g. 40%
  advancePaid: number;
  totalPaid: number;
  balanceAmount: number;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  minAdvancePercent: number; // Configurable, default 40%
  expectedInstallationDate: string;
  dispatchedSerialNumbers: string[]; // List of serial numbers dispatched for this order
  isInventoryDispatched: boolean;
  createdAt: string;
  updatedAt: string;
}

export type InstallationStatus =
  | 'Scheduled'
  | 'In Progress'
  | 'Completed'
  | 'Delayed'
  | 'Cancelled';

export interface InstallationChecklistItem {
  id: string;
  title: string;
  isMandatory: boolean;
  completed: boolean;
}

export interface ElectricalTestingResult {
  vocMeasuredVolts: number; // Open Circuit Voltage
  iscMeasuredAmps: number; // Short Circuit Current
  inverterOutputWatts: number; // Instant kW generation verification
  gridVoltageVolts: number; // e.g. 235 V
  gridFrequencyHz: number; // e.g. 50.0 Hz
  earthingResistanceOhms: number; // e.g. < 2.5 ohms
}

export interface Installation {
  id: string;
  installationNumber: string; // INST-2024-001
  salesOrderId: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  capacityKw: number;
  systemType: SolarSystemPreference;
  scheduledDate: string;
  startTime?: string;
  finishTime?: string;
  crewLeaderId: string;
  crewLeaderName: string;
  technicianNames: string[];
  status: InstallationStatus;
  assignedSerialNumbers: string[];
  checklist: InstallationChecklistItem[];
  safetyChecklist: InstallationChecklistItem[];
  electricalTesting: ElectricalTestingResult;
  siteObservations: string;
  completionPhotographs: string[];
  customerSignature?: string; // Data URL or SVG string
  customerSignedName?: string;
  signedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type WarrantyStatus = 'Active' | 'Expired' | 'Replaced' | 'Cancelled';

export interface WarrantyAdjustmentLog {
  id: string;
  adjustedBy: string;
  date: string;
  previousExpiryDate: string;
  newExpiryDate: string;
  reason: string;
}

export interface WarrantyRecord {
  id: string;
  serialNumber: string;
  productId: string;
  productName: string;
  category: ProductCategory;
  customerId: string;
  customerName: string;
  customerPhone: string;
  installationId: string;
  installationNumber: string;
  installationDate: string;
  warrantyStartDate: string;
  warrantyExpiryDate: string;
  durationYears: number;
  status: WarrantyStatus;
  auditTrail: WarrantyAdjustmentLog[];
  createdAt: string;
  updatedAt: string;
}

export type TicketStatus =
  | 'Open'
  | 'Assigned'
  | 'In Progress'
  | 'Waiting for Parts'
  | 'Resolved'
  | 'Closed';

export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Emergency';

export interface ServiceHistoryItem {
  id: string;
  date: string;
  author: string;
  note: string;
  statusChange?: TicketStatus;
}

export interface ServiceTicket {
  id: string;
  ticketNumber: string; // TKT-2024-001
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  productId: string;
  productName: string;
  serialNumber: string;
  installationId: string;
  installationNumber: string;
  faultDescription: string;
  faultCode: string; // e.g., 'E01-GRID-OVERVOLT', 'E04-GROUND-FAULT', 'B02-BATT-UNDERVOLT'
  complaintDate: string;
  priority: TicketPriority;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  warrantyStatus: 'In Warranty' | 'Out of Warranty' | 'Warranty Void';
  warrantyRecordId?: string;
  partsCost: number;
  labourCost: number;
  isCoveredUnderWarranty: boolean;
  totalInvoiceAmount: number;
  status: TicketStatus;
  customerConfirmedResolution: boolean;
  resolutionNotes?: string;
  resolvedAt?: string;
  closedAt?: string;
  history: ServiceHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectProfitability {
  salesOrderId: string;
  orderNumber: string;
  customerName: string;
  capacityKw: number;
  systemType: SolarSystemPreference;
  revenue: number; // Approved sales value
  materialCost: number; // Purchase cost of components
  labourCost: number; // Technician installation costs
  otherExpenses: number; // Permitting, transport, miscellaneous
  totalCost: number;
  netProfit: number;
  profitMarginPercent: number;
  status: string;
  installationDate?: string;
}

export interface ExpenseRecord {
  id: string;
  category: 'Purchases / Inventory' | 'Technician Wages' | 'Transportation' | 'Net Metering / Permitting' | 'Tools & Safety' | 'Office & Admin';
  amount: number;
  date: string;
  relatedOrderId?: string;
  vendorName: string;
  description: string;
  receiptReference?: string;
}

export interface SubsidyRecord {
  id: string;
  salesOrderId: string;
  orderNumber: string;
  customerName: string;
  applicationNumber: string;
  subsidyScheme: string; // e.g. "PM Surya Ghar Muft Bijli Yojana"
  eligibleAmount: number;
  status: 'Draft' | 'Applied' | 'Site Inspection Done' | 'Approved' | 'Disbursed';
  submissionDate: string;
  disbursementDate?: string;
  remarks?: string;
}

export interface SystemSettings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  gstNumber: string;
  minAdvancePaymentPercent: number; // default 40%
  defaultGstPercent: number; // 12%
  demoMode: boolean;
  openRouterApiKey?: string;
  openRouterModel?: string;
}
