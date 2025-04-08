import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { DiscountService } from '../services/discount.service';
import { saveAs } from 'file-saver'; // Importing file-saver for downloading files
import * as XLSX from 'xlsx'; // Importing XLSX for Excel export
import { jsPDF } from 'jspdf'; // Importing jsPDF for PDF export
import 'jspdf-autotable'; // Importing autoTable plugin for jsPDF

@Component({
  selector: 'app-discount',
  templateUrl: './discount.component.html',
  styleUrls: ['./discount.component.scss']
})
export class DiscountComponent implements OnInit {
  discountForm: FormGroup;
  discounts: any[] = [];
  displayedDiscounts: any[] = [];
  showForm: boolean = false;
  showColumnVisibility: boolean = false;

  // Table UI properties
  entriesPerPage: number = 3;  // Set to 3 entries per page
  currentPage: number = 1;
  totalEntries: number = 0;
  startEntry: number = 0;
  endEntry: number = 0;
  totalPages: number = 0;
  searchQuery: string = '';

  // Column visibility configuration
  columns = [
    { name: 'Name', key: 'name', visible: true },
    { name: 'Starts At', key: 'startsAt', visible: true },
    { name: 'Ends At', key: 'endsAt', visible: true },
    { name: 'Discount Amount', key: 'discountAmount', visible: true },
    { name: 'Priority', key: 'priority', visible: true },
    { name: 'Brand', key: 'brand', visible: true },
    { name: 'Category', key: 'category', visible: true },
    { name: 'Products', key: 'products', visible: true },
    { name: 'Location', key: 'location', visible: true },
    { name: 'Action', key: 'action', visible: true }
  ];

  // Data properties
  brands: any[] = [];
  locations: any[] = [];
  priceGroups: any[] = [];
  categories: any[] = [];

  constructor(
    private fb: FormBuilder,
    private discountService: DiscountService
  ) {
    this.discountForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      products: [''],
      brand: [''],
      category: [''],
      location: ['', Validators.required],
      priority: [null],
      discountType: ['', Validators.required],
      discountAmount: ['', [Validators.required, Validators.min(0)]],
      startsAt: [''],
      endsAt: [''],
      sellingPriceGroup: ['all', Validators.required],
      applyInCustomerGroups: [false],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadDiscounts();
    this.loadFormData();
  }

  loadFormData(): void {
    this.brands = [
      { id: '1', name: 'Brand 1' },
      { id: '2', name: 'Brand 2' }
    ];

    this.locations = [
      { id: '1', name: 'Location 1' },
      { id: '2', name: 'Location 2' }
    ];

    this.priceGroups = [
      { id: '1', name: 'Group 1' },
      { id: '2', name: 'Group 2' }
    ];

    this.categories = [
      { id: '1', name: 'Category 1' },
      { id: '2', name: 'Category 2' }
    ];
  }

  getBrandName(brandId: string): string {
    const brand = this.brands.find(b => b.id === brandId);
    return brand ? brand.name : '';
  }

