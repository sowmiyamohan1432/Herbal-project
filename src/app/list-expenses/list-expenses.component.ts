import { Component, OnInit, OnDestroy } from '@angular/core';
import { ExpenseService } from '../services/expense.service';
import { Expense } from '../models/expense.model';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-list-expenses',
  templateUrl: './list-expenses.component.html',
  styleUrls: ['./list-expenses.component.scss']
})
export class ListExpensesComponent implements OnInit, OnDestroy {
toggleColumnVisibility() {
throw new Error('Method not implemented.');
}
  expenses: Expense[] = [];
  filteredExpenses: Expense[] = [];
  private expensesSub!: Subscription;
  
  // Pagination
  currentPage: number = 1;
  entriesPerPage: number = 25;
  totalEntries: number = 0;
  searchTerm: string = '';

  constructor(
    private expenseService: ExpenseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.expensesSub = this.expenseService.getExpenses().subscribe(expenses => {
      this.expenses = expenses;
      this.filteredExpenses = [...expenses];
      this.totalEntries = expenses.length;
    });
  }

  ngOnDestroy(): void {
    if (this.expensesSub) {
      this.expensesSub.unsubscribe();
    }
  }

  // Export to CSV
  exportCSV(): void {
    const headers = [
      'Date', 'Reference No', 'Expense Category', 'Location', 
      'Payment Status', 'Total Amount', 'Payment Due'
    ];
    
    const data = this.filteredExpenses.map(expense => [
      new Date(expense.date).toLocaleDateString(),
      expense.referenceNo || '-',
      expense.expenseCategory || '-',
      expense.businessLocation || '-',
      expense.paymentMethod || '-',
      expense.totalAmount || '0.00',
      '0.00' // Payment due placeholder
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + data.map(e => e.join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expenses_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export to Excel
  exportExcel(): void {
    const worksheet = XLSX.utils.json_to_sheet(this.filteredExpenses.map(expense => ({
      'Date': new Date(expense.date).toLocaleDateString(),
      'Reference No': expense.referenceNo || '-',
      'Expense Category': expense.expenseCategory || '-',
      'Location': expense.businessLocation || '-',
      'Payment Status': expense.paymentMethod || '-',
      'Total Amount': expense.totalAmount || '0.00',
      'Payment Due': '0.00'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");
    XLSX.writeFile(workbook, `expenses_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  // Print Functionality
  printTable(): void {
    const printContent = document.getElementById('print-section');
    const WindowObject = window.open('', 'PrintWindow', 'width=750,height=650,top=50,left=50,toolbars=no,scrollbars=yes,status=no,resizable=yes');
    
    if (WindowObject && printContent) {
      WindowObject.document.writeln(`
        <html>
          <head>
            <title>Expenses Report</title>
            <style>
              body { font-family: Arial, sans-serif; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total-row { font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Expenses Report</h1>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                setTimeout(function() {
                  window.print();
                  window.close();
                }, 100);
              };
            </script>
          </body>
        </html>
      `);
      WindowObject.document.close();
    }
  }

  // Export to PDF
  exportPDF(): void {
    const doc = new jsPDF();
    const title = 'Expenses Report';
    
    doc.text(title, 14, 16);
    
    (doc as any).autoTable({
      head: [['Date', 'Reference', 'Category', 'Location', 'Status', 'Amount']],
      body: this.filteredExpenses.map(expense => [
        new Date(expense.date).toLocaleDateString(),
        expense.referenceNo || '-',
        expense.expenseCategory || '-',
        expense.businessLocation || '-',
        expense.paymentMethod || '-',
        expense.totalAmount || '0.00'
      ]),
      startY: 25,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save(`expenses_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // Search functionality
  onSearch(event: any): void {
    this.searchTerm = event.target.value.toLowerCase();
    this.filteredExpenses = this.expenses.filter(expense => 
      (expense.referenceNo?.toLowerCase().includes(this.searchTerm)) ||
      (expense.expenseCategory?.toLowerCase().includes(this.searchTerm)) ||
      (expense.businessLocation?.toLowerCase().includes(this.searchTerm)) ||
      (expense.paymentMethod?.toLowerCase().includes(this.searchTerm))
    );
    this.totalEntries = this.filteredExpenses.length;
    this.currentPage = 1;
  }

  // Pagination methods
  changeEntriesPerPage(event: any): void {
    this.entriesPerPage = parseInt(event.target.value);
    this.currentPage = 1;
  }

  get paginatedExpenses(): Expense[] {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;
    return this.filteredExpenses.slice(start, end);
  }

  nextPage(): void {
    if (this.currentPage * this.entriesPerPage < this.totalEntries) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Other existing methods
  editExpense(id: string): void {
    this.router.navigate(['/edit-expense', id]);
  }

  async deleteExpense(id: string): Promise<void> {
    if (confirm('Are you sure you want to delete this expense?')) {
      try {
        await this.expenseService.deleteExpense(id);
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
      }
    }
  }

  addNewExpense(): void {
    this.router.navigate(['/add-expense']);
  }

  // Method to calculate the total amount of filtered expenses
  getTotalAmount(): number {
    return this.filteredExpenses.reduce((total, expense) => total + (expense.totalAmount || 0), 0);
  }
  getPaginatedEndIndex(): number {
    return Math.min(this.currentPage * this.entriesPerPage, this.totalEntries);
  }
    // New method for viewing the expense details
    viewExpense(id: string): void {
      this.router.navigate(['/view-expense', id]);  // Navigate to the 'view-expense' route
    }
}
