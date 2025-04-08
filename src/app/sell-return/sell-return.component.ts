
import { Component, OnInit } from '@angular/core';

interface SellReturn {
  date: string;
  invoiceNo: string;
  parentSale: string;
  customerName: string;
  location: string;
  paymentStatus: string;
  totalAmount: number;
  paymentDue: number;
  id: number;
}

@Component({
  selector: 'app-sell-return',
  templateUrl: './sell-return.component.html',
  styleUrls: ['./sell-return.component.scss']
})
export class SellReturnComponent implements OnInit {
  entries: SellReturn[] = [];
  filteredEntries: SellReturn[] = [];
  entriesPerPage = 25;
  currentPage = 1;
  totalPages = 1;
  searchQuery = '';
  
  // Pagination info
  startIndex = 0;
  endIndex = 0;
  totalEntries = 0;
  
  // Filter panel visibility
  showFilters = false;
  
  // Filter options and selections
  locations: string[] = ['All', 'Store 1', 'Store 2', 'Warehouse'];
  customers: string[] = ['All', 'Customer 1', 'Customer 2', 'Customer 3'];
  users: string[] = ['All', 'User 1', 'User 2', 'User 3'];
  
  // Selected filter values
  selectedLocation = 'All';
  selectedCustomer = 'All';
  selectedUser = 'All';
  dateRange = {
    startDate: '',
    endDate: ''
  };
  
  constructor() { }
  
  ngOnInit(): void {
    // Set default date range (last month)
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    this.dateRange = {
      startDate: this.formatDate(lastMonth),
      endDate: this.formatDate(today)
    };
    
    // You would typically fetch data from a service here
    this.fetchSellReturns();
  }
  
  formatDate(date: Date): string {
    return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  applyFilters(): void {
    // First filter by location, customer, user, and date range
    this.filteredEntries = this.entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(this.dateRange.startDate);
      const endDate = new Date(this.dateRange.endDate);
      
      // Check if entry passes all filter criteria
      const passesLocationFilter = this.selectedLocation === 'All' || entry.location === this.selectedLocation;
      const passesCustomerFilter = this.selectedCustomer === 'All' || entry.customerName === this.selectedCustomer;
      const passesUserFilter = this.selectedUser === 'All'; // Assuming user info is not in current data model
      const passesDateFilter = (!this.dateRange.startDate || entryDate >= startDate) && 
                               (!this.dateRange.endDate || entryDate <= endDate);
      
      // Return true only if all filters pass
      return passesLocationFilter && passesCustomerFilter && passesUserFilter && passesDateFilter;
    });
    
    // Then apply search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      this.filteredEntries = this.filteredEntries.filter(entry => 
        entry.invoiceNo.toLowerCase().includes(query) ||
        entry.customerName.toLowerCase().includes(query) ||
        entry.location.toLowerCase().includes(query) ||
        entry.paymentStatus.toLowerCase().includes(query)
      );
    }
    
    this.calculatePagination();
  }
  
  fetchSellReturns(): void {
    // This would be replaced with an actual API call
    // For now, let's add some sample data
    this.entries = [
      {
        id: 1,
        date: '2025-03-15',
        invoiceNo: 'SR-001',
        parentSale: 'S-001',
        customerName: 'Customer 1',
        location: 'Store 1',
        paymentStatus: 'Paid',
        totalAmount: 1500.00,
        paymentDue: 0.00
      },
      {
        id: 2,
        date: '2025-03-20',
        invoiceNo: 'SR-002',
        parentSale: 'S-002',
        customerName: 'Customer 2',
        location: 'Store 2',
        paymentStatus: 'Partial',
        totalAmount: 2000.00,
        paymentDue: 800.00
      },
      {
        id: 3,
        date: '2025-03-25',
        invoiceNo: 'SR-003',
        parentSale: 'S-003',
        customerName: 'Customer 3',
        location: 'Warehouse',
        paymentStatus: 'Unpaid',
        totalAmount: 3000.00,
        paymentDue: 3000.00
      }
    ];
    
    this.applyFilters();
  }
  
  resetFilters(): void {
    this.selectedLocation = 'All';
    this.selectedCustomer = 'All';
    this.selectedUser = 'All';
    
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setMonth(today.getMonth() - 1);
    
    this.dateRange = {
      startDate: this.formatDate(lastMonth),
      endDate: this.formatDate(today)
    };
    
    this.applyFilters();
  }
  
  // Keep all your existing methods...
  calculatePagination(): void {
    this.totalEntries = this.filteredEntries.length;
    this.totalPages = Math.ceil(this.totalEntries / this.entriesPerPage);
    
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    }
    
    this.startIndex = (this.currentPage - 1) * this.entriesPerPage;
    this.endIndex = Math.min(this.startIndex + this.entriesPerPage, this.totalEntries);
  }
  
  onSearch(event: any): void {
    this.searchQuery = event.target.value;
    this.currentPage = 1;
    this.applyFilters();
  }
  
  onEntriesChange(event: any): void {
    this.entriesPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1;
    this.calculatePagination();
  }
  
  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.calculatePagination();
    }
  }
  
  previousPage(): void {
    this.goToPage(this.currentPage - 1);
  }
  
  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }
  
  exportCSV(): void {
    // Implement CSV export functionality
    console.log('Exporting as CSV...');
  }
  
  exportExcel(): void {
    // Implement Excel export functionality
    console.log('Exporting as Excel...');
  }
  
  exportPDF(): void {
    // Implement PDF export functionality
    console.log('Exporting as PDF...');
  }
  
  print(): void {
    // Implement print functionality
    console.log('Printing...');
  }
  
  toggleColumnVisibility(): void {
    // Implement column visibility functionality
    console.log('Toggling column visibility...');
  }
  
  getTotalAmount(): number {
    return this.filteredEntries.reduce((sum, entry) => sum + entry.totalAmount, 0);
  }
  
  getTotalPaymentDue(): number {
    return this.filteredEntries.reduce((sum, entry) => sum + entry.paymentDue, 0);
  }
}
