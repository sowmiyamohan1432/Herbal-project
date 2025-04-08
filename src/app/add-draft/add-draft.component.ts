// add-draft.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { DraftService } from '../services/draft.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-draft',
  templateUrl: './add-draft.component.html',
  styleUrls: ['./add-draft.component.scss']
})
export class AddDraftComponent implements OnInit {
  draftForm: FormGroup;
  totalPayable: number = 0;
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder,
    private draftService: DraftService,
    private router: Router // <-- Add this line
  ) {
    this.draftForm = this.fb.group({
      customer: ['', Validators.required],
      billingAddress: ['Walk-In Customer'],
      shippingAddress: ['Walk-In Customer'],
      payTerm: [''],
      saleDate: ['', Validators.required],
      invoiceNo: [''],
      salesOrder: [''],
      discountType: ['percentage', Validators.required],
      discountAmount: [0, Validators.required],
      orderTax: ['none', Validators.required],
      sellNote: [''],
      shippingCharges: [0],
      shippingStatus: [''],
      deliveredTo: [''],
      deliveryPerson: [''],
      products: this.fb.array([this.createProduct()])
    });
  }
  ngOnInit(): void {
    this.calculateTotal();
    this.draftForm.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  createProduct(): FormGroup {
    return this.fb.group({
      productName: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0]
    });
  }

  get products(): FormArray {
    return this.draftForm.get('products') as FormArray;
  }

  addProduct(): void {
    this.products.push(this.createProduct());
  }

  removeProduct(index: number): void {
    if (this.products.length > 1) {
      this.products.removeAt(index);
    }
    this.calculateTotal();
  }

  calculateSubtotal(index: number): void {
    const productGroup = this.products.at(index) as FormGroup;
    const quantity = productGroup.get('quantity')?.value || 0;
    const unitPrice = productGroup.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    productGroup.get('subtotal')?.setValue(subtotal, { emitEvent: false });
    this.calculateTotal();
  }

  calculateTotal(): void {
    // Calculate products subtotal
    let subtotal = 0;
    this.products.controls.forEach(productGroup => {
      subtotal += productGroup.get('subtotal')?.value || 0;
    });

    // Apply discount
    const discountType = this.draftForm.get('discountType')?.value;
    const discountAmount = this.draftForm.get('discountAmount')?.value || 0;
    let discount = 0;

    if (discountType === 'percentage') {
      discount = subtotal * (discountAmount / 100);
    } else {
      discount = Math.min(discountAmount, subtotal);
    }

    // Apply tax
    const taxRate = parseFloat(this.draftForm.get('orderTax')?.value) || 0;
    const taxableAmount = subtotal - discount;
    const tax = taxableAmount * (taxRate / 100);

    // Add shipping charges
    const shipping = this.draftForm.get('shippingCharges')?.value || 0;

    // Calculate final total
    this.totalPayable = taxableAmount + tax + shipping;
  }

  onFileSelected(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }
  onSubmit(): void {
    if (this.draftForm.invalid) {
      alert('Please fill in all required fields');
      return;
    }

    // Calculate all subtotals before submission
    this.products.controls.forEach((_, index) => {
      this.calculateSubtotal(index);
    });

    const formData = {
      ...this.draftForm.value,
      products: this.products.value,
      totalPayable: this.totalPayable
    };

    this.draftService.addDraft(formData).then(() => {
      this.router.navigate(['/list-draft']);
    }).catch((error: any) => {
      console.error('Error saving draft:', error);
      alert('Error saving draft. Please try again.');
    });
  }
}