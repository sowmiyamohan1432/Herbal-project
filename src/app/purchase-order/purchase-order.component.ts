import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { Subscription } from 'rxjs';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface PurchaseOrder {
  id: string;
  date: string;
  referenceNo: string;
  businessLocation: string;
  supplier: string;
  status: string;
  quantityRemaining: number;
  shippingStatus: string;
  shippingCharges: number;
  addedBy: string;
  createdAt?: Date;
}

@Component({
  selector: 'app-purchase-order',
  templateUrl: './purchase-order.component.html',
  styleUrls: ['./purchase-order.component.scss']
})
export class PurchaseOrderComponent implements OnInit, OnDestroy {
  purchaseOrders: PurchaseOrder[] = [];
  filteredOrders: PurchaseOrder[] = [];
  entriesPerPage: number = 25;
  currentPage: number = 1;
  totalPages: number = 1;
  Math = Math;
  activeActionMenu: string | null = null;
  private ordersSubscription!: Subscription;
  visibleColumns: { [key: string]: boolean } = {
    action: true,
    date: true,
    referenceNo: true,
    businessLocation: true,
    supplier: true,
    status: true,
    addedBy: true
  };

  // Filter properties
  businessLocations: string[] = ['All'];
  suppliers: string[] = ['All'];
  statuses: string[] = ['All'];
  shippingStatuses: string[] = ['All'];
  selectedLocation: string = 'All';
  selectedSupplier: string = 'All';
  selectedStatus: string = 'All';
  selectedShippingStatus: string = 'All';
  dateRange: string = '04/01/2025 - 03/31/2026';

  constructor(private orderService: PurchaseOrderService, private router: Router) {}

  ngOnInit(): void {
    this.loadPurchaseOrders();
    document.addEventListener('click', this.onDocumentClick.bind(this));
  }

  ngOnDestroy(): void {
    if (this.ordersSubscription) {
      this.ordersSubscription.unsubscribe();
    }
    document.removeEventListener('click', this.onDocumentClick.bind(this));
  }

  toggleActionMenu(orderId: string, event: Event): void {
    event.stopPropagation();
    this.activeActionMenu = this.activeActionMenu === orderId ? null : orderId;
  }

  onDocumentClick(event: MouseEvent): void {
    if (!(event.target as HTMLElement).closest('.action-dropdown')) {
      this.activeActionMenu = null;
    }
  }

  loadPurchaseOrders(): void {
    this.ordersSubscription = this.orderService.getOrders().subscribe({
      next: (orders: any[]) => {
        this.purchaseOrders = orders.map(order => ({
          id: order.id,
          date: order.createdAt?.toDate().toLocaleDateString() || 'N/A',
          referenceNo: order.referenceNo || 'N/A',
          businessLocation: order.businessLocation || 'N/A',
          supplier: order.supplier || 'N/A',
          status: order.status || 'Pending',
          quantityRemaining: order.quantityRemaining || 0,
          shippingStatus: order.shippingStatus || 'Not Shipped',
          shippingCharges: order.shippingCharges || 0,
          addedBy: order.addedBy || 'System',
          createdAt: order.createdAt?.toDate()
        }));
        
        this.extractFilterValues();
        this.applyFilters();
        this.calculateTotalPages();
      },
      error: (err) => console.error('Error loading orders:', err)
    });
  }

  extractFilterValues(): void {
    this.businessLocations = ['All', ...new Set(
      this.purchaseOrders.map(order => order.businessLocation).filter(Boolean)
    )];
    this.suppliers = ['All', ...new Set(
      this.purchaseOrders.map(order => order.supplier).filter(Boolean)
    )];
    this.statuses = ['All', ...new Set(
      this.purchaseOrders.map(order => order.status).filter(Boolean)
    )];
    this.shippingStatuses = ['All', ...new Set(
      this.purchaseOrders.map(order => order.shippingStatus).filter(Boolean)
    )];
  }

