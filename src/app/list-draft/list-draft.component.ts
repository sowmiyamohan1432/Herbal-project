// list-draft.component.ts
import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DraftService } from '../services/draft.service';
import { Firestore, doc, updateDoc, deleteDoc, addDoc, collection } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list-draft',
  templateUrl: './list-draft.component.html',
  styleUrls: ['./list-draft.component.scss']
})
export class ListDraftComponent implements OnInit {
  drafts: any[] = [];
  displayedDrafts: any[] = [];
  
  // Pagination
  entriesPerPage: number = 25;
  currentPage: number = 1;
  totalEntries: number = 0;
  startEntry: number = 0;
  endEntry: number = 0;
  totalPages: number = 0;
  searchQuery: string = '';

  // Forms
  showAddForm = false;
  showEditForm = false;
  currentDraftId: string | null = null;
  addForm: FormGroup;
  editForm: FormGroup;

  // Column visibility
  showColumnVisibility = false;
  columnVisibility = {
    sno: true,
    customer: true,
    saleDate: true,
    discountAmount: true,
    totalPayable: true,
    shippingCharges: true,
    shippingStatus: true,
    action: true
  };

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (this.showAddForm) {
      this.closeAddForm();
    }
    if (this.showEditForm) {
      this.closeEditForm();
    }
    if (this.showColumnVisibility) {
      this.showColumnVisibility = false;
    }
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    const columnVisibilityButton = document.querySelector('.btn-columns');
    const columnVisibilityDropdown = document.querySelector('.column-visibility-dropdown');
    
