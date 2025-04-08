import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface Requisition {
  id: string;
  date: string;
  referenceNo: string;
  location: string;
  status: string;
  requiredByDate: string;
  addedBy: string;
}

interface ColumnVisibility {
  name: string;
  field: string;
  visible: boolean;
}

@Component({
  selector: 'app-purchase-requisition',
  templateUrl: './purchase-requisition.component.html',
  styleUrls: ['./purchase-requisition.component.scss']
})
export class PurchaseRequisitionComponent implements OnInit {
  rows: Requisition[] = [];
  showFilters: boolean = false;
  showColumnVisibility: boolean = false;
  
  // Column visibility configuration
  columns: ColumnVisibility[] = [
    { name: 'Date', field: 'date', visible: true },
    { name: 'Reference No', field: 'referenceNo', visible: true },
    { name: 'Location', field: 'location', visible: true },
    { name: 'Status', field: 'status', visible: true },
    { name: 'Required by date', field: 'requiredByDate', visible: true },
    { name: 'Added By', field: 'addedBy', visible: true }
  ];
  
  // Filter variables
  businessLocations: string[] = ['All', 'Location 1', 'Location 2', 'Location 3'];
  statuses: string[] = ['All', 'Pending', 'Approved', 'Rejected'];
  selectedLocation: string = 'All';
  selectedStatus: string = 'All';
  dateRange: string = '';
  requiredByDate: string = '';

  constructor(
    private requisitionService: PurchaseRequisitionService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadRequisitions();
  }

  loadRequisitions() {
    this.requisitionService.getRequisitions().subscribe((data: Requisition[]) => {
      this.rows = data;
    });
  }

  // Export to CSV
  exportCSV() {
    // Get only visible columns
    const visibleColumns = this.columns.filter(col => col.visible);
    const headers = visibleColumns.map(col => col.name);
    
    const data = this.rows.map(row => 
      visibleColumns.map(col => row[col.field as keyof Requisition])
    );

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + data.map(e => e.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "purchase_requisitions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export to Excel
  exportExcel() {
    // Create a new object with only visible columns
    const visibleData = this.rows.map(row => {
      const newRow: any = {};
      this.columns.forEach(col => {
        if (col.visible) {
          newRow[col.name] = row[col.field as keyof Requisition];
        }
      });
      return newRow;
    });
    
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(visibleData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, 'purchase_requisitions.xlsx');
  }

  // Print functionality
  print() {
    // Create a new div for printing with only visible columns
    const printDiv = document.createElement('div');
    printDiv.innerHTML = `
      <h2>Purchase Requisitions</h2>
      <table border="1" cellpadding="3" cellspacing="0" style="width:100%">
        <thead>
          <tr>
            ${this.columns.filter(col => col.visible)
              .map(col => `<th>${col.name}</th>`).join('')}
          </tr>
        </thead>
        <tbody>
          ${this.rows.map(row => `
            <tr>
              ${this.columns.filter(col => col.visible)
                .map(col => `<td>${row[col.field as keyof Requisition]}</td>`).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printDiv.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  }

  // Column visibility toggle
  toggleColumnVisibility() {
    this.showColumnVisibility = !this.showColumnVisibility;
  }
  
  // Update column visibility
  updateColumnVisibility(column: ColumnVisibility) {
    column.visible = !column.visible;
  }
  
  // Check if at least one column is visible
  hasVisibleColumns(): boolean {
    return this.columns.some(col => col.visible);
  }
  
  // Select/Deselect all columns
  toggleAllColumns(visible: boolean) {
    this.columns.forEach(col => col.visible = visible);
  }

  // Export to PDF
  exportPDF() {
    const doc = new jsPDF();
    const title = 'Purchase Requisitions';
    
    // Get visible columns
    const visibleColumns = this.columns.filter(col => col.visible);
    const headers = [visibleColumns.map(col => col.name)];
    
    const data = this.rows.map(row => 
      visibleColumns.map(col => row[col.field as keyof Requisition])
    );

    (doc as any).autoTable({
      head: headers,
      body: data,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });

    doc.text(title, 14, 15);
    doc.save('purchase_requisitions.pdf');
  }

  // Your existing methods remain unchanged
  viewRequisition(id: string) {
    this.router.navigate(['/view-purchase-requisition', id]);
  }

  deleteRequisition(id: string) {
    if(confirm('Are you sure you want to delete this requisition?')) {
      this.requisitionService.deleteRequisition(id).then(() => {
        this.loadRequisitions();
      });
    }
  }

  navigateToAddRequisition() {
    this.router.navigate(['/add-purchase-requisition']);
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }
  
  applyFilters() {
    const filters = {
      location: this.selectedLocation,
      status: this.selectedStatus,
      dateRange: this.dateRange,
      requiredByDate: this.requiredByDate
    };
    
    this.requisitionService.getFilteredRequisitions(filters).subscribe((data: Requisition[]) => {
      this.rows = data;
    });
  }
  
  resetFilters() {
    this.selectedLocation = 'All';
    this.selectedStatus = 'All';
    this.dateRange = '';
    this.requiredByDate = '';
    this.loadRequisitions();
  }
}