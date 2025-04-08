import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PurchaseService } from '../services/purchase.service';
import { Router } from '@angular/router';
import { SupplierService } from '../services/supplier.service';

interface Supplier {
  id: string;
  contactId?: string;
  businessName?: string;
  firstName?: string;
  lastName?: string;
  isIndividual?: boolean;
  addressLine1?: string;
}

@Component({
  selector: 'app-add-purchase',
  templateUrl: './add-purchase.component.html',
  styleUrls: ['./add-purchase.component.scss']
})
export class AddPurchaseComponent implements OnInit {
  purchaseForm!: FormGroup;
  suppliers: Supplier[] = [];
  selectedSupplier: Supplier | null = null;

  constructor(
    private fb: FormBuilder,
    private purchaseService: PurchaseService,
    private supplierService: SupplierService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadSuppliers();
  }

  initForm(): void {
    this.purchaseForm = this.fb.group({
      supplierId: ['', Validators.required],
      supplierName: ['', Validators.required],
      address: [''],
      referenceNo: ['', Validators.required],
      purchaseDate: [new Date().toISOString().substring(0, 10), Validators.required],
      purchaseStatus: ['', Validators.required],
      businessLocation: ['', Validators.required],
      payTerm: [''],
      document: [null],
      discountType: [''],
      discountAmount: [0],
      purchaseTax: [0],
      additionalNotes: [''],
      shippingCharges: [0],
      additionalExpenses: this.fb.array([]),
      purchaseTotal: [0],
      paymentAmount: [0, Validators.required],
      paidOn: [new Date().toISOString().substring(0, 10), Validators.required],
      paymentMethod: ['', Validators.required],
      paymentAccount: [''],
      paymentNote: [''],
      paymentDue: [0]
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

  onSupplierChange(supplierId: string): void {
    const selectedSupplier = this.suppliers.find(s => s.id === supplierId);
    if (selectedSupplier) {
      this.selectedSupplier = selectedSupplier;
      this.purchaseForm.patchValue({
        supplierName: this.getSupplierDisplayName(selectedSupplier),
        address: selectedSupplier.addressLine1 || ''
      });
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.purchaseForm.patchValue({ document: file.name });
    }
  }

  savePurchase() {
    if (this.purchaseForm.valid) {
      const formData = this.purchaseForm.value;
      
      // Prepare the purchase data to be saved
      const purchaseData = {
        ...formData,
        supplier: {
          id: formData.supplierId,
          name: formData.supplierName
        },
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.purchaseService.addPurchase(purchaseData)
        .then(() => {
          alert('Purchase Added Successfully!');
          this.router.navigate(['/list-purchase']);
        })
        .catch(error => {
          console.error('Error adding purchase:', error);
          alert('Error adding purchase. Please try again.');
        });
    } else {
      alert('Please fill all required fields!');
    }
  }
}