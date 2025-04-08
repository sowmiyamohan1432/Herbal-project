export interface Stock {
    id?: string;                 // Optional ID for each stock item
    date: string;               // Date of the stock transaction
    referenceNo: string;        // Unique reference number
    locationFrom: string;       // Origin location
    locationTo: string;         // Destination location
    status: 'Pending' | 'In Transit' | 'Completed' | 'Cancelled';  // Status of the stock
    shippingCharges: number;    // Charges for shipping
    totalAmount: number;        // Total value of the stock
    additionalNotes?: string;   // Optional additional notes
  }
  