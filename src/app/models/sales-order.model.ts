export interface SalesOrder {
  id?: string;
  customer: string;
  contactNumber?: string;  // Added/confirmed for shipments
  billingAddress?: string;  // Added/confirmed for location
  shippingAddress?: string;
  saleDate: string;
  status: string;
  invoiceScheme?: string;
  invoiceNo?: string;
  document?: string;
  discountType?: string;
  discountAmount?: number;
  orderTax?: number;
  sellNote?: string;
  shippingCharges?: number;
  shippingStatus?: string;
  deliveryPerson?: string;  // Added/confirmed for delivery tracking
  shippingDocuments?: string;
  totalPayable: number;
  paymentAmount: number;
  paidOn?: string;
  paymentMethod: string;
  paymentNote?: string;
  changeReturn?: number;
  balance?: number;
  createdAt?: Date;
  updatedAt?: Date;


 }
