// add-quotation.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuotationService } from '../services/quotations.service';


@Component({
  selector: 'app-add-quotation',
  templateUrl: './add-quotation.component.html',
  styleUrls: ['./add-quotation.component.scss']
})
export class AddQuotationComponent implements OnInit {
  quotation = {
    customer: '',
    billingAddress: 'Walk-In Customer',
    shippingAddress: 'Walk-In Customer',
    walkInCustomer: false,
    payTerm: '',
    saleDate: new Date().toISOString().slice(0, 16),
    invoiceScheme: '',
    invoiceNo: '',
    attachDocument: null,
    salesOrder: [
      { productName: '', quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 }
    ],
    discountType: 'percentage',
    discountAmount: 0,
    orderTax: 'none',
    orderTaxAmount: 0,
    shippingStatus: '',
    deliveredTo: '',
    deliveryPerson: '',
    shippingDocuments: null,
    shippingCharges: 0,
    additionalExpenses: [{ name: '', amount: 0 }],
    totalPayable: 0,
    sellNote: ''
  };

  isEditMode: boolean = false;
  quotationId: string | null = null;

  constructor(
    private quotationsService: QuotationService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe(params => {
      this.quotationId = params['id'];
      if (this.quotationId) {
        this.isEditMode = true;
        this.loadQuotation();
      }
    });
  }

  loadQuotation(): void {
    if (this.quotationId) {
      this.quotationsService.getQuotationById(this.quotationId).subscribe(data => {
        this.quotation = data as any;
        if (!this.quotation.salesOrder || this.quotation.salesOrder.length === 0) {
          this.quotation.salesOrder = [
            { productName: '', quantity: 1, unitPrice: 0, discount: 0, subtotal: 0 }
          ];
        }
      });
    }
  }

  addProduct(): void {
    this.quotation.salesOrder.push({
      productName: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      subtotal: 0
    });
  }

  removeProduct(index: number): void {
    if (this.quotation.salesOrder.length > 1) {
      this.quotation.salesOrder.splice(index, 1);
      this.calculateTotal();
    }
  }

  updateSubtotal(index: number): void {
    const item = this.quotation.salesOrder[index];
    item.subtotal = (item.quantity * item.unitPrice) - item.discount;
    this.calculateTotal();
  }

  calculateTotal(): void {
    // Calculate subtotal for all items
    let subtotal = this.quotation.salesOrder.reduce((sum, item) => sum + item.subtotal, 0);

    // Apply discount
    let discountAmount = 0;
    if (this.quotation.discountType === 'percentage') {
      discountAmount = subtotal * (this.quotation.discountAmount / 100);
    } else {
      discountAmount = this.quotation.discountAmount;
    }

    // Apply tax
    let taxAmount = 0;
    if (this.quotation.orderTax === '5') {
      taxAmount = (subtotal - discountAmount) * 0.05;
    } else if (this.quotation.orderTax === '10') {
      taxAmount = (subtotal - discountAmount) * 0.10;
    }

    // Calculate final total
    this.quotation.totalPayable = subtotal - discountAmount + taxAmount + this.quotation.shippingCharges;
  }

  getTotalItems(): number {
    return this.quotation.salesOrder.reduce((total, item) => total + item.subtotal, 0);
  }

  toggleWalkInCustomer(): void {
    if (this.quotation.walkInCustomer) {
      this.quotation.billingAddress = 'Walk-In Customer';
      this.quotation.shippingAddress = 'Walk-In Customer';
    }
  }


  onSave(): void {
    // Validate required fields
    if (!this.quotation.customer || !this.quotation.saleDate) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate all subtotals before saving
    this.quotation.salesOrder.forEach((item, index) => {
      this.updateSubtotal(index);
    });

    if (this.isEditMode && this.quotationId) {
      this.quotationsService.updateQuotation(this.quotationId, this.quotation)
        .then(() => {
          alert('Quotation updated successfully');
          this.router.navigate(['/list-quotations']); // Navigate to list page
        })
        .catch(error => {
          alert('Error updating quotation: ' + error.message);
        });
    } else {
      this.quotationsService.saveQuotation(this.quotation)
        .then(() => {
          alert('Quotation saved successfully');
          this.router.navigate(['/list-quotations']); // Navigate to list page
        })
        .catch(error => {
          alert('Error saving quotation: ' + error.message);
        });
    }
  }

  onDelete(): void {
    if (this.quotationId && confirm('Are you sure you want to delete this quotation?')) {
      this.quotationsService.deleteQuotation(this.quotationId)
        .then(() => {
          alert('Quotation deleted successfully');
          this.router.navigate(['/quotations']);
        })
        .catch(error => {
          alert('Error deleting quotation: ' + error.message);
        });
    }
  }

  onFileChange(event: any, field: string): void {
    const file = event.target.files[0];
    if (file) {
      if (field === 'attachDocument') {
        this.quotation.attachDocument = file;
      } else if (field === 'shippingDocuments') {
        this.quotation.shippingDocuments = file;
      }
    }
  }
}