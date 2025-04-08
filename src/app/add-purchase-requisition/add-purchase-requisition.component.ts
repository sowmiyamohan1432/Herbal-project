import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';

@Component({
  selector: 'app-add-purchase-requisition',
  templateUrl: './add-purchase-requisition.component.html',
  styleUrls: ['./add-purchase-requisition.component.scss']
})
export class AddPurchaseRequisitionComponent implements OnInit {
  purchaseForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private requisitionService: PurchaseRequisitionService,
    public router: Router
  ) {}

  ngOnInit(): void {
    this.purchaseForm = this.fb.group({
      brand: ['Herbally', Validators.required],
      category: ['Special medicines-12%', Validators.required],
      location: ['', Validators.required],
      referenceNo: ['', Validators.required],
      requiredByDate: ['', Validators.required],
      products: this.fb.array([]) // Array to hold product requisitions
    });

    this.addProduct(); // Default to adding one product field
  }

  get products() {
    return this.purchaseForm.get('products') as FormArray;
  }

  // Method to add a product entry to the form
  addProduct() {
    this.products.push(
      this.fb.group({
        productName: ['', Validators.required],
        alertQuantity: ['', Validators.required],
        requiredQuantity: ['', Validators.required]
      })
    );
  }

  // Method to save the purchase requisition
  savePurchase() {
    if (this.purchaseForm.valid) {
      this.requisitionService.addRequisition(this.purchaseForm.value)
        .then(() => {
          alert('Purchase Requisition Added!');
          this.router.navigate(['/purchase-requisition']); // Navigate to the requisition list after successful save
        })
        .catch(error => {
          console.error('Error adding document: ', error);
        });
    } else {
      alert('Please fill all fields!');
    }
  }
}
