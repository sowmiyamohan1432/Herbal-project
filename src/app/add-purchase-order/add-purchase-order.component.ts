// add-purchase-order.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { SupplierService } from '../services/supplier.service';

interface Supplier {
  id?: string;
  contactId?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  isIndividual?: boolean;
}

@Component({
  selector: 'app-add-purchase-order',
  templateUrl: './add-purchase-order.component.html',
  styleUrls: ['./add-purchase-order.component.scss']
})
export class AddPurchaseOrderComponent implements OnInit {
  purchaseOrderForm!: FormGroup;
  suppliers: Supplier[] = [];

  constructor(
    private fb: FormBuilder,
    private orderService: PurchaseOrderService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSuppliers();
    this.addRequisition();
  }

  initForm(): void {
    this.purchaseOrderForm = this.fb.group({
      supplier: ['', Validators.required],
      address: [''],
      referenceNo: ['', Validators.required],
      orderDate: [new Date(), Validators.required],
      deliveryDate: [''],
      businessLocation: ['', Validators.required],
      payTerm: [''],
      attachDocument: [null],
      requisitions: this.fb.array([]),
      shippingDetails: this.fb.group({
        shippingAddress: [''],
        shippingCharges: [0],
        shippingStatus: [''],
        deliveredTo: [''],
        shippingDocuments: [null]
      }),
      additionalNotes: ['']
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe((suppliers: Supplier[]) => {
      this.suppliers = suppliers;
    });
  }

  getSupplierDisplayName(supplier: Supplier): string {
    if (supplier.isIndividual) {
      return `${supplier.firstName || ''} ${supplier.lastName || ''}`.trim();
    }
    return supplier.businessName || '';
  }

  get requisitions() {
    return this.purchaseOrderForm.get('requisitions') as FormArray;
  }

  addRequisition() {
    this.requisitions.push(
      this.fb.group({
        productName: ['', Validators.required],
        orderQuantity: [1, [Validators.required, Validators.min(1)]],
        unitCost: [0, [Validators.required, Validators.min(0)]],
        discountPercent: [0, [Validators.min(0), Validators.max(100)]],
        lineTotal: [{ value: 0, disabled: true }]
      })
    );
  }

  calculateLineTotal(index: number) {
    const requisition = this.requisitions.at(index);
    const quantity = requisition.get('orderQuantity')?.value || 0;
    const unitCost = requisition.get('unitCost')?.value || 0;
    const discount = requisition.get('discountPercent')?.value || 0;

    const discountAmount = (unitCost * discount) / 100;
    const lineTotal = quantity * (unitCost - discountAmount);

    requisition.patchValue({ lineTotal });
  }

  onFileChange(event: any, fieldName: string) {
    const file = event.target.files[0];
    if (file && file.size <= 5 * 1024 * 1024) {
      if (['.pdf', '.csv', '.zip', '.doc', '.docx', '.jpeg', '.jpg', '.png'].includes(file.name.split('.').pop()!)) {
        this.purchaseOrderForm.get(fieldName)?.setValue(file);
      } else {
        alert('Invalid file type!');
      }
    } else {
      alert('File size exceeds 5MB!');
    }
  }

  saveOrder() {
    if (this.purchaseOrderForm.valid) {
      this.orderService.addOrder(this.purchaseOrderForm.value)
        .then(() => {
          alert('Purchase Order Saved Successfully!');
          this.router.navigate(['/purchase-order']);
        })
        .catch(error => {
          console.error('Error saving order:', error);
        });
    } else {
      alert('Please fill all required fields.');
    }
  }
}