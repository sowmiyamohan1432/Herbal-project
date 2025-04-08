import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { StockService } from '../services/stock.service';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Stock {
  id: string;
  date: string;
  referenceNo: string;
  locationFrom: string;
  locationTo: string;
  status: string;
  shippingCharges: number;
  totalAmount: number;
  additionalNotes: string;
}

interface Column {
  field: string;
  title: string;
  visible: boolean;
}

@Component({
  selector: 'app-list-stock',
  templateUrl: './list-stock.component.html',
  styleUrls: ['./list-stock.component.scss']
})
export class ListStockComponent implements OnInit {

  stockList: Stock[] = [];
  filteredStocks: Stock[] = [];
  paginatedStocks: Stock[] = [];

  searchControl = new FormControl('');

  sortField: keyof Stock = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  currentPage: number = 1;
  entriesPerPage: number = 25;
  totalPages: number = 1;

  highlightedRowId: string | null = null;

  showDeleteModal: boolean = false;
  stockToDelete: Stock | null = null;
  showColumnModal: boolean = false;
  isDeleting: boolean = false;

  columns: Column[] = [
    { field: 'date', title: 'Date', visible: true },
    { field: 'referenceNo', title: 'Reference No', visible: true },
    { field: 'locationFrom', title: 'Location (From)', visible: true },
    { field: 'locationTo', title: 'Location (To)', visible: true },
    { field: 'status', title: 'Status', visible: true },
    { field: 'shippingCharges', title: 'Shipping Charges', visible: true },
    { field: 'totalAmount', title: 'Total Amount', visible: true },
    { field: 'additionalNotes', title: 'Additional Notes', visible: true },
    { field: 'actions', title: 'Actions', visible: true }
  ];

  Math = Math;

  constructor(
    private stockService: StockService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.stockService.getStockList().subscribe((stockList: Stock[]) => {
      this.stockList = stockList;
      this.applyFilters();
    });

    this.searchControl.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe(() => {
        this.currentPage = 1;
        this.applyFilters();
      });
  }

  applyFilters(): void {
    const searchTerm = this.searchControl.value?.toLowerCase() || '';
    this.filteredStocks = !searchTerm
      ? [...this.stockList]
      : this.stockList.filter(stock =>
          stock.referenceNo?.toLowerCase().includes(searchTerm) ||
          stock.locationFrom?.toLowerCase().includes(searchTerm) ||
          stock.locationTo?.toLowerCase().includes(searchTerm) ||
          stock.status?.toLowerCase().includes(searchTerm)
        );

    this.applySorting();
    this.updatePagination();
  }

  applySorting(): void {
    this.filteredStocks.sort((a, b) => {
      let valueA = a[this.sortField];
      let valueB = b[this.sortField];

      if (this.sortField === 'date') {
        valueA = new Date(valueA).getTime();
        valueB = new Date(valueB).getTime();
      } else if (typeof valueA === 'string') {
        valueA = valueA.toLowerCase();
        valueB = typeof valueB === 'string' ? valueB.toLowerCase() : valueB;
      }

      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredStocks.length / this.entriesPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }

    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    this.paginatedStocks = this.filteredStocks.slice(startIndex, startIndex + this.entriesPerPage);
  }

  getPageNumbers(): (number | string)[] {
    const totalPages = this.totalPages;
    const currentPage = this.currentPage;

    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    if (currentPage <= 4) return [1, 2, 3, 4, 5, '...', totalPages];
    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
  }

  goToPage(page: number | string): void {
    if (typeof page === 'number' && page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updatePagination();
    }
  }

  sortBy(field: keyof Stock): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.applySorting();
    this.updatePagination();
  }

  getSortIconClass(field: string): string {
    if (this.sortField !== field) return 'fas fa-sort';
    return this.sortDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
  }

  getStatusClass(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pending': return 'pending';
      case 'in transit': return 'in-transit';
      case 'completed': return 'completed';
      case 'cancelled': return 'cancelled';
      default: return '';
    }
  }

  addNewStock(): void {
    this.router.navigate(['/add-stock']);
  }

  viewStock(stock: Stock): void {
    this.highlightedRowId = stock.id;
    console.log('View stock:', stock);
  }

  editStock(stock: Stock): void {
    this.highlightedRowId = stock.id;
    this.router.navigate(['/edit-stock', stock.id]);
  }

  confirmDelete(stock: Stock): void {
    this.stockToDelete = stock;
    this.showDeleteModal = true;
  }

  deleteStock(): void {
    if (this.stockToDelete) {
      this.isDeleting = true;
      this.stockService.deleteStock(this.stockToDelete.id)
        .then(() => {
          console.log(`Stock ${this.stockToDelete?.referenceNo} deleted successfully`);
        })
        .catch(error => {
          console.error('Error deleting stock:', error);
        })
        .finally(() => {
          this.isDeleting = false;
          this.cancelDelete();
        });
    }
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.stockToDelete = null;
  }

