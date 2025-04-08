import { Component, OnInit } from '@angular/core';
import { SaleService } from '../services/sale.service';
import { Observable } from 'rxjs';

interface SalesOrder {
  id: string;
  customer: string;
  saleDate: string;
  invoiceNo: string;
  status: string;
  shippingStatus: string;
  paymentAmount: number;
  shippingCharges: number;
  discountAmount: number;
  balance: number;
  businessLocation?: string;
}

interface FilterOptions {
  businessLocation: string;
  customer: string;
  status: string;
  shippingStatus: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

@Component({
  selector: 'app-sales-order',
  templateUrl: './sales-order.component.html',
  styleUrls: ['./sales-order.component.scss']
})
export class SalesOrderComponent implements OnInit {
  sales$!: Observable<SalesOrder[]>;
  showFilters = false;
  Math = Math;
  filterOptions: FilterOptions = {
    businessLocation: '',
    customer: '',
    status: '',
    shippingStatus: '',
    dateRange: {
      startDate: '',
      endDate: ''
    }
  };
  
  currentPage = 1;
  pageSize = 25;

  constructor(private saleService: SaleService) {}

  ngOnInit(): void {
    this.loadSalesData();
  }
  
  toggleFilters(): void {
    this.showFilters = !this.showFilters;
  }
  loadSalesData(): void {
    this.sales$ = this.saleService.listenForSales(this.filterOptions);
  }
  
  applyFilters(): void {
    this.currentPage = 1;
    this.loadSalesData();
  }
  
  resetFilters(): void {
    this.filterOptions = {
      businessLocation: '',
      customer: '',
      status: '',
      shippingStatus: '',
      dateRange: {
        startDate: '',
        endDate: ''
      }
    };
    this.applyFilters();
  }
  
  changePageSize(size: number): void {
    this.pageSize = size;
    this.currentPage = 1;
  }
  
  nextPage(): void {
    this.currentPage++;
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  exportData(format: 'csv' | 'excel' | 'pdf'): void {
    this.saleService.exportSales(format, this.filterOptions)
      .catch(error => console.error('Export failed:', error));
  }
  
  printData(): void {
    window.print();
  }

  deleteSale(id: string): void {
    if (confirm('Are you sure you want to delete this sale?')) {
      this.saleService.deleteSale(id)
        .then(() => this.loadSalesData())
        .catch(error => console.error('Delete failed:', error));
    }
  }
}