    if (this.showColumnVisibility && 
        columnVisibilityButton && 
        columnVisibilityDropdown && 
        !columnVisibilityButton.contains(event.target as Node) && 
        !columnVisibilityDropdown.contains(event.target as Node)) {
      this.showColumnVisibility = false;
    }
  }

  constructor(
    private draftService: DraftService,
    private fb: FormBuilder,
    private firestore: Firestore,
    private router: Router
  ) {
    this.addForm = this.fb.group({
      customer: ['', Validators.required],
      saleDate: ['', Validators.required],
      discountAmount: [0, [Validators.required, Validators.min(0)]],
      shippingCharges: [0, [Validators.required, Validators.min(0)]],
      shippingStatus: ['pending', Validators.required]
    });

    this.editForm = this.fb.group({
      customer: ['', Validators.required],
      saleDate: ['', Validators.required],
      discountAmount: [0, [Validators.required, Validators.min(0)]],
      shippingCharges: [0, [Validators.required, Validators.min(0)]],
      shippingStatus: ['pending', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadDrafts();
  }

  loadDrafts(): void {
    this.draftService.getDraftsRealTime((drafts) => {
      this.drafts = drafts;
      this.updatePagination();
    });
  }

  calculateTotalPayable(draft: any): number {
    return draft.discountAmount - (draft.discountAmount * 0.1) + draft.shippingCharges;
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'pending': return 'status-pending';
      case 'shipped': return 'status-shipped';
      case 'delivered': return 'status-delivered';
      case 'cancelled': return 'status-cancelled';
      default: return 'status-default';
    }
  }

  // Pagination methods
  updatePagination(): void {
    this.totalEntries = this.drafts.length;
    this.totalPages = Math.ceil(this.totalEntries / this.entriesPerPage);
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    const endIndex = Math.min(startIndex + this.entriesPerPage, this.totalEntries);

    this.displayedDrafts = this.drafts.slice(startIndex, endIndex);
    this.startEntry = this.totalEntries > 0 ? startIndex + 1 : 0;
    this.endEntry = endIndex;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  // Sorting
  sortBy(column: string): void {
    this.drafts.sort((a, b) => {
      if (a[column] < b[column]) return -1;
      if (a[column] > b[column]) return 1;
      return 0;
    });
    this.applyPagination();
  }

  // Search
  applySearch(): void {
    if (!this.searchQuery) {
      this.loadDrafts();
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.drafts = this.drafts.filter(draft => 
      draft.customer.toLowerCase().includes(query) ||
      draft.shippingStatus.toLowerCase().includes(query) ||
      draft.discountAmount.toString().includes(query) ||
      draft.shippingCharges.toString().includes(query)
    );

    this.currentPage = 1;
    this.updatePagination();
  }

  // Add Form methods
  openAddForm(): void {
    this.showAddForm = true;
    this.addForm.reset({
      discountAmount: 0,
      shippingCharges: 0,
      shippingStatus: 'pending'
    });
  }

  closeAddForm(): void {
    this.showAddForm = false;
  }

  submitDraft(): void {
    if (this.addForm.valid) {
      const draftData = this.addForm.value;
      draftData.saleDate = new Date(draftData.saleDate).toISOString();
      
      const draftsCollection = collection(this.firestore, 'drafts');
      addDoc(draftsCollection, draftData)
        .then(() => {
          this.closeAddForm();
        })
        .catch(error => {
          console.error('Error adding draft:', error);
        });
    }
  }

  // Edit Form methods
  editDraft(draft: any): void {
    this.currentDraftId = draft.id;
    this.editForm.patchValue({
      customer: draft.customer,
      saleDate: this.formatDateForInput(draft.saleDate),
      discountAmount: draft.discountAmount,
      shippingCharges: draft.shippingCharges,
      shippingStatus: draft.shippingStatus
    });
    this.showEditForm = true;
  }

  private formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  saveDraft(): void {
    if (this.editForm.valid && this.currentDraftId) {
      const draftData = this.editForm.value;
      draftData.saleDate = new Date(draftData.saleDate).toISOString();
      
      const draftRef = doc(this.firestore, `drafts/${this.currentDraftId}`);
      updateDoc(draftRef, draftData)
        .then(() => {
          this.closeEditForm();
        })
        .catch(error => {
          console.error('Error updating draft:', error);
        });
    }
  }

  closeEditForm(): void {
    this.showEditForm = false;
    this.currentDraftId = null;
    this.editForm.reset();
  }

  // Delete method
  deleteDraft(id: string): void {
    if (confirm('Are you sure you want to delete this draft?')) {
      const draftRef = doc(this.firestore, `drafts/${id}`);
      deleteDoc(draftRef)
        .then(() => {
          console.log('Draft deleted successfully');
        })
        .catch(error => {
          console.error('Error deleting draft:', error);
        });
    }
  }

  // Column visibility methods
  toggleColumnVisibility(): void {
    this.showColumnVisibility = !this.showColumnVisibility;
  }

  toggleColumn(column: string): void {
    this.columnVisibility[column as keyof typeof this.columnVisibility] = 
      !this.columnVisibility[column as keyof typeof this.columnVisibility];
  }
  // Export methods
  exportCSV(): void {
    const headers = ['#', 'Customer', 'Sale Date', 'Discount Amount', 'Total Payable', 'Shipping Charges', 'Shipping Status'];
    const rows = this.drafts.map((draft, index) => [
      index + 1,
      draft.customer,
      new Date(draft.saleDate).toLocaleString(),
      draft.discountAmount,
      this.calculateTotalPayable(draft),
      draft.shippingCharges,
      draft.shippingStatus
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'drafts.csv');
  }

  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(
      this.drafts.map(draft => ({
        '#': this.drafts.indexOf(draft) + 1,
        'Customer': draft.customer,
        'Sale Date': new Date(draft.saleDate).toLocaleString(),
        'Discount Amount': draft.discountAmount,
        'Total Payable': this.calculateTotalPayable(draft),
        'Shipping Charges': draft.shippingCharges,
        'Shipping Status': draft.shippingStatus
      }))
    );
    
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drafts');
    XLSX.writeFile(wb, 'drafts.xlsx');
  }
  exportPDF(): void {
    const doc = new jsPDF();
    const data = this.drafts.map(draft => [
      this.drafts.indexOf(draft) + 1,
      draft.customer,
      new Date(draft.saleDate).toLocaleDateString(),
      '$' + draft.discountAmount.toFixed(2),
      '$' + this.calculateTotalPayable(draft).toFixed(2),
      '$' + draft.shippingCharges.toFixed(2),
      draft.shippingStatus
    ]);
    
    (doc as any).autoTable({
      head: [['#', 'Customer', 'Sale Date', 'Discount Amount', 'Total Payable', 'Shipping Charges', 'Shipping Status']],
      body: data,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
  
    doc.save('drafts.pdf');
  }
  
  printTable(): void {
    const printContent = document.getElementById('drafts-table');
    if (printContent) {
      const printWindow = window.open('', '', 'width=800,height=600');
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Drafts Report</title>
              <style>
                body { font-family: Arial, sans-serif; }
                table { width: 100%; border-collapse: collapse; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #2980b9; color: white; }
                tr:nth-child(even) { background-color: #f2f2f2; }
                .no-data { text-align: center; padding: 20px; }
                .status-badge {
                  padding: 3px 8px;
                  border-radius: 12px;
                  font-size: 12px;
                  font-weight: bold;
                }
                .status-pending { background-color: #FFF3CD; color: #856404; }
                .status-shipped { background-color: #D1ECF1; color: #0C5460; }
                .status-delivered { background-color: #D4EDDA; color: #155724; }
                .status-cancelled { background-color: #F8D7DA; color: #721C24; }
              </style>
            </head>
            <body>
              <h2>Drafts Report</h2>
              ${printContent.outerHTML}
              <p>Generated on: ${new Date().toLocaleString()}</p>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    }
  }

  navigateToAddDraft(): void {
    this.router.navigate(['/add-draft']);
  }
}