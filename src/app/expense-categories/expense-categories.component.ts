import { Component, OnInit } from '@angular/core';
import { ExpenseCategoriesService } from '../services/expense-categories.service';
import { Observable } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-expense-categories',
  templateUrl: './expense-categories.component.html',
  styleUrls: ['./expense-categories.component.scss']
})
export class ExpenseCategoriesComponent implements OnInit {
  expenseCategories$!: Observable<any[]>;
  allCategories: any[] = []; // Store all categories for export
  categoryForm!: FormGroup;
  showModal: boolean = false;
  isEditing: boolean = false;
  currentPage: number = 1;
  itemsPerPage: number = 25;
  
  parentCategories: any[] = [];
  editingCategoryId: string | null = null;
  
  constructor(private expenseService: ExpenseCategoriesService, private fb: FormBuilder) {}
  
  ngOnInit(): void {
    this.expenseCategories$ = this.expenseService.getCategories();
    
    this.categoryForm = this.fb.group({
      categoryName: ['', Validators.required],
      categoryCode: [''],
      isSubCategory: [false],
      parentCategory: ['None']
    });
    
    this.expenseCategories$.subscribe(categories => {
      this.allCategories = categories;
      this.parentCategories = categories.filter(cat => !cat.isSubCategory);
    });
  }

  // Export functionality
  exportData(format: string) {
    this.expenseCategories$.subscribe(categories => {
      switch(format) {
        case 'csv':
          this.exportToCSV(categories);
          break;
        case 'excel':
          this.exportToExcel(categories);
          break;
        case 'print':
          this.printTable(categories);
          break;
        case 'pdf':
          this.exportToPDF(categories);
          break;
        default:
          console.warn('Unknown export format:', format);
      }
    });
  }

  private exportToCSV(categories: any[]) {
    const headers = ['Category Name', 'Category Code', 'Sub-Category', 'Parent Category'];
    const data = categories.map(cat => [
      cat.categoryName,
      cat.categoryCode || '-',
      cat.isSubCategory ? 'Yes' : 'No',
      cat.parentCategory || '-'
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(',') + "\n" 
      + data.map(e => e.join(',')).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `expense_categories_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  private exportToExcel(categories: any[]) {
    const worksheet = XLSX.utils.json_to_sheet(categories.map(cat => ({
      'Category Name': cat.categoryName,
      'Category Code': cat.categoryCode || '-',
      'Sub-Category': cat.isSubCategory ? 'Yes' : 'No',
      'Parent Category': cat.parentCategory || '-'
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Categories");
    XLSX.writeFile(workbook, `expense_categories_${new Date().toISOString().slice(0,10)}.xlsx`);
  }

  private printTable(categories: any[]) {
    const printContent = `
      <html>
        <head>
          <title>Expense Categories Report</title>
          <style>
            body { font-family: Arial; margin: 20px; }
            h1 { color: #333; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .no-data { text-align: center; padding: 20px; }
          </style>
        </head>
        <body>
          <h1>Expense Categories</h1>
          <p>Generated on: ${new Date().toLocaleDateString()}</p>
          <table>
            <thead>
              <tr>
                <th>Category Name</th>
                <th>Category Code</th>
                <th>Sub-Category</th>
                <th>Parent Category</th>
              </tr>
            </thead>
            <tbody>
              ${categories.length > 0 ? 
                categories.map(cat => `
                  <tr>
                    <td>${cat.categoryName}</td>
                    <td>${cat.categoryCode || '-'}</td>
                    <td>${cat.isSubCategory ? 'Yes' : 'No'}</td>
                    <td>${cat.parentCategory || '-'}</td>
                  </tr>
                `).join('') : `
                <tr>
                  <td colspan="4" class="no-data">No categories found</td>
                </tr>
              `}
            </tbody>
          </table>
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
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  }

  private exportToPDF(categories: any[]) {
    const doc = new jsPDF();
    const title = 'Expense Categories Report';
    
    doc.text(title, 14, 16);
    
    (doc as any).autoTable({
      head: [['Category Name', 'Category Code', 'Sub-Category', 'Parent Category']],
      body: categories.map(cat => [
        cat.categoryName,
        cat.categoryCode || '-',
        cat.isSubCategory ? 'Yes' : 'No',
        cat.parentCategory || '-'
      ]),
      startY: 25,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185], textColor: 255 }
    });
    
    doc.save(`expense_categories_${new Date().toISOString().slice(0,10)}.pdf`);
  }

  // Rest of your existing methods
  openModal(category: any = null) {
    this.showModal = true;
    
    if (category) {
      this.isEditing = true;
      this.editingCategoryId = category.id;
      this.categoryForm.patchValue({
        categoryName: category.categoryName,
        categoryCode: category.categoryCode,
        isSubCategory: category.isSubCategory,
        parentCategory: category.parentCategory || 'None'
      });
    } else {
      this.isEditing = false;
      this.editingCategoryId = null;
      this.categoryForm.reset({ isSubCategory: false, parentCategory: 'None' });
    }
  }
  
  closeModal() {
    this.showModal = false;
    this.isEditing = false;
  }
  
  async saveCategory() {
    if (this.categoryForm.valid) {
      const categoryData = this.categoryForm.value;
      
      if (this.isEditing && this.editingCategoryId) {
        await this.expenseService.updateCategory(this.editingCategoryId, categoryData);
      } else {
        await this.expenseService.addCategory(categoryData);
      }
      
      this.closeModal();
    }
  }
  
  async deleteCategory(id: string) {
    if (confirm('Are you sure you want to delete this category?')) {
      await this.expenseService.deleteCategory(id);
    }
  }
  
  navigatePage(direction: string) {
    if (direction === 'prev' && this.currentPage > 1) {
      this.currentPage--;
    } else if (direction === 'next') {
      this.currentPage++;
    }
  }
  
  changeItemsPerPage(event: any) {
    this.itemsPerPage = parseInt(event.target.value);
    this.currentPage = 1;
  }
}