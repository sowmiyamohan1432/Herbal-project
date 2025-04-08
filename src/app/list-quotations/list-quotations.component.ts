import { Component, OnInit } from '@angular/core';
import { QuotationService } from '../services/quotations.service';
import { Router } from '@angular/router';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-list-quotations',
  templateUrl: './list-quotations.component.html',
  styleUrls: ['./list-quotations.component.scss']
})
export class ListQuotationsComponent implements OnInit {
  quotations: any[] = [];
  filteredQuotations: any[] = [];
  searchText: string = '';
  itemsPerPage: number = 10;
  public Math = Math;
  currentPage: number = 1;
  sortDirection: 'asc' | 'desc' = 'asc';
  sortField: string = 'saleDate';
  showColumnVisibilityCard: boolean = false;

  // Column definitions with labels
  columnDefinitions = [
    { key: 'referenceNo', label: 'Reference No' },
    { key: 'customer', label: 'Customer' },
    { key: 'saleDate', label: 'Date' },
    { key: 'totalPayable', label: 'Amount' },
    { key: 'status', label: 'Status' }
  ];

  // Default visibility for all columns
  columnsVisibility: { [key: string]: boolean } = {
    referenceNo: true,
    customer: true,
    saleDate: true,
    totalPayable: true,
    status: true
  };

  constructor(
    private quotationsService: QuotationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.fetchQuotations();
  }

  fetchQuotations(): void {
    this.quotationsService.getAllQuotations().subscribe(
      data => {
        this.quotations = data;
        this.applyFilter();
      },
      error => {
        console.error('Error fetching quotations', error);
      }
    );
  }

  applyFilter(): void {
    this.currentPage = 1;
    this.filteredQuotations = this.quotations.filter(quote => 
      quote.customer?.toLowerCase().includes(this.searchText.toLowerCase()) ||
      quote.referenceNo?.toLowerCase().includes(this.searchText.toLowerCase())
    );
    this.sort(this.sortField);
  }

  sort(field: string): void {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }

    this.filteredQuotations.sort((a, b) => {
      const valueA = a[field] || '';
      const valueB = b[field] || '';
      
      if (valueA < valueB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage * this.itemsPerPage < this.filteredQuotations.length) {
      this.currentPage++;
    }
  }

  viewQuotation(id: string): void {
    this.router.navigate([`/view-quotation/${id}`]);
  }

  navigateToQuotation(): void {
    this.router.navigate(['/add-quotation']);
  }

  onDelete(id: string): void {
    if (confirm('Are you sure you want to delete this quotation?')) {
      this.quotationsService.deleteQuotation(id)
        .then(() => {
          this.fetchQuotations();
        })
        .catch(error => {
          console.error('Error deleting quotation:', error);
        });
    }
  }

  exportCSV(): void {
    // Only include visible columns in CSV export
    const visibleColumns = this.columnDefinitions.filter(col => this.columnsVisibility[col.key]);
    const headers = visibleColumns.map(col => col.label);
    
    const rows = this.filteredQuotations.map(quote => {
      return visibleColumns.map(col => {
        switch(col.key) {
          case 'saleDate':
            return new Date(quote[col.key]).toLocaleDateString();
          case 'totalPayable':
            return quote[col.key] ? `"${quote[col.key].toString()}"` : '';
          default:
            return quote[col.key] || 'N/A';
        }
      });
    });

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quotations.csv';
    link.click();
    window.URL.revokeObjectURL(url);
  }

  exportExcel(): void {
    // Only include visible columns in Excel export
    const visibleColumns = this.columnDefinitions.filter(col => this.columnsVisibility[col.key]);
    const data = this.filteredQuotations.map(quote => {
      const row: any = {};
      visibleColumns.forEach(col => {
        row[col.label] = col.key === 'saleDate' 
          ? new Date(quote[col.key]).toLocaleDateString()
          : quote[col.key] || 'N/A';
      });
      return row;
    });

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Quotations');
    XLSX.writeFile(wb, 'quotations.xlsx');
  }

  printTable(): void {
    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print</title>');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        table { width: 100%; border-collapse: collapse; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
        .status-badge { padding: 3px 6px; border-radius: 3px; font-size: 12px; }
        .shipped { background-color: #ffcc00; color: #000; }
        .pending { background-color: #ff6666; color: #fff; }
        .delivered { background-color: #66cc66; color: #fff; }
      `);
      printWindow.document.write('</style></head><body>');
      
      // Create table with only visible columns
      printWindow.document.write('<table>');
      
      // Table header
      printWindow.document.write('<thead><tr>');
      this.columnDefinitions.forEach(col => {
        if (this.columnsVisibility[col.key]) {
          printWindow.document.write(`<th>${col.label}</th>`);
        }
      });
      printWindow.document.write('<th>Action</th>');
      printWindow.document.write('</tr></thead>');
      
      // Table body
      printWindow.document.write('<tbody>');
      this.filteredQuotations.forEach(quote => {
        printWindow.document.write('<tr>');
        
        this.columnDefinitions.forEach(col => {
          if (this.columnsVisibility[col.key]) {
            let content = '';
            if (col.key === 'saleDate') {
              content = new Date(quote[col.key]).toLocaleDateString();
            } else if (col.key === 'status') {
              const statusClass = quote.status === 'shipped' ? 'shipped' : 
                                quote.status === 'pending' ? 'pending' : 
                                quote.status === 'delivered' ? 'delivered' : '';
              content = `<span class="status-badge ${statusClass}">${quote.shippingStatus}</span>`;
            } else {
              content = quote[col.key] || 'N/A';
            }
            printWindow.document.write(`<td>${content}</td>`);
          }
        });
        
        printWindow.document.write('<td>');
        printWindow.document.write('<button class="view-btn">View</button>');
        printWindow.document.write('<button class="delete-btn">Delete</button>');
        printWindow.document.write('</td>');
        
        printWindow.document.write('</tr>');
      });
      printWindow.document.write('</tbody>');
      printWindow.document.write('</table>');
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.print();
    }
  }

  exportPDF(): void {
    const doc = new jsPDF();
    
    // Only include visible columns in PDF export
    const visibleColumns = this.columnDefinitions.filter(col => this.columnsVisibility[col.key]);
    const headers = visibleColumns.map(col => col.label);
    
    const data = this.filteredQuotations.map(quote => {
      return visibleColumns.map(col => {
        if (col.key === 'saleDate') {
          return new Date(quote[col.key]).toLocaleDateString();
        } else if (col.key === 'status') {
          return quote.shippingStatus || 'Pending';
        } else {
          return quote[col.key] || 'N/A';
        }
      });
    });

    autoTable(doc, {
      head: [headers],
      body: data,
      startY: 20,
      styles: {
        fontSize: 8,
        cellPadding: 2,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      }
    });

    doc.save('quotations.pdf');
  }

  toggleColumnVisibility(): void {
    this.showColumnVisibilityCard = !this.showColumnVisibilityCard;
  }

  applyColumnVisibility(): void {
    // This will automatically update the table since we're using *ngIf in the template
    // You can add any additional logic here if needed
  }

  // Helper method to check if at least one column is visible
  atLeastOneColumnVisible(): boolean {
    return Object.values(this.columnsVisibility).some(visible => visible);
  }
}