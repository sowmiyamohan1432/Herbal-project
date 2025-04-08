import { Component, OnInit, OnDestroy } from '@angular/core';
import { SaleService } from '../services/sale.service';
import { Subscription } from 'rxjs';
import * as bootstrap from 'bootstrap';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Router } from '@angular/router';


interface SaleItem {
  customer?: string;
  saleDate?: string | Date;
  invoiceNo?: string;
  status?: string;
  shippingStatus?: string;
  paymentAmount?: number;
  balance?: number;
}

interface RowData {
  'S.No': number;
  'Customer': string;
  'Sale Date': string;
  'Invoice No': string;
  'Status': string;
  'Shipping Status': string;
  'Payment Amount': string;
  'Balance': string;
}

interface Column {
  field: string;
  header: string;
  visible: boolean;
}

@Component({
  selector: 'app-sales',
  templateUrl: './sales.component.html',
  styleUrls: ['./sales.component.scss']
})
export class SalesComponent implements OnInit, OnDestroy {
  sales: any[] = [];
  filteredSales: any[] = [];
  selectedSale: any = null;
  private salesSubscription: Subscription | undefined;
  totalEntries: number = 0;
  currentPage: number = 1;
  entriesPerPage: number = 25;
  searchTerm: string = '';
  private modal: any;
  showColumnMenu: boolean = false;
  
  columns: Column[] = [
    { field: 'customer', header: 'Customer', visible: true },
    { field: 'saleDate', header: 'Sale Date', visible: true },
    { field: 'invoiceNo', header: 'Invoice No', visible: true },
    { field: 'status', header: 'Status', visible: true },
    { field: 'shippingStatus', header: 'Shipping Status', visible: true },
    { field: 'paymentAmount', header: 'Payment Amount', visible: true },
    { field: 'balance', header: 'Balance', visible: true }
  ];

  constructor(private saleService: SaleService, private router: Router) {}  // Inject Router here

  ngOnInit(): void {
    this.modal = new bootstrap.Modal(document.getElementById('saleDetailsModal')!);
    
    this.salesSubscription = this.saleService.listenForSales().subscribe((salesData) => {
      this.sales = salesData;
      this.filteredSales = [...salesData];
      this.totalEntries = this.filteredSales.length;
    });
  }

  ngOnDestroy(): void {
    if (this.salesSubscription) {
      this.salesSubscription.unsubscribe();
    }
  }

  get visibleColumns(): Column[] {
    return this.columns.filter(column => column.visible);
  }

  toggleColumnVisibility(): void {
    this.showColumnMenu = !this.showColumnMenu;
  }

  updateColumnVisibility(): void {
    // Any additional logic when columns are toggled can go here
    console.log('Column visibility updated', this.columns);
  }

  viewSale(sale: any): void {
    this.selectedSale = sale;
    this.modal.show();
  }

  printInvoice(): void {
    const printContent = document.getElementById('saleDetailsModal');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt?.document.write(printContent?.innerHTML ?? '');
    WindowPrt?.document.close();
    WindowPrt?.focus();
    WindowPrt?.print();
    WindowPrt?.close();
  }

  deleteSale(saleId: string): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this.saleService.deleteSale(saleId)
        .then(() => {
          alert('Sale deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting sale:', error);
          alert('Error deleting sale. Please try again.');
        });
    }
  }

  navigateToAddSales() {
    this.router.navigate(['/add-sale']);
  }

  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredSales = [...this.sales];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredSales = this.sales.filter(sale =>
        (sale.customer?.toLowerCase()?.includes(term) ||
          sale.invoiceNo?.toLowerCase()?.includes(term) ||
          sale.status?.toLowerCase()?.includes(term) ||
          sale.shippingStatus?.toLowerCase()?.includes(term))
      );
    }
    this.totalEntries = this.filteredSales.length;
    this.currentPage = 1;
  }
  

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage * this.entriesPerPage < this.totalEntries) {
      this.currentPage++;
    }
  }

  exportCSV(): void {
    const headers = this.visibleColumns.map(col => col.header);
    
    const data = this.filteredSales.map((sale, index) => {
      const row: any = { 'S.No': index + 1 };
      this.visibleColumns.forEach(col => {
        switch(col.field) {
          case 'saleDate':
            row[col.header] = sale[col.field] ? new Date(sale[col.field]).toLocaleDateString() : 'N/A';
            break;
          case 'paymentAmount':
          case 'balance':
            row[col.header] = sale[col.field] !== undefined ? `$${Number(sale[col.field]).toFixed(2)}` : '$0.00';
            break;
          default:
            row[col.header] = sale[col.field] || 'N/A';
        }
      });
      return row;
    });

    const csv = this.convertToCSV(data, ['S.No', ...this.visibleColumns.map(col => col.header)]);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'sales_data.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private convertToCSV(data: any[], headers: string[]): string {
    const headerString = headers.join(',');
    const rowStrings = data.map(row => 
      headers.map(fieldName => 
        `"${(row[fieldName] ?? '').toString().replace(/"/g, '""')}"`
      ).join(',')
    );
    
    return [headerString, ...rowStrings].join('\n');
  }

  exportExcel(): void {
    const headers = this.visibleColumns.map(col => col.header);
    
    const data = this.filteredSales.map((sale, index) => {
      const row: any[] = [index + 1];
      this.visibleColumns.forEach(col => {
        switch(col.field) {
          case 'saleDate':
            row.push(sale[col.field] ? new Date(sale[col.field]).toLocaleDateString() : 'N/A');
            break;
          case 'paymentAmount':
          case 'balance':
            row.push(sale[col.field] !== undefined ? `$${Number(sale[col.field]).toFixed(2)}` : '$0.00');
            break;
          default:
            row.push(sale[col.field] || 'N/A');
        }
      });
      return row;
    });

    const worksheet = XLSX.utils.aoa_to_sheet([['S.No', ...headers], ...data]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sales Data');
    
    XLSX.writeFile(workbook, 'sales_data.xlsx');
  }

  printData(): void {
    const printContent = document.querySelector('.table-responsive')?.innerHTML;
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    
    WindowPrt?.document.write(`
      <html>
        <head>
          <title>Sales Data</title>
          <style>
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .no-print { display: none; }
          </style>
        </head>
        <body>
          <h2>Sales Data</h2>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          ${printContent}
          <script>
            setTimeout(() => {
              window.print();
              window.close();
            }, 500);
          </script>
        </body>
      </html>
    `);
    
    WindowPrt?.document.close();
  }

  exportPDF(): void {
    const headers = this.visibleColumns.map(col => col.header);
    
    const data = this.filteredSales.map((sale, index) => {
      const row: any[] = [index + 1];
      this.visibleColumns.forEach(col => {
        switch(col.field) {
          case 'saleDate':
            row.push(sale[col.field] ? new Date(sale[col.field]).toLocaleDateString() : 'N/A');
            break;
          case 'paymentAmount':
          case 'balance':
            row.push(sale[col.field] !== undefined ? `$${Number(sale[col.field]).toFixed(2)}` : '$0.00');
            break;
          default:
            row.push(sale[col.field] || 'N/A');
        }
      });
      return row;
    });

    const doc = new jsPDF({ orientation: 'landscape' });
    doc.text('Sales Report', 14, 15);
    
    (doc as any).autoTable({
      head: [['S.No', ...headers]],
      body: data,
      startY: 25,
      margin: { top: 10 },
      theme: 'grid',
      headStyles: {
        fillColor: [22, 160, 133]
      }
    });
    
    doc.save('sales-report.pdf');
  }
}