  getCategoryName(categoryId: string): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  getLocationName(locationId: string): string {
    const location = this.locations.find(l => l.id === locationId);
    return location ? location.name : '';
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.discountForm.reset({
        discountType: '',
        sellingPriceGroup: 'all',
        isActive: true
      });
    }
  }

  loadDiscounts(): void {
    this.discountService.getDiscountsRealTime().subscribe((discounts) => {
      this.discounts = discounts.map(d => ({ ...d, selected: false }));
      this.updatePagination();
    });
  }

  updatePagination(): void {
    this.totalEntries = this.discounts.length;
    this.totalPages = Math.ceil(this.totalEntries / this.entriesPerPage);
    this.applyPagination();
  }

  applyPagination(): void {
    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    const endIndex = Math.min(startIndex + this.entriesPerPage, this.totalEntries);

    this.displayedDiscounts = this.discounts.slice(startIndex, endIndex);
    this.startEntry = this.totalEntries > 0 ? startIndex + 1 : 0;
    this.endEntry = endIndex;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyPagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyPagination();
    }
  }

  sortBy(column: string): void {
    // Implement sorting logic here
    console.log(`Sorting by ${column}`);
  }

  applySearch(): void {
    // Implement search logic here
    console.log(`Searching for ${this.searchQuery}`);
  }

  selectAll(event: any): void {
    const checked = event.target.checked;
    this.discounts = this.discounts.map(d => ({ ...d, selected: checked }));
    this.displayedDiscounts = this.displayedDiscounts.map(d => ({ ...d, selected: checked }));
  }

  hasSelectedItems(): boolean {
    return this.discounts.some(d => d.selected);
  }

  deactivateSelected(): void {
    const selectedIds = this.discounts
      .filter(d => d.selected)
      .map(d => d.id);

    // Implement deactivation logic here
    console.log(`Deactivating discounts: ${selectedIds.join(', ')}`);
  }

  exportCSV(): void {
    const csvData = this.createCSVData();
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8' });
    saveAs(blob, 'discounts.csv');
  }

  exportExcel(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.discounts);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Discounts');
    XLSX.writeFile(wb, 'discounts.xlsx');
  }

  exportPDF(): void {
    const doc = new jsPDF();
    const headers = ['Name', 'Products', 'Brand', 'Category', 'Location', 'Discount Amount', 'Priority', 'Starts At', 'Ends At'];
    const data = this.createPDFData();
    
    (doc as any).autoTable({
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      margin: { top: 20 }
    });
    
    doc.save('discounts.pdf');
  }
 
  printTable(): void {
    const printContent = document.getElementById('discount-table')?.outerHTML;
    if (printContent) {
      const windowContent = window.open('', '', 'height=700,width=800');
      if (windowContent) {
        windowContent.document.write('<html><head><title>Discount Table</title>');
        windowContent.document.write('<style>');
        windowContent.document.write('table { width: 100%; border-collapse: collapse; }');
        windowContent.document.write('th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }');
        windowContent.document.write('th { background-color: #f2f2f2; }');
        windowContent.document.write('</style>');
        windowContent.document.write('</head><body>');
        windowContent.document.write('<h1>Discount Table</h1>');
        windowContent.document.write(printContent);
        windowContent.document.write('</body></html>');
        windowContent.document.close();
        windowContent.print();
      }
    }
  }

  toggleColumnVisibility(): void {
    this.showColumnVisibility = !this.showColumnVisibility;
  }
  
  toggleColumnState(column: any): void {
    column.visible = !column.visible;
  }
  
  isColumnVisible(columnKey: string): boolean {
    const column = this.columns.find(col => col.key === columnKey);
    return column ? column.visible : true;
  }

  onSubmit(): void {
    if (this.discountForm.valid) {
      const discountData = this.discountForm.value;
      if (discountData.id) {
        this.discountService.updateDiscount(discountData.id, discountData)
          .then(() => {
            console.log('Discount updated successfully!');
            this.toggleForm();
          })
          .catch((error: any) => console.error('Error updating discount:', error));
      } else {
        this.discountService.addDiscount(discountData)
          .then(() => {
            console.log('Discount added successfully!');
            this.toggleForm();
          })
          .catch((error: any) => console.error('Error adding discount:', error));
      }
    }
  }

  onCancel(): void {
    this.toggleForm();
  }

  editDiscount(discount: any): void {
    this.showForm = true;
    this.discountForm.patchValue(discount);
  }

  deleteDiscount(id: string): void {
    if (confirm('Are you sure you want to delete this discount?')) {
      this.discountService.deleteDiscount(id)
        .then(() => console.log('Discount deleted successfully'))
        .catch((error: any) => console.error('Error deleting discount:', error));
    }
  }

  // Helper methods to format data for export
  private createCSVData(): string {
    const headers = ['Name', 'Products', 'Brand', 'Category', 'Location', 'Discount Amount', 'Priority', 'Starts At', 'Ends At'];
    const rows = this.discounts.map(d => [
      d.name, d.products, this.getBrandName(d.brand), this.getCategoryName(d.category),
      this.getLocationName(d.location), d.discountAmount, d.priority, d.startsAt, d.endsAt
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    return csv;
  }

  private createPDFData(): any[] {
    return this.discounts.map(d => [
      d.name, d.products, this.getBrandName(d.brand), this.getCategoryName(d.category),
      this.getLocationName(d.location), d.discountAmount, d.priority, d.startsAt, d.endsAt
    ]);
  }
}