// Replace these methods in your component
showColumnDropdown = false;

toggleColumnDropdown(): void {
  this.showColumnDropdown = !this.showColumnDropdown;
}

toggleColumn(field: string): void {
  const column = this.columns.find(col => col.field === field);
  if (column) column.visible = !column.visible;
}

resetColumns(): void {
  this.columns.forEach(column => column.visible = true);
}

applyColumnChanges(): void {
  this.showColumnDropdown = false;
  // Any additional logic you need when applying changes
}

  exportData(format: 'csv' | 'excel' | 'pdf'): void {
    const visibleColumns = this.columns
      .filter(col => col.visible && col.field !== 'actions')
      .map(col => ({ title: col.title, field: col.field }));

    const data = this.filteredStocks.map(stock => {
      const row: any = {};
      visibleColumns.forEach(col => {
        switch (col.field) {
          case 'date':
            row[col.title] = this.formatDate(stock.date);
            break;
          case 'shippingCharges':
          case 'totalAmount':
            row[col.title] = this.formatCurrency(stock[col.field as keyof Stock] as number);
            break;
          case 'status':
            row[col.title] = stock.status.charAt(0).toUpperCase() + stock.status.slice(1);
            break;
          default:
            row[col.title] = stock[col.field as keyof Stock] || '-';
        }
      });
      return row;
    });

    switch (format) {
      case 'csv':
        this.exportToCSV(data, visibleColumns.map(col => col.title));
        break;
      case 'excel':
        this.exportToExcel(data, 'StockTransfers');
        break;
      case 'pdf':
        this.exportToPDF(data, visibleColumns.map(col => col.title), 'Stock Transfers');
        break;
    }
  }

  private exportToCSV(data: any[], headers: string[]): void {
    const csvRows = [];
    csvRows.push(headers.join(','));
    data.forEach(row => {
      const values = headers.map(header => {
        const escaped = ('' + row[header]).replace(/"/g, '\\"');
        return `"${escaped}"`;
      });
      csvRows.push(values.join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    this.downloadFile(blob, 'StockTransfers.csv');
  }

  private exportToExcel(data: any[], sheetName: string): void {
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const workbook: XLSX.WorkBook = { Sheets: { [sheetName]: worksheet }, SheetNames: [sheetName] };
    const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    this.downloadFile(blob, 'StockTransfers.xlsx');
  }

  private exportToPDF(data: any[], headers: string[], title: string): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
  
    doc.setFontSize(16);
    doc.text(title, pageWidth / 2, 20, { align: 'center' });
  
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
    // Column widths based on available space
    const columnWidth = pageWidth / headers.length;
    const startY = 40;
    let currentY = startY;
  
    // Header row
    headers.forEach((header, index) => {
      doc.text(header, 14 + columnWidth * index, currentY);
    });
  
    currentY += 6;
  
    // Data rows
    data.forEach(row => {
      headers.forEach((header, index) => {
        const cellText = String(row[header] ?? '');
        doc.text(cellText, 14 + columnWidth * index, currentY);
      });
      currentY += 6;
  
      // Check for page break
      if (currentY > 280) {
        doc.addPage();
        currentY = 20;
      }
    });
  
    doc.save('StockTransfers.pdf');
  }
  
  printData(): void {
    const printContent = document.getElementById('print-section');
    const printWindow = window.open('', '', 'width=800,height=600');

    if (printWindow && printContent) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Stock Transfers Report</title>
            <style>
              body { font-family: Arial; margin: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #2980b9; color: white; }
              .status-badge {
                padding: 3px 6px;
                border-radius: 3px;
                color: white;
                font-size: 12px;
              }
              .pending { background-color: #f39c12; }
              .in-transit { background-color: #3498db; }
              .completed { background-color: #2ecc71; }
              .cancelled { background-color: #e74c3c; }
            </style>
          </head>
          <body>
            <h1>Stock Transfers Report</h1>
            <p>Generated on: ${new Date().toLocaleString()}</p>
            ${printContent.innerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        printWindow.close();
      }, 500);
    } else {
      window.print();
    }
  }

  private formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  private downloadFile(blob: Blob, filename: string): void {
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(link.href);
  }
}
