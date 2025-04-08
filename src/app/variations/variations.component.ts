import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { VariationsService, Variation } from '../services/variations.service';

@Component({
  selector: 'app-variations',
  templateUrl: './variations.component.html',
  styleUrls: ['./variations.component.scss']
})
export class VariationsComponent implements OnInit {
  variations: Variation[] = [];
  newVariation = { id: '', name: '', values: '' };
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  showAddForm = false;
  isEditing = false;
  math = Math;
  // Pagination properties
  currentPage = 1;
  itemsPerPage = 3;
  totalItems = 0;
  
  // Sorting properties
  sortColumn: string = 'name';
  sortDirection: 'asc' | 'desc' = 'asc';

  constructor(
    private variationsService: VariationsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadVariations();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.newVariation = { id: '', name: '', values: '' };
    this.isEditing = false;
  }

  loadVariations(): void {
    this.isLoading = true;
    this.errorMessage = null;
    
    this.variationsService.getVariations().subscribe({
      next: (data) => {
        this.variations = data;
        this.totalItems = data.length;
        this.sortVariations(); // Apply sorting when data loads
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error:', error);
        this.errorMessage = error.message || 'Failed to load variations';
        this.isLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Sorting methods
  sortBy(column: string): void {
    if (this.sortColumn === column) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }
    this.sortVariations();
  }

  private sortVariations(): void {
    this.variations.sort((a, b) => {
      const valA = this.sortColumn === 'name' ? a.name.toLowerCase() : '';
      const valB = this.sortColumn === 'name' ? b.name.toLowerCase() : '';
      
      if (valA < valB) return this.sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Pagination methods
  get paginatedVariations(): Variation[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.variations.slice(startIndex, startIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.itemsPerPage);
  }

  setPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  onItemsPerPageChange(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.itemsPerPage = Number(selectElement.value);
    this.currentPage = 1;
  }

  getPageNumbers(): number[] {
    const maxVisiblePages = 5;
    const pages = [];
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  // CRUD operations
  editVariation(variation: Variation): void {
    this.isEditing = true;
    this.newVariation = {
      id: variation.id,
      name: variation.name,
      values: variation.values.join(', ')
    };
    this.showAddForm = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  saveVariation(): Promise<void> {
    if (this.isEditing) {
      return this.updateVariation();
    } else {
      return this.addVariation();
    }
  }

  async addVariation(): Promise<void> {
    if (!this.newVariation.name.trim() || !this.newVariation.values.trim()) {
      this.errorMessage = 'Please enter both name and values';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.variationsService.addVariation({
        name: this.newVariation.name.trim(),
        values: this.newVariation.values.split(',').map(v => v.trim())
      });
      this.successMessage = 'Variation added successfully!';
      this.resetForm();
      this.showAddForm = false;
      setTimeout(() => this.loadVariations(), 500);
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Failed to add variation';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async updateVariation(): Promise<void> {
    if (!this.newVariation.name.trim() || !this.newVariation.values.trim()) {
      this.errorMessage = 'Please enter both name and values';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    
    try {
      await this.variationsService.updateVariation(this.newVariation.id, {
        name: this.newVariation.name.trim(),
        values: this.newVariation.values.split(',').map(v => v.trim())
      });
      this.successMessage = 'Variation updated successfully!';
      this.resetForm();
      this.showAddForm = false;
      setTimeout(() => this.loadVariations(), 500);
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Failed to update variation';
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  async deleteVariation(id: string): Promise<void> {
    if (!confirm('Are you sure you want to delete this variation?')) return;

    this.isLoading = true;
    try {
      await this.variationsService.deleteVariation(id);
      this.successMessage = 'Variation deleted successfully!';
      setTimeout(() => this.loadVariations(), 500);
    } catch (error) {
      console.error('Error:', error);
      this.errorMessage = 'Failed to delete variation';
      this.isLoading = false;
    }
  }

  dismissAlert(): void {
    this.errorMessage = null;
    this.successMessage = null;
  }
}