import { Component, OnInit } from '@angular/core';
import { PurchaseService } from '../services/purchase.service';
import { DatePipe } from '@angular/common';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Purchase {
  id: string;
  purchaseDate?: Date | string | { toDate: () => Date };
  referenceNo?: string;
  businessLocation?: string;
  supplier?: string;
  purchaseStatus?: string;
  paymentStatus?: string;
  grandTotal?: number;
  paymentDue?: number;
  addedBy?: string;
  paymentAmount?: number;
  // Add other properties as needed
}

@Component({
  selector: 'app-list-purchase',
  templateUrl: './list-purchase.component.html',
  styleUrls: ['./list-purchase.component.scss'],
  providers: [DatePipe]
})
export class ListPurchaseComponent implements OnInit {
  purchases: Purchase[] = [];
  filteredPurchases: Purchase[] = [];
  isLoading = true;
  errorMessage = '';
  searchText = '';

  constructor(
    private purchaseService: PurchaseService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadPurchases();
  }

  loadPurchases(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.purchaseService.getPurchases().subscribe({
      next: (purchases) => {
        // Ensure id is always a string
        this.purchases = purchases.map(purchase => ({
          ...purchase,
          id: purchase.id || '', // If id is undefined, set it to an empty string
          purchaseDate: this.getFormattedDate(purchase.purchaseDate),
          paymentAmount: Number(purchase.paymentAmount) || 0
        }));
        
        this.filteredPurchases = [...this.purchases];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = 'An error occurred while loading purchases.';
        this.isLoading = false;
      }
    });
  }
  

  private getFormattedDate(date: any): string {
    if (!date) return '';
    
    try {
      if (typeof date === 'object' && 'toDate' in date) {
        return this.datePipe.transform(date.toDate(), 'mediumDate') || '';
      } else if (date instanceof Date) {
        return this.datePipe.transform(date, 'mediumDate') || '';
      } else {
        return this.datePipe.transform(new Date(date), 'mediumDate') || '';
      }
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
    }
  }

  applyFilter(): void {
    if (!this.searchText) {
      this.filteredPurchases = [...this.purchases];
      return;
    }

    const searchTextLower = this.searchText.toLowerCase();
    this.filteredPurchases = this.purchases.filter(purchase => 
      (purchase.referenceNo && purchase.referenceNo.toLowerCase().includes(searchTextLower)) ||
      (purchase.supplier && purchase.supplier.toLowerCase().includes(searchTextLower)) ||
      (purchase.businessLocation && purchase.businessLocation.toLowerCase().includes(searchTextLower)) ||
      (purchase.purchaseStatus && purchase.purchaseStatus.toLowerCase().includes(searchTextLower))
    );
  }

  calculateTotal(property: string): string {
    const total = this.filteredPurchases.reduce((sum, purchase) => {
      return sum + (Number(purchase[property as keyof Purchase]) || 0);
    }, 0);
    return total.toFixed(2);
  }

  exportToCSV(): void {
    const headers = [
      'Date', 'Reference No', 'Location', 'Supplier', 
      'Purchase Status', 'Payment Status', 'Grand Total', 'Payment Due', 'Added By'
    ];
    
    const data = this.filteredPurchases.map(purchase => [
      purchase.purchaseDate || 'N/A',
      purchase.referenceNo || 'N/A',
      purchase.businessLocation || 'N/A',
      purchase.supplier || 'N/A',
      purchase.purchaseStatus || 'Unknown',
      purchase.paymentStatus || 'Unknown',
      `₹ ${purchase.grandTotal || '0.00'}`,
      `₹ ${purchase.paymentDue || '0.00'}`,
      purchase.addedBy || 'System'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + data.map(row => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchases_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportToExcel(): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.filteredPurchases.map(purchase => ({
      'Date': purchase.purchaseDate || 'N/A',
      'Reference No': purchase.referenceNo || 'N/A',
      'Location': purchase.businessLocation || 'N/A',
      'Supplier': purchase.supplier || 'N/A',
      'Purchase Status': purchase.purchaseStatus || 'Unknown',
      'Payment Status': purchase.paymentStatus || 'Unknown',
      'Grand Total': `₹ ${purchase.grandTotal || '0.00'}`,
      'Payment Due': `₹ ${purchase.paymentDue || '0.00'}`,
      'Added By': purchase.addedBy || 'System'
    })));

    const workbook: XLSX.WorkBook = { Sheets: { 'Purchases': worksheet }, SheetNames: ['Purchases'] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    this.saveAsExcelFile(excelBuffer, `purchases_${new Date().toISOString().slice(0,10)}`);
  }

  private saveAsExcelFile(buffer: any, fileName: string): void {
    const data: Blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(data);
    link.download = `${fileName}.xlsx`;
    link.click();
  }

  exportToPDF(): void {
    const doc = new jsPDF();
    const title = 'Purchases Report';
    const currentDate = new Date().toLocaleDateString();
    
    doc.setFontSize(18);
    doc.text(title, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${currentDate}`, 14, 22);
    
    const headers = [
      ['Date', 'Reference No', 'Location', 'Supplier', 'Status', 'Payment', 'Total', 'Due']
    ];
    
    const data = this.filteredPurchases.map(purchase => [
      purchase.purchaseDate || 'N/A',
      purchase.referenceNo || 'N/A',
      purchase.businessLocation || 'N/A',
      purchase.supplier || 'N/A',
      purchase.purchaseStatus || 'Unknown',
      purchase.paymentStatus || 'Unknown',
      `₹ ${purchase.grandTotal || '0.00'}`,
      `₹ ${purchase.paymentDue || '0.00'}`
    ]);
    
    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save(`purchases_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  print(): void {
    window.print();
  }

  deletePurchase(id: string): void {
    if (confirm('Are you sure you want to delete this purchase? This action cannot be undone.')) {
      this.isLoading = true;
      this.purchaseService.deletePurchase(id)
        .then(() => {
          this.showSnackbar('Purchase deleted successfully', 'success');
          this.loadPurchases(); // Refresh the list after deletion
        })
        .catch(err => {
          console.error('Error deleting purchase:', err);
          this.showSnackbar('Failed to delete purchase', 'error');
          this.isLoading = false;
        });
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }

  getStatusClass(status: string | undefined): string {
    if (!status) return 'status-unknown';
    
    status = status.toLowerCase();
    if (status === 'active') {
      return 'status-active';
    } else if (status === 'inactive') {
      return 'status-inactive';
    }
    return 'status-unknown';
  }
}