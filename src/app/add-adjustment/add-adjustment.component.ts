import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators } from '@angular/forms';
import { AdjustmentService } from '../services/adjustment.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

interface Product {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

@Component({
  selector: 'app-add-adjustment',
  templateUrl: './add-adjustment.component.html',
  styleUrls: ['./add-adjustment.component.scss']
})
export class AddAdjustmentComponent implements OnInit {
  adjustmentForm!: FormGroup;
  stockAdjustments$!: Observable<any[]>;
  submitted = false;
  isSaving = false; // Added loading state
  totalAmount = 0;
  productSearchControl = new FormControl('');
  
  businessLocations: string[] = [
 
  ];
  
  availableProducts: Product[] = [
    { id: 'p1', name: 'Product 1', quantity: 1, unitPrice: 20, subtotal: 20 },
    { id: 'p2', name: 'Product 2', quantity: 1, unitPrice: 35, subtotal: 35 },
    { id: 'p3', name: 'Product 3', quantity: 1, unitPrice: 15, subtotal: 15 },
    { id: 'p4', name: 'Product 4', quantity: 1, unitPrice: 50, subtotal: 50 }
  ];
  
  filteredProducts: Product[] = [];

  constructor(
    private fb: FormBuilder,
    private adjustmentService: AdjustmentService,
    public router: Router, 

  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.stockAdjustments$ = this.adjustmentService.getStockAdjustments();
    this.filteredProducts = [...this.availableProducts];
    this.addEmptyProduct();
  }
  
  private initializeForm(): void {
    const currentDateTime = new Date().toISOString().slice(0, 16);
    
    this.adjustmentForm = this.fb.group({
      businessLocation: ['', Validators.required],
      referenceNo: [''],
      date: [currentDateTime, Validators.required],
      adjustmentType: ['', Validators.required],
      products: this.fb.array([]),
      totalAmountRecovered: [0],
      reason: ['']
    });
  }
  
  get f() { return this.adjustmentForm.controls; }
  
  get products() {
    return this.adjustmentForm.get('products') as FormArray;
  }

  addEmptyProduct(): void {
    const productForm = this.fb.group({
      id: [''],
      name: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0)]],
      subtotal: [0]
    });
    
    this.products.push(productForm);
  }
  
  onProductSearch(event: any): void {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredProducts = searchTerm 
      ? this.availableProducts.filter(p => p.name.toLowerCase().includes(searchTerm))
      : [...this.availableProducts];
  }
  
  addProduct(product: Product): void {
    const exists = this.products.controls.some(
      control => control.get('id')?.value === product.id
    );
    
    if (!exists) {
      const productForm = this.fb.group({
        id: [product.id],
        name: [product.name],
        quantity: [1, [Validators.required, Validators.min(1)]],
        unitPrice: [product.unitPrice, [Validators.required, Validators.min(0)]],
        subtotal: [product.unitPrice]
      });
      
      this.products.push(productForm);
      this.calculateTotalAmount();
    }
    
    this.productSearchControl.setValue('');
    this.filteredProducts = [...this.availableProducts];
  }
  
  removeProduct(index: number): void {
    this.products.removeAt(index);
    this.calculateTotalAmount();
    
    // Add empty product if last one was removed
    if (this.products.length === 0) {
      this.addEmptyProduct();
    }
  }
  
  updateSubtotal(index: number): void {
    const product = this.products.at(index);
    const quantity = product.get('quantity')?.value || 0;
    const unitPrice = product.get('unitPrice')?.value || 0;
    const subtotal = quantity * unitPrice;
    
    product.patchValue({ subtotal: subtotal });
    this.calculateTotalAmount();
  }
  
  calculateTotalAmount(): void {
    this.totalAmount = this.products.controls.reduce((total, product) => {
      return total + (product.get('subtotal')?.value || 0);
    }, 0);
  }

  saveAdjustment(): void {
    this.submitted = true;
    
    if (this.adjustmentForm.invalid || this.products.length === 0) {
      this.showValidationErrors();
      return;
    }

    this.processAdjustmentSave();
  }

  private showValidationErrors(): void {
    if (this.products.length === 0) {
      alert('Please add at least one product');
    } else {
      alert('Please fill all required fields');
      // Mark all form controls as touched to show errors
      Object.values(this.adjustmentForm.controls).forEach(control => {
        control.markAsTouched();
      });
    }
  }

  private processAdjustmentSave(): void {
    this.isSaving = true;
    const formData = this.prepareFormData();

    this.adjustmentService.addStockAdjustment(formData)
      .then(() => this.handleSaveSuccess())
      .catch(error => this.handleSaveError(error))
      .finally(() => this.isSaving = false);
  }

  private prepareFormData(): any {
    const formData = this.adjustmentForm.value;
    formData.totalAmount = this.totalAmount;
    formData.products = this.products.value;
    return formData;
  }

  private handleSaveSuccess(): void {
    alert('Stock adjustment saved successfully');
    this.resetForm();
    this.navigateToList();
  }

  private handleSaveError(error: any): void {
    console.error('Error saving adjustment:', error);
    alert('Failed to save adjustment. Please try again.');
  }

  private resetForm(): void {
    this.adjustmentForm.reset();
    this.products.clear();
    this.submitted = false;
    this.totalAmount = 0;
    this.addEmptyProduct();
  }

  private navigateToList(): void {
    this.router.navigate(['/list-adjustment']).then(success => {
      if (!success) {
        console.error('Navigation to list failed');
        window.location.href = '/list-adjustment'; // Fallback
      }
    });
  }
}