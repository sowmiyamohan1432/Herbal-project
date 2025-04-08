import { Component, OnInit, Inject } from '@angular/core';
import { CustomerService } from '../services/customer.service';
import { Firestore } from '@angular/fire/firestore';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss']
})
export class CustomersComponent implements OnInit {
  // Modal controls
  showForm = false;
  showMoreInfo = false;
  isIndividual = true;
  
  // Customer data
  customerData: any = {};
  customersList: any[] = [];
  filteredCustomers: any[] = [];
  editingCustomerId: string | null = null;
  
  // Table controls
  searchTerm: string = '';
  pageSize: number = 25;
  currentPage: number = 1;
  totalItems: number = 0;
  totalPages: number = 1;
  pages: number[] = [1];
  sortColumn: string = 'contactId';
  sortDirection: string = 'asc';
  startIndex: number = 0;
  endIndex: number = 0;

  constructor(
    @Inject(CustomerService) private customerService: CustomerService,
    @Inject(Firestore) private firestore: Firestore
  ) { }

  ngOnInit(): void {
    this.loadCustomers();
  }

  loadCustomers(): void {
    this.customerService.getCustomers().subscribe({
      next: (customers: any[]) => {
        this.customersList = customers;
        this.applyFilter();
      },
      error: (error) => {
        console.error('Error loading customers:', error);
      }
    });
  }

  // Form methods
  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  toggleMoreInfo(): void {
    this.showMoreInfo = !this.showMoreInfo;
  }

  saveCustomer(): void {
    if (this.editingCustomerId) {
      this.updateCustomer();
    } else {
      this.addCustomer();
    }
  }

  private addCustomer(): void {
    // Add timestamp for sorting by date added
    this.customerData.createdAt = new Date();
    
    this.customerService.addCustomer(this.customerData)
      .then(() => {
        this.handleSuccess('Customer added successfully!');
      })
      .catch((error) => {
        this.handleError('Error adding customer:', error);
      });
  }

  private updateCustomer(): void {
    if (!this.editingCustomerId) return;
        
    this.customerService.updateCustomer(this.editingCustomerId, this.customerData)
      .then(() => {
        this.handleSuccess('Customer updated successfully!');
      })
      .catch((error) => {
        this.handleError('Error updating customer:', error);
      });
  }

  private handleSuccess(message: string): void {
    this.toggleForm();
    alert(message);
    this.loadCustomers(); // Refresh the list
  }

  private handleError(message: string, error: any): void {
    console.error(message, error);
    alert('An error occurred. Please try again.');
  }

  onContactTypeChange(): void {
    // Reset form fields but keep the contact type
    const contactType = this.customerData.contactType;
    this.customerData = {};
    this.customerData.contactType = contactType;
  }

  editCustomer(customer: any): void {
    this.customerData = { ...customer };
    this.editingCustomerId = customer.id;
    this.isIndividual = customer.firstName !== undefined;
    this.showForm = true;
    this.showMoreInfo = Boolean(
      customer.taxNumber || 
      customer.openingBalance || 
      customer.payTerm || 
      customer.address
    );
  }

  deleteCustomer(id: string): void {
    if (confirm('Are you sure you want to delete this customer?')) {
      this.customerService.deleteCustomer(id)
        .then(() => {
          alert('Customer deleted successfully!');
          this.loadCustomers(); // Refresh the list
        })
        .catch((error) => {
          console.error('Error deleting customer:', error);
        });
    }
  }

  viewCustomerDetails(id: string): void {
    // Navigate to customer details page or show details modal
    console.log('Viewing customer details for ID:', id);
    // Implementation depends on your routing setup
  }

  private resetForm(): void {
    this.customerData = {};
    this.editingCustomerId = null;
    this.showMoreInfo = false;
  }

  // Table pagination and filtering methods
  applyFilter(): void {
    let filtered = [...this.customersList];
    
    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(customer => {
        return (
          (customer.contactId && customer.contactId.toLowerCase().includes(term)) ||
          (customer.firstName && customer.firstName.toLowerCase().includes(term)) ||
          (customer.lastName && customer.lastName.toLowerCase().includes(term)) ||
          (customer.businessName && customer.businessName.toLowerCase().includes(term)) ||
          (customer.email && customer.email.toLowerCase().includes(term)) ||
          (customer.mobile && customer.mobile.includes(term))
        );
      });
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[this.sortColumn];
      let bValue = b[this.sortColumn];
      
      // Handle nested properties
      if (this.sortColumn === 'fullName') {
        aValue = `${a.firstName || ''} ${a.lastName || ''}`.trim();
        bValue = `${b.firstName || ''} ${b.lastName || ''}`.trim();
      }
      
      // Handle null values
      if (aValue === undefined || aValue === null) aValue = '';
      if (bValue === undefined || bValue === null) bValue = '';
      
      // Compare values
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return this.sortDirection === 'asc' ? comparison : -comparison;
      } else {
        const comparison = aValue - bValue;
        return this.sortDirection === 'asc' ? comparison : -comparison;
      }
    });
    
    this.totalItems = filtered.length;
    this.calculatePagination();
    
    // Apply pagination
    const start = (this.currentPage - 1) * this.pageSize;
    const end = Math.min(start + this.pageSize, this.totalItems);
    this.startIndex = start;
    this.endIndex = end;
    this.filteredCustomers = filtered.slice(start, end);
  }
  
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);
    this.pages = [];
    
    // Show at most 5 page numbers
    const maxPages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    // Adjust if we're at the end
    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      this.pages.push(i);
    }
  }
  
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.applyFilter();
  }
  
  onPageSizeChange(): void {
    this.currentPage = 1;
    this.applyFilter();
  }
  
  sortTable(column: string): void {
    if (this.sortColumn === column) {
      // Toggle sort direction
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      // New column, default to ascending
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.applyFilter();
  }
  
  // Export methods
  exportCSV(): void {
    // Implementation for CSV export
    console.log('Exporting to CSV');
    // You can implement this method using a library like file-saver
  }
  
  exportExcel(): void {
    // Implementation for Excel export
    console.log('Exporting to Excel');
    // You can implement this method using a library like xlsx
  }
  
  exportPDF(): void {
    // Implementation for PDF export
    console.log('Exporting to PDF');
    // You can implement this method using a library like jspdf
  }
  
  printTable(): void {
    window.print();
  }
  
  toggleColumnVisibility(): void {
    // Implementation for column visibility toggle
    console.log('Toggling column visibility');
    // This would typically open a modal with checkboxes for each column
  }
}