  calculateTotalPages(): void {
    this.totalPages = Math.ceil(this.filteredOrders.length / this.entriesPerPage);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }
  }

  onSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.applyFilters(searchTerm);
  }

  applyFilters(searchTerm: string = ''): void {
    this.filteredOrders = this.purchaseOrders.filter(order => {
      const matchesSearch = searchTerm ? 
        (order.referenceNo?.toLowerCase().includes(searchTerm) || false) ||
        (order.supplier?.toLowerCase().includes(searchTerm) || false) ||
        (order.businessLocation?.toLowerCase().includes(searchTerm) || false) ||
        (order.addedBy?.toLowerCase().includes(searchTerm) || false) : true;

      const matchesLocation = this.selectedLocation === 'All' || order.businessLocation === this.selectedLocation;
      const matchesSupplier = this.selectedSupplier === 'All' || order.supplier === this.selectedSupplier;
      const matchesStatus = this.selectedStatus === 'All' || order.status === this.selectedStatus;
      const matchesShippingStatus = this.selectedShippingStatus === 'All' || order.shippingStatus === this.selectedShippingStatus;

      return matchesSearch && matchesLocation && matchesSupplier && matchesStatus && matchesShippingStatus;
    });

    this.calculateTotalPages();
    this.currentPage = 1;
  }

  // Pagination controls
  previousPage(): void {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  viewOrder(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders/view', order.id]);
    this.activeActionMenu = null;
  }

  printOrder(order: PurchaseOrder): void {
    const printContent = `
      <h2>Purchase Order Details</h2>
      <p><strong>Date:</strong> ${order.date}</p>
      <p><strong>Reference No:</strong> ${order.referenceNo}</p>
      <p><strong>Location:</strong> ${order.businessLocation}</p>
      <p><strong>Supplier:</strong> ${order.supplier}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Added By:</strong> ${order.addedBy}</p>
    `;
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
    this.activeActionMenu = null;
  }

  downloadPdf(order: PurchaseOrder): void {
    const doc = new jsPDF();
    doc.text(`Purchase Order: ${order.referenceNo}`, 10, 10);
    autoTable(doc, {
      head: [['Field', 'Value']],
      body: [
        ['Date', order.date],
        ['Reference No', order.referenceNo],
        ['Location', order.businessLocation],
        ['Supplier', order.supplier],
        ['Status', order.status],
        ['Added By', order.addedBy]
      ]
    });
    doc.save(`order_${order.referenceNo}.pdf`);
    this.activeActionMenu = null;
  }

  editOrder(order: PurchaseOrder): void {
    this.router.navigate(['/purchase-orders/edit', order.id]);
    this.activeActionMenu = null;
  }

  deleteOrder(order: PurchaseOrder): void {
    if (confirm('Are you sure you want to delete this order?')) {
      this.orderService.deleteOrder(order.id).then(() => {
        this.loadPurchaseOrders();
      }).catch(err => {
        console.error('Error deleting order:', err);
      });
      this.activeActionMenu = null;
    }
  }

  editShipping(order: PurchaseOrder): void {
    this.router.navigate(['/shipments', order.id]);
    this.activeActionMenu = null;
  }

  sendNotification(order: PurchaseOrder): void {
    alert(`Notification sent for order ${order.referenceNo}`);
    this.activeActionMenu = null;
  }

  // Export functionality
  exportCSV(): void {
    const headers = ['Date', 'Reference No', 'Location', 'Supplier', 'Status', 'Added By'];
    const data = this.filteredOrders.map(order => [
      order.date,
      order.referenceNo,
      order.businessLocation,
      order.supplier,
      order.status,
      order.addedBy
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + '\n'
      + data.map(row => row.join(',')).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'purchase_orders.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel(): void {
    const data = this.filteredOrders.map(order => ({
      'Date': order.date,
      'Reference No': order.referenceNo,
      'Location': order.businessLocation,
      'Supplier': order.supplier,
      'Status': order.status,
      'Added By': order.addedBy
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Purchase Orders');
    XLSX.writeFile(workbook, 'purchase_orders.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    doc.text('Purchase Orders', 10, 10);
    
    const headers = [['Date', 'Reference No', 'Location', 'Supplier', 'Status', 'Added By']];
    const data = this.filteredOrders.map(order => [
      order.date,
      order.referenceNo,
      order.businessLocation,
      order.supplier,
      order.status,
      order.addedBy
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20
    });

    doc.save('purchase_orders.pdf');
  }

  print(): void {
    const printContent = `
      <h2>Purchase Orders</h2>
      <table border="1" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th>Date</th>
            <th>Reference No</th>
            <th>Location</th>
            <th>Supplier</th>
            <th>Status</th>
            <th>Added By</th>
          </tr>
        </thead>
        <tbody>
          ${this.filteredOrders.map(order => `
            <tr>
              <td>${order.date}</td>
              <td>${order.referenceNo}</td>
              <td>${order.businessLocation}</td>
              <td>${order.supplier}</td>
              <td>${order.status}</td>
              <td>${order.addedBy}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    const printWindow = window.open('', '_blank');
    printWindow?.document.write(printContent);
    printWindow?.document.close();
    printWindow?.focus();
    printWindow?.print();
  }

  toggleColumnVisibility(): void {
    // This will toggle all columns except Action
    Object.keys(this.visibleColumns).forEach(key => {
      if (key !== 'action') {
        this.visibleColumns[key] = !this.visibleColumns[key];
      }
    });
  }

  addPurchaseOrder(): void {
    this.router.navigate(['/add-purchase-order']);
  }

  onEntriesChange(): void {
    this.entriesPerPage = Number(this.entriesPerPage);
    this.calculateTotalPages();
    this.currentPage = 1;
  }
}