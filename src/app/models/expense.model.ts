// src/app/models/expense.model.ts
export interface Expense {
    id?: string; // Optional because it will be assigned by Firestore when creating
    businessLocation: string;
    expenseCategory: string;
    subCategory: string;
    referenceNo: string;
    date: string; // Using string to store ISO format (could also use Date or Firestore Timestamp)
    expenseFor: string;
    expenseForContact: string;
    document?: string; // Optional file attachment
    applicableTax: string;
    totalAmount: number;
    expenseNote: string;
    isRefund: boolean;
    isRecurring: boolean;
    recurringInterval: string;
    repetitions?: number; // Optional
    paymentAmount: number;
    paidOn: string; // Using string to store ISO format
    paymentMethod: string;
    paymentAccount?: string; // Optional
    paymentNote?: string; // Optional
  }
  
  // Optional: If you want to create a default empty expense object
  export const emptyExpense: Expense = {
    businessLocation: '',
    expenseCategory: '',
    subCategory: '',
    referenceNo: '',
    date: new Date().toISOString(),
    expenseFor: '',
    expenseForContact: '',
    applicableTax: 'None',
    totalAmount: 0,
    expenseNote: '',
    isRefund: false,
    isRecurring: false,
    recurringInterval: 'Days',
    paymentAmount: 0,
    paidOn: new Date().toISOString(),
    paymentMethod: 'Cash'
  };
