// add-sale.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SaleService } from '../services/sale.service';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';

interface Product {
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  subtotal: number;
}

@Component({
  selector: 'app-add-sale',
  templateUrl: './add-sale.component.html',
  styleUrls: ['./add-sale.component.scss'],
  providers: [DatePipe]
})
export class AddSaleComponent implements OnInit {
  saleForm!: FormGroup;
  todayDate: string;
  products: Product[] = [];
  defaultProduct: Product = {
    name: '',
    quantity: 0,
    unitPrice: 0,
    discount: 0,
    subtotal: 0
  };
  itemsTotal: number = 0;

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private router: Router,
    private datePipe: DatePipe
  ) {
    this.todayDate = this.datePipe.transform(new Date(), 'yyyy-MM-dd') || '';
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setupValueChanges();
  }

  initializeForm(): void {
    this.saleForm = this.fb.group({
      customer: ['', Validators.required],
      billingAddress: [''],
      shippingAddress: [''],
      saleDate: [this.todayDate, Validators.required],
      status: ['', Validators.required],
      invoiceScheme: [''],
      invoiceNo: [''],
      document: [null],
      discountType: ['Percentage'],
      discountAmount: [0, [Validators.min(0)]],
      orderTax: [0, [Validators.min(0), Validators.max(100)]],
      sellNote: [''],
      shippingCharges: [0, [Validators.min(0)]],
      shippingStatus: [''],
      deliveryPerson: [''],
      shippingDocuments: [null],
      totalPayable: [0],
      paymentAmount: [0, [Validators.required, Validators.min(0)]],
      paidOn: [this.todayDate],
      paymentMethod: ['', Validators.required],
      paymentNote: [''],
      changeReturn: [0],
      balance: [0]
    });
  }

  setupValueChanges(): void {
    this.saleForm.get('paymentAmount')?.valueChanges.subscribe(() => {
      this.calculateBalance();
    });

    this.saleForm.get('discountAmount')?.valueChanges.subscribe(() => {
      this.calculateTotalPayable();
    });

    this.saleForm.get('orderTax')?.valueChanges.subscribe(() => {
      this.calculateTotalPayable();
    });

    this.saleForm.get('shippingCharges')?.valueChanges.subscribe(() => {
      this.calculateTotalPayable();
    });

    this.saleForm.get('discountType')?.valueChanges.subscribe(() => {
      this.calculateTotalPayable();
    });
  }

  updateDefaultProduct(): void {
    this.defaultProduct.subtotal = (this.defaultProduct.quantity * this.defaultProduct.unitPrice) - this.defaultProduct.discount;
    this.calculateItemsTotal();
    this.calculateTotalPayable();
  }

  addProduct(): void {
    // Add the default product if it has data
    if (this.defaultProduct.name || this.defaultProduct.quantity > 0 || this.defaultProduct.unitPrice > 0) {
      this.products.push({...this.defaultProduct});
      // Reset default product
      this.defaultProduct = {
        name: '',
        quantity: 0,
        unitPrice: 0,
        discount: 0,
        subtotal: 0
      };
    } else {
      // Add empty product
      this.products.push({
        name: '',
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        subtotal: 0
      });
    }
    this.calculateItemsTotal();
    this.calculateTotalPayable();
  }

  updateProduct(index: number): void {
    const product = this.products[index];
    product.subtotal = (product.quantity * product.unitPrice) - product.discount;
    this.calculateItemsTotal();
    this.calculateTotalPayable();
  }

  removeProduct(index: number): void {
    this.products.splice(index, 1);
    this.calculateItemsTotal();
    this.calculateTotalPayable();
  }

  calculateItemsTotal(): void {
    // Include default product in total if it has values
    const defaultProductValue = (this.defaultProduct.name || this.defaultProduct.quantity > 0 || this.defaultProduct.unitPrice > 0) 
      ? this.defaultProduct.subtotal 
      : 0;
    
    this.itemsTotal = this.products.reduce((sum, product) => sum + product.subtotal, defaultProductValue);
  }

  calculateTotalPayable(): void {
    const discount = this.saleForm.get('discountAmount')?.value || 0;
    const tax = this.saleForm.get('orderTax')?.value || 0;
    const shipping = this.saleForm.get('shippingCharges')?.value || 0;

    let total = this.itemsTotal;
    
    if (this.saleForm.get('discountType')?.value === 'Percentage') {
      total -= (total * discount / 100);
    } else {
      total -= discount;
    }

    total += (total * tax / 100);
    total += shipping;

    this.saleForm.patchValue({ totalPayable: total.toFixed(2) });
    this.calculateBalance();
  }

  calculateBalance(): void {
    const totalPayable = this.saleForm.get('totalPayable')?.value || 0;
    const paymentAmount = this.saleForm.get('paymentAmount')?.value || 0;

    if (paymentAmount > totalPayable) {
      this.saleForm.patchValue({
        changeReturn: (paymentAmount - totalPayable).toFixed(2),
        balance: 0
      });
    } else {
      this.saleForm.patchValue({
        changeReturn: 0,
        balance: (totalPayable - paymentAmount).toFixed(2)
      });
    }
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.saleForm.patchValue({ document: file.name });
    }
  }

  onShippingDocumentSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.saleForm.patchValue({ shippingDocuments: file.name });
    }
  }

  saveSale(): void {
    if (this.saleForm.valid && (this.products.length > 0 || 
        (this.defaultProduct.name || this.defaultProduct.quantity > 0 || this.defaultProduct.unitPrice > 0))) {
      
      // Include default product if it has values
      const productsToSave = [...this.products];
      if (this.defaultProduct.name || this.defaultProduct.quantity > 0 || this.defaultProduct.unitPrice > 0) {
        productsToSave.push({...this.defaultProduct});
      }

      const saleData = { 
        ...this.saleForm.value,
        products: productsToSave,
        itemsTotal: this.itemsTotal,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      this.saleService.addSale(saleData)
        .then(() => {
          alert('Sale added successfully!');
          this.router.navigate(['/sales']);
        })
        .catch(error => {
          console.error('Error adding sale:', error);
          alert('Error adding sale. Please try again.');
        });
    } else {
      this.markFormGroupTouched(this.saleForm);
      if (this.products.length === 0 && 
          !(this.defaultProduct.name || this.defaultProduct.quantity > 0 || this.defaultProduct.unitPrice > 0)) {
        alert('Please add at least one product');
      }
    }
  }

  resetForm(): void {
    if (confirm('Are you sure you want to reset the form?')) {
      this.saleForm.reset({
        saleDate: this.todayDate,
        paidOn: this.todayDate,
        discountType: 'Percentage',
        discountAmount: 0,
        orderTax: 0,
        shippingCharges: 0,
        totalPayable: 0,
        paymentAmount: 0,
        changeReturn: 0,
        balance: 0
      });
      this.products = [];
      this.defaultProduct = {
        name: '',
        quantity: 0,
        unitPrice: 0,
        discount: 0,
        subtotal: 0
      };
      this.itemsTotal = 0;
    }
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}