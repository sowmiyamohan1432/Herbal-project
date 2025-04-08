// add-expense.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExpenseService } from '../services/expense.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-expense',
  templateUrl: './add-expense.component.html',
  styleUrls: ['./add-expense.component.scss']
})
export class AddExpenseComponent implements OnInit {
  expenseForm!: FormGroup;
  maxFileSizeMB = 5;  
  allowedFileTypes = ['pdf', 'csv', 'zip', 'doc', 'docx', 'jpeg', 'jpg', 'png'];
  selectedFile: File | null = null;

  constructor(
    private fb: FormBuilder, 
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.expenseForm = this.fb.group({
      businessLocation: ['', Validators.required],
      expenseCategory: [''],
      subCategory: [''],
      referenceNo: [''],
      date: [new Date().toISOString().slice(0, 16), Validators.required],
      expenseFor: [''],
      expenseForContact: [''],
      document: [null],
      applicableTax: ['None'],
      totalAmount: ['', [Validators.required, Validators.min(0)]],
      expenseNote: [''],
      isRefund: [false],
      isRecurring: [false],
      recurringInterval: ['Days'],
      repetitions: [''],
      paymentAmount: ['', [Validators.required, Validators.min(0)]],
      paidOn: [new Date().toISOString().slice(0, 16), Validators.required],
      paymentMethod: ['Cash', Validators.required],
      paymentAccount: [''],
      paymentNote: ['']
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileType = file.name.split('.').pop()?.toLowerCase();
      const fileSizeMB = file.size / (1024 * 1024);
      
      if (!this.allowedFileTypes.includes(fileType!)) {
        alert('Invalid file type. Allowed types: ' + this.allowedFileTypes.join(', '));
        return;
      }

      if (fileSizeMB > this.maxFileSizeMB) {
        alert('File size exceeds 5MB limit.');
        return;
      }

      this.selectedFile = file;
    }
  }

  async saveExpense() {
    if (this.expenseForm.valid) {
      const expenseData = this.expenseForm.value;
      
      if (this.selectedFile) {
        expenseData.document = this.selectedFile.name;
      }
      
      try {
        await this.expenseService.addExpense(expenseData);
        this.expenseForm.reset();
        this.initForm(); // Reset form with default values
        this.selectedFile = null;
        alert('Expense saved successfully!');
        this.router.navigate(['/list-expenses']); // Redirect to list page
      } catch (error) {
        console.error('Error saving expense:', error);
        alert('Error saving expense. Please try again.');
      }
    } else {
      this.markFormGroupTouched(this.expenseForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
