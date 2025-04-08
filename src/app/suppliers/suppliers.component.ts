// suppliers.component.ts
import { Component, OnInit } from '@angular/core';
import { SupplierService } from '../services/supplier.service';

interface Supplier {
  id?: string;
  contactId?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  isIndividual?: boolean;
  email?: string;
  mobile?: string;
  landline?: string;
  alternateContact?: string;
  assignedTo?: string;
  taxNumber?: string;
  openingBalance?: number;
  purchaseDue?: number;
  purchaseReturn?: number;
  advanceBalance?: number;
  status?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  prefix?: string;
  middleName?: string;
  dob?: Date;
  payTerm?: number;
  contactType?: string;
}

@Component({
  selector: 'app-suppliers',
  templateUrl: './suppliers.component.html',
  styleUrls: ['./suppliers.component.scss']
})
export class SuppliersComponent implements OnInit {
  showForm = false;
  showMoreInfo = false;
  isIndividual = true;
  supplierData: Partial<Supplier> = {};
  suppliersList: Supplier[] = [];
  filteredSuppliers: Supplier[] = [];
  assignedUsers: string[] = [];
  editingSupplierId: string | null = null;
  
  // Filter options
  filterOptions = {
    purchaseDue: false,
    purchaseReturn: false,
    advanceBalance: false,
    openingBalance: false,
    assignedTo: '',
    status: ''
  };

  // Table display options
  entriesPerPage = 25;
  currentPage = 1;
  totalPages = 1;
  sortColumn = 'businessName';
  sortDirection = 'asc';
  searchTerm = '';

  constructor(private supplierService: SupplierService) { }

  ngOnInit(): void {
    this.loadSuppliers();
    this.loadAssignedUsers();
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe((suppliers: Supplier[]) => {
      this.suppliersList = suppliers;
      this.applyFilters();
    });
  }

  loadAssignedUsers(): void {
    this.assignedUsers = ['User 1', 'User 2', 'User 3'];
  }

  applyFilters(): void {
    let filtered = [...this.suppliersList];
    
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(supplier => 
        (supplier.businessName?.toLowerCase().includes(term) || 
         `${supplier.firstName} ${supplier.lastName}`.toLowerCase().includes(term) ||
         supplier.email?.toLowerCase().includes(term) ||
         supplier.mobile?.toLowerCase().includes(term) ||
         supplier.contactId?.toLowerCase().includes(term))
      );
    }
    
    if (this.filterOptions.purchaseDue) {
      filtered = filtered.filter(supplier => supplier.purchaseDue && supplier.purchaseDue > 0);
    }
    
    if (this.filterOptions.purchaseReturn) {
      filtered = filtered.filter(supplier => supplier.purchaseReturn && supplier.purchaseReturn > 0);
    }
    
    if (this.filterOptions.advanceBalance) {
      filtered = filtered.filter(supplier => supplier.advanceBalance && supplier.advanceBalance > 0);
    }
    
    if (this.filterOptions.openingBalance) {
      filtered = filtered.filter(supplier => supplier.openingBalance && supplier.openingBalance > 0);
    }
    
    if (this.filterOptions.assignedTo) {
      filtered = filtered.filter(supplier => supplier.assignedTo === this.filterOptions.assignedTo);
    }
    
    if (this.filterOptions.status) {
      filtered = filtered.filter(supplier => supplier.status === this.filterOptions.status);
    }
    
    filtered.sort((a, b) => {
      const valA = a[this.sortColumn as keyof Supplier] || '';
      const valB = b[this.sortColumn as keyof Supplier] || '';
      
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    
    this.filteredSuppliers = filtered;
    this.totalPages = Math.ceil(this.filteredSuppliers.length / this.entriesPerPage);
    this.currentPage = Math.min(this.currentPage, this.totalPages);
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.filterOptions = {
      purchaseDue: false,
      purchaseReturn: false,
      advanceBalance: false,
      openingBalance: false,
      assignedTo: '',
      status: ''
    };
    this.applyFilters();
  }

  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilters();
  }

  get paginatedSuppliers(): Supplier[] {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    return this.filteredSuppliers.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (this.showForm && !this.editingSupplierId) {
      // Auto-generate contact ID when opening the form for a new supplier
      this.supplierData.contactId = this.generateContactId();
    }
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.supplierData = {};
    this.editingSupplierId = null;
    this.showMoreInfo = false;
    this.isIndividual = true;
  }

  toggleMoreInfo(): void {
    this.showMoreInfo = !this.showMoreInfo;
  }

  onContactTypeChange(): void {
    const contactType = this.supplierData.contactType;
    this.supplierData = { contactType };
    // Regenerate contact ID when contact type changes
    this.supplierData.contactId = this.generateContactId();
  }

  saveSupplier(): void {
    if (this.isIndividual && !this.supplierData.firstName) {
      alert('First Name is required for individuals');
      return;
    }
    
    if (!this.isIndividual && !this.supplierData.businessName) {
      alert('Business Name is required for businesses');
      return;
    }
    
    if (!this.supplierData.mobile) {
      alert('Mobile number is required');
      return;
    }
    
    this.supplierData.isIndividual = this.isIndividual;
    
    if (this.editingSupplierId) {
      this.updateExistingSupplier();
    } else {
      this.addNewSupplier();
    }
  }

  addNewSupplier(): void {
    // Ensure contact ID is generated
    if (!this.supplierData.contactId) {
      this.supplierData.contactId = this.generateContactId();
    }
    
    this.supplierService.addSupplier(this.supplierData as Supplier)
      .then(() => {
        this.toggleForm();
        this.loadSuppliers();
        alert('Supplier added successfully!');
      })
      .catch((error) => {
        console.error('Error adding supplier: ', error);
        alert('Error adding supplier. Please try again.');
      });
  }

  updateExistingSupplier(): void {
    if (this.editingSupplierId) {
      this.supplierService.updateSupplier(this.editingSupplierId, this.supplierData as Supplier)
        .then(() => {
          this.toggleForm();
          this.loadSuppliers();
          alert('Supplier updated successfully!');
        })
        .catch((error) => {
          console.error('Error updating supplier: ', error);
          alert('Error updating supplier. Please try again.');
        });
    }
  }

  editSupplier(supplier: Supplier): void {
    this.supplierData = { ...supplier };
    this.editingSupplierId = supplier.id || null;
    this.isIndividual = supplier.isIndividual || true;
    this.showForm = true;
    
    if (supplier.taxNumber || supplier.addressLine1 || supplier.openingBalance) {
      this.showMoreInfo = true;
    }
  }

  deleteSupplier(id?: string): void {
    if (!id) return;
    
    if (confirm('Are you sure you want to delete this supplier?')) {
      this.supplierService.deleteSupplier(id)
        .then(() => {
          this.loadSuppliers();
          alert('Supplier deleted successfully!');
        })
        .catch((error) => {
          console.error('Error deleting supplier: ', error);
          alert('Error deleting supplier. Please try again.');
        });
    }
  }

  generateContactId(): string {
    const existingIds = this.suppliersList
      .map(s => s.contactId || '')
      .filter(id => id.startsWith('CO'))
      .map(id => parseInt(id.substring(2), 10) || 0);
    
    const maxId = Math.max(0, ...existingIds);
    return `CO${String(maxId + 1).padStart(4, '0')}`;
  }

  exportCSV(): void {
    console.log('Exporting to CSV:', this.filteredSuppliers);
  }

  exportExcel(): void {
    console.log('Exporting to Excel:', this.filteredSuppliers);
  }

  exportPDF(): void {
    console.log('Exporting to PDF:', this.filteredSuppliers);
  }
}