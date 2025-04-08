import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators, FormControl, ValidatorFn, AbstractControl } from '@angular/forms';
import { StockService } from '../services/stock.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-stock',
  templateUrl: './add-stock.component.html',
  styleUrls: ['./add-stock.component.scss']
})
export class AddStockComponent implements OnInit {
  stockForm: FormGroup;
  totalAmount: number = 0;
  isSubmitting: boolean = false;
  submitError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private stockService: StockService,
    private router: Router
  ) {
    this.stockForm = this.fb.group({
      date: ['', Validators.required],
      referenceNo: [''],
      status: ['pending', Validators.required],
      locationFrom: ['', Validators.required],
      locationTo: ['', Validators.required],
      products: this.fb.array([this.createProduct()], this.atLeastOneProductValidator()),
      shippingCharges: [0, [Validators.min(0)]],
      additionalNotes: ['']
    });
  }

  ngOnInit(): void {
    this.stockForm.get('shippingCharges')?.valueChanges.subscribe(() => {
      this.calculateTotal();
    });
  }

  // Corrected validator function
  private atLeastOneProductValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const productsArray = control as FormArray;
      if (!productsArray || !productsArray.controls) {
        return { noValidProducts: true };
      }

      const hasValidProducts = productsArray.controls.some(productGroup => {
        if (!(productGroup instanceof FormGroup)) return false;
        
        const product = productGroup.get('product')?.value;
        const quantity = productGroup.get('quantity')?.value;
        const unitPrice = productGroup.get('unitPrice')?.value;
        return product && quantity > 0 && unitPrice > 0;
      });

      return hasValidProducts ? null : { noValidProducts: true };
    };
  }

  createProduct(): FormGroup {
    return this.fb.group({
      product: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      subtotal: [0]
    });
  }

  get products(): FormArray {
    return this.stockForm.get('products') as FormArray;
  }

  addProduct(): void {
    this.products.push(this.createProduct());
    this.stockForm.updateValueAndValidity();
  }

  removeProduct(index: number): void {
    this.products.removeAt(index);
    this.calculateTotal();
    this.stockForm.updateValueAndValidity();
  }

  calculateSubtotal(index: number): void {
    const productGroup = this.products.at(index) as FormGroup;
    const quantity = productGroup.get('quantity')?.value || 0;
    const unitPrice = productGroup.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;

    productGroup.patchValue({ subtotal });
    this.calculateTotal();
  }

  getSubtotal(index: number): number {
    const productGroup = this.products.at(index) as FormGroup;
    return productGroup.get('subtotal')?.value || 0;
  }

  calculateTotal(): void {
    this.totalAmount = this.products.controls.reduce((sum, productGroup) => {
      return sum + (productGroup.get('subtotal')?.value || 0);
    }, 0);
  }

  onSubmit(): void {
    if (this.stockForm.invalid) {
      this.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.submitError = null;

    const formValue = this.stockForm.value;
    const stockData = {
      ...formValue,
      totalAmount: this.totalAmount + (formValue.shippingCharges || 0),
      date: new Date(formValue.date).toISOString()
    };

    this.stockService.addStock(stockData)
      .then(() => {
        this.router.navigate(['/list-stock']);
      })
      .catch(error => {
        console.error('Error adding stock:', error);
        this.submitError = 'Failed to save stock. Please try again.';
      })
      .finally(() => {
        this.isSubmitting = false;
      });
  }

  private markAllAsTouched(): void {
    Object.values(this.stockForm.controls).forEach(control => {
      if (control instanceof FormControl) {
        control.markAsTouched();
      } else if (control instanceof FormArray) {
        control.controls.forEach(group => {
          if (group instanceof FormGroup) {
            Object.values(group.controls).forEach(c => c.markAsTouched());
          }
        });
      }
    });
  }
}