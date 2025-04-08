import { Component, OnInit } from '@angular/core';
import { BrandsService, Brand } from '../services/brands.service';

@Component({
  selector: 'app-brands',
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class BrandsComponent implements OnInit {
  brands: Brand[] = [];
  filteredBrands: Brand[] = [];
  showPopup = false;
  isEditing = false;
  brand: Brand = { id: '', name: '', description: '' };
  
  // Pagination - Changed to show 3 entries per page
  entriesPerPage: number = 3;
  currentPage: number = 1;
  totalEntries: number = 0;
  totalPages: number = 1;
  startEntry: number = 1;
  endEntry: number = 0;
  
  // Search
  searchTerm: string = '';

  constructor(private brandsService: BrandsService) {}

  ngOnInit() {
    this.loadBrands();
  }

  loadBrands() {
    this.brandsService.brands$.subscribe(data => {
      this.brands = data;
      this.totalEntries = this.brands.length;
      this.applyFilters();
    });
  }

  applyFilters() {
    // Apply search filter
    let filtered = this.brands;
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(brand => 
        brand.name.toLowerCase().includes(term) || 
        (brand.description && brand.description.toLowerCase().includes(term))
      );
    }
    
    // Calculate pagination
    this.totalEntries = filtered.length;
    this.totalPages = Math.ceil(this.totalEntries / this.entriesPerPage);
    
    // Ensure current page is valid
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages || 1;
    }
    
    // Apply pagination
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = Math.min(start + this.entriesPerPage, this.totalEntries);
    this.startEntry = start + 1;
    this.endEntry = end;
    
    // Get page data
    this.filteredBrands = filtered.slice(start, end);
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.applyFilters();
    }
  }

  addOrUpdateBrand() {
    if (this.isEditing && this.brand.id) {
      this.brandsService.updateBrand(this.brand.id, {
        name: this.brand.name,
        description: this.brand.description
      }).then(() => {
        alert('Brand updated successfully!');
        this.closePopup();
        this.loadBrands(); // Refresh data
      }).catch(error => console.error('Error updating brand', error));
    } else if (!this.isEditing) {
      this.brandsService.addBrand({
        name: this.brand.name,
        description: this.brand.description
      }).then(() => {
        alert('Brand added successfully!');
        this.closePopup();
        this.loadBrands(); // Refresh data
      }).catch(error => console.error('Error adding brand', error));
    }
  }

  editBrand(brand: Brand) {
    if (brand.id) {
      this.brand = { ...brand };
      this.isEditing = true;
      this.showPopup = true;
    }
  }

  deleteBrand(id: string | undefined) {
    if (id && confirm('Are you sure you want to delete this brand?')) {
      this.brandsService.deleteBrand(id).then(() => {
        alert('Brand deleted successfully!');
        this.loadBrands(); // Refresh data
      }).catch(error => console.error('Error deleting brand', error));
    }
  }

  openPopup() {
    this.brand = { id: '', name: '', description: '' };
    this.isEditing = false;
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
  }

  // Export functions
  exportCSV() {
    const headers = ['Brand Name', 'Description'];
    const csvContent = [
      headers.join(','),
      ...this.brands.map(brand => 
        `"${brand.name.replace(/"/g, '""')}","${brand.description?.replace(/"/g, '""') || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', 'brands.csv');
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportExcel() {
    console.log('Exporting Excel');
    // Implement Excel export functionality using a library like xlsx
  }

  print() {
    const printContent = document.getElementById('print-section');
    const WindowPrt = window.open('', '', 'left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0');
    WindowPrt?.document.write(printContent?.innerHTML || '');
    WindowPrt?.document.close();
    WindowPrt?.focus();
    WindowPrt?.print();
    WindowPrt?.close();
  }

  toggleColumnVisibility() {
    console.log('Toggle column visibility');
    // Implement column visibility toggle logic
  }

  exportPDF() {
    console.log('Exporting PDF');
    // Implement PDF export functionality using a library like jspdf
  }
}