export interface Purchase {
    id: string;
    referenceNo: string;
    purchaseDate: string | null;
    supplierName: string;
    businessLocation: string;
    purchaseStatus: string;
    paymentStatus: string;
    grandTotal: number;
    paymentDue: number;
    items: any[];  // You should define the type of items based on your actual data structure
    supplierId: string;
    address: string;
    payTerm: string;
    document: any | null;
    discountType: string;
    discountAmount: number;
    purchaseTax: number;
    additionalNotes: string;
    shippingCharges: number;
    additionalExpenses: any[];  // Define the type of additionalExpenses if necessary
    purchaseTotal: number;
    paymentAmount: number;
    paidOn: Date;
    paymentMethod: string;
    paymentAccount: string;
    paymentNote: string;
    createdAt: Date;
    updatedAt: Date;
  }
  