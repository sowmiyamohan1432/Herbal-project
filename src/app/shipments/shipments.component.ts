// shipments.component.ts
import { Component, OnInit } from '@angular/core';
import { SaleService } from '../services/sale.service';

interface Shipment {
  id: string;
  date: string;  // saleDate from SalesOrder
  invoiceNo: string;
  customerName: string;  // customer from SalesOrder
  contactNumber: string;  // We'll need to add this to SalesOrder
  location: string;  // Will use billingAddress or a dedicated location field
  deliveryPerson: string;
  shippingStatus: string;
  paymentStatus: string;  // Derived from balance and paymentAmount
}

@Component({
  selector: 'app-shipments',
  templateUrl: './shipments.component.html',
  styleUrls: ['./shipments.component.scss']
})
export class ShipmentsComponent implements OnInit {
  shipments: Shipment[] = [];
  filteredShipments: Shipment[] = [];
  entriesPerPage = 25;
  currentPage = 1;
  totalEntries = 0;
  searchTerm = '';
  
  // Filter panel state
  showFilters = false;
  
  // Filter values
  filterValues = {
    businessLocation: 'All',
    customer: 'All',
    dateRange: '04/01/2025 - 03/31/2026',
    user: 'All',
    paymentStatus: 'All',
    shippingStatus: 'All',
    deliveryPerson: 'All'
  };

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loadShipments();
  }
  
  loadShipments(): void {
    this.saleService.listenForSales().subscribe(salesOrders => {
      // Convert SalesOrder to Shipment format
      this.shipments = salesOrders.map(order => {
        // Determine payment status based on balance
        let paymentStatus = 'Unpaid';
        if (order.balance === 0 && order.paymentAmount > 0) {
          paymentStatus = 'Paid';
        } else if (order.balance > 0 && order.paymentAmount > 0) {
          paymentStatus = 'Partial';
        }

        return {
          id: (order as any).id || '',
          date: (order as any).saleDate,
          invoiceNo: (order as any).invoiceNo || '',
          customerName: (order as any).customer,
          contactNumber: (order as any).contactNumber || '',
          location: (order as any).billingAddress || '',
          deliveryPerson: (order as any).deliveryPerson || '',
          shippingStatus: (order as any).shippingStatus || 'Pending',
          paymentStatus: paymentStatus
        };
      });
      
      this.totalEntries = this.shipments.length;
      this.applyFilters(); // Apply any active filters
    });
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  
  applyFilters(): void {
    // Start with all shipments
    let filtered = [...this.shipments];
    
    // Apply filters if not set to 'All'
    if (this.filterValues.customer !== 'All') {
      filtered = filtered.filter(ship => ship.customerName === this.filterValues.customer);
    }
    
    if (this.filterValues.paymentStatus !== 'All') {
      filtered = filtered.filter(ship => ship.paymentStatus === this.filterValues.paymentStatus);
    }
    
    if (this.filterValues.shippingStatus !== 'All') {
      filtered = filtered.filter(ship => ship.shippingStatus === this.filterValues.shippingStatus);
    }
    
    if (this.filterValues.deliveryPerson !== 'All') {
      filtered = filtered.filter(ship => ship.deliveryPerson === this.filterValues.deliveryPerson);
    }
    
    // Apply search term if present
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(ship => 
        ship.customerName.toLowerCase().includes(term) ||
        ship.invoiceNo.toLowerCase().includes(term) ||
        ship.location.toLowerCase().includes(term) ||
        ship.deliveryPerson.toLowerCase().includes(term)
      );
    }
    
    this.filteredShipments = filtered;
    this.totalEntries = this.filteredShipments.length;
    this.currentPage = 1;
    
    // Hide filters after applying
    this.showFilters = false;
  }
  
  resetFilters(): void {
    this.filterValues = {
      businessLocation: 'All',
      customer: 'All',
      dateRange: '04/01/2025 - 03/31/2026',
      user: 'All',
      paymentStatus: 'All',
      shippingStatus: 'All',
      deliveryPerson: 'All'
    };
    
    this.filteredShipments = this.shipments;
    this.totalEntries = this.filteredShipments.length;
  }

  exportCSV(): void {
    // Implement CSV export functionality
    const headers = ['Date', 'Invoice No.', 'Customer Name', 'Contact Number', 'Location', 
                     'Delivery Person', 'Shipping Status', 'Payment Status'];
    
    const rows = this.filteredShipments.map(ship => [
      ship.date,
      ship.invoiceNo,
      ship.customerName,
      ship.contactNumber,
      ship.location,
      ship.deliveryPerson,
      ship.shippingStatus,
      ship.paymentStatus
    ].join(','));
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    this.downloadFile(csvContent, 'shipments_export.csv', 'text/csv');
  }

  exportExcel(): void {
    // Typically would use a library like xlsx
    this.saleService.exportSales('excel');
  }

  exportPDF(): void {
    // Typically would use a library like jspdf
    this.saleService.exportSales('pdf');
  }

  print(): void {
    window.print();
  }

  toggleColumnVisibility(): void {
    // Implement column visibility toggle
    // This would typically open a modal with checkbox options
    console.log('Column visibility feature not implemented yet');
  }

  onSearch(): void {
    this.applyFilters();
  }

  changeEntriesPerPage(event: any): void {
    this.entriesPerPage = parseInt(event.target.value, 10);
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
    }
  }

  // Helper method to replace direct Math usage in template
  getMinValue(a: number, b: number): number {
    return Math.min(a, b);
  }

  // Helper method to calculate total pages
  getTotalPages(): number {
    return Math.ceil(this.totalEntries / this.entriesPerPage);
  }
  printShipment(shipmentId: string): void {
    // Open print dialog for the specific shipment
    const printContent = document.getElementById('shipment-details-' + shipmentId)?.innerHTML;
    if (printContent) {
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent;
      window.print();
      document.body.innerHTML = originalContent;
      // Reload the page to restore functionality
      window.location.reload();
    }
  }
  // Helper method for downloading files
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
  
}