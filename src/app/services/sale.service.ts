import { Injectable } from '@angular/core';
import { Firestore, collection, query, where, orderBy, onSnapshot, addDoc, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface SalesOrder {
  id: string;
  customer: string;
  saleDate: string;
  invoiceNo: string;
  status: string;
  shippingStatus: string;
  paymentAmount: number;
  shippingCharges: number;
  discountAmount: number;
  balance: number;
  businessLocation?: string; // Added to match filter options
}

interface FilterOptions {
  businessLocation?: string;
  customer?: string;
  status?: string;
  shippingStatus?: string;
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class SaleService {
  constructor(private firestore: Firestore) {}

  // Enhanced with filter support
  listenForSales(filterOptions?: FilterOptions): Observable<SalesOrder[]> {
    return new Observable<SalesOrder[]>((observer) => {
      let salesCollection = collection(this.firestore, 'sales');
      let q = query(salesCollection, orderBy('saleDate', 'desc'));

      // Apply filters if provided
      if (filterOptions) {
        const conditions = [];
        
        if (filterOptions.businessLocation) {
          conditions.push(where('businessLocation', '==', filterOptions.businessLocation));
        }
        
        if (filterOptions.customer) {
          conditions.push(where('customer', '==', filterOptions.customer));
        }
        
        if (filterOptions.status) {
          conditions.push(where('status', '==', filterOptions.status));
        }
        
        if (filterOptions.shippingStatus) {
          conditions.push(where('shippingStatus', '==', filterOptions.shippingStatus));
        }
        
        if (filterOptions.dateRange?.startDate && filterOptions.dateRange?.endDate) {
          conditions.push(
            where('saleDate', '>=', filterOptions.dateRange.startDate),
            where('saleDate', '<=', filterOptions.dateRange.endDate)
          );
        }

        q = query(salesCollection, ...conditions, orderBy('saleDate', 'desc'));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const sales: SalesOrder[] = querySnapshot.docs.map(doc => {
          const data = doc.data() as Omit<SalesOrder, 'id'>;
          return { id: doc.id, ...data };
          
        });
        observer.next(sales);
      });

      return () => unsubscribe();
    });
  }

  // New export method
  async exportSales(format: 'csv' | 'excel' | 'pdf', filterOptions?: FilterOptions): Promise<void> {
    // Get filtered data
    const sales = await new Promise<SalesOrder[]>((resolve) => {
      const sub = this.listenForSales(filterOptions).subscribe(data => {
        resolve(data);
        sub.unsubscribe();
      });
    });

    // Implement export logic based on format
    switch (format) {
      case 'csv':
        this.exportToCSV(sales);
        break;
      case 'excel':
        this.exportToExcel(sales);
        break;
      case 'pdf':
        this.exportToPDF(sales);
        break;
      default:
        console.warn('Unsupported export format:', format);
    }
  }

  private exportToCSV(sales: SalesOrder[]): void {
    // CSV header
    const headers = Object.keys(sales[0]).join(',');
    const rows = sales.map(sale => Object.values(sale).join(','));
    const csvContent = [headers, ...rows].join('\n');
    
    // Create download link
    this.downloadFile(csvContent, 'sales_export.csv', 'text/csv');
  }

  private exportToExcel(sales: SalesOrder[]): void {
    // Simplified Excel export (would typically use a library like xlsx)
    const excelContent = sales.map(sale => JSON.stringify(sale)).join('\n');
    this.downloadFile(excelContent, 'sales_export.xlsx', 'application/vnd.ms-excel');
  }

  private exportToPDF(sales: SalesOrder[]): void {
    // Simplified PDF export (would typically use a library like jspdf)
    const pdfContent = sales.map(sale => JSON.stringify(sale)).join('\n\n');
    this.downloadFile(pdfContent, 'sales_export.pdf', 'application/pdf');
  }

  private downloadFile(content: string, fileName: string, fileType: string): void {
    const blob = new Blob([content], { type: fileType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async addSale(saleData: Omit<SalesOrder, 'id'>): Promise<void> {
    const salesCollection = collection(this.firestore, 'sales');
    await addDoc(salesCollection, saleData);
  }

  async deleteSale(saleId: string): Promise<void> {
    const saleDoc = doc(this.firestore, 'sales', saleId);
    await deleteDoc(saleDoc);
  }
  getSaleById(saleId: string): Observable<SalesOrder> {
    return new Observable<SalesOrder>((observer) => {
      const saleDocRef = doc(this.firestore, 'sales', saleId);
      
      const unsubscribe = onSnapshot(saleDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const data = docSnapshot.data() as Omit<SalesOrder, 'id'>;
          const sale = { id: docSnapshot.id, ...data };
          observer.next(sale);
        } else {
          observer.error(new Error(`Sale with ID ${saleId} not found`));
        }
      }, (error) => {
        observer.error(error);
      });
      
      return () => unsubscribe();
    });
  }
  
}