import { Component, OnInit } from '@angular/core';
import { SellingPriceService } from '../services/selling-price.service';

@Component({
  selector: 'app-selling-price',
  templateUrl: './selling-price.component.html',
  styleUrls: ['./selling-price.component.scss']
})
export class SellingPriceComponent implements OnInit {
  sellingPriceGroups: any[] = [];
  filteredGroups: any[] = [];
  paginatedGroups: any[] = [];
  showForm = false;
  editMode = false;
  currentId: string | null = null;
  entriesPerPage = 3;
  searchTerm = '';
  currentPage = 1;
  totalPages = 1;
  startEntry = 0;
  endEntry = 0;

  sellingPrice = {
    name: '',
    description: ''
  };

  constructor(private sellingPriceService: SellingPriceService) {}

  ngOnInit() {
    // Subscribe to real-time selling price updates
    this.sellingPriceService.sellingPrice$.subscribe((data) => {
      this.sellingPriceGroups = data;
      this.filteredGroups = [...data];
      this.updatePagination();
    });
  }

  // Filter data based on search term
  filterData() {
    if (!this.searchTerm) {
      this.filteredGroups = [...this.sellingPriceGroups];
    } else {
      const term = this.searchTerm.toLowerCase();
      this.filteredGroups = this.sellingPriceGroups.filter(group => 
        group.name.toLowerCase().includes(term) || 
        group.description.toLowerCase().includes(term)
      );
    }
    this.currentPage = 1;
    this.updatePagination();
  }

  // Update pagination when data or page size changes
  updatePagination() {
    this.totalPages = Math.ceil(this.filteredGroups.length / this.entriesPerPage);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages > 0 ? this.totalPages : 1;
    }
    
    const startIndex = (this.currentPage - 1) * this.entriesPerPage;
    const endIndex = startIndex + this.entriesPerPage;
    this.paginatedGroups = this.filteredGroups.slice(startIndex, endIndex);
    
    this.startEntry = this.filteredGroups.length > 0 ? startIndex + 1 : 0;
    this.endEntry = Math.min(endIndex, this.filteredGroups.length);
  }

  // Go to next page
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  // Go to previous page
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  // Open form for adding or editing a selling price group
  openForm(edit = false, priceGroup: any = null) {
    this.showForm = true;
    this.editMode = edit;
    if (edit && priceGroup) {
      this.sellingPrice = { ...priceGroup };
      this.currentId = priceGroup.id;
    } else {
      this.sellingPrice = { name: '', description: '' };
      this.currentId = null;
    }
  }

  // Close the form
  closeForm() {
    this.showForm = false;
  }

  // Save the selling price group (add or update)
  saveSellingPrice() {
    if (this.editMode && this.currentId) {
      this.sellingPriceService.updateSellingPrice(this.currentId, this.sellingPrice).then(() => {
        this.closeForm();
      });
    } else {
      this.sellingPriceService.addSellingPrice(this.sellingPrice).then(() => {
        this.closeForm();
      });
    }
  }

  // Delete a selling price group
  deleteSellingPrice(id: string) {
    if (confirm('Are you sure you want to delete this?')) {
      this.sellingPriceService.deleteSellingPrice(id);
    }
  }

  // Export data as CSV
  exportCSV() {
    // Implement CSV export functionality
    console.log('Exporting as CSV');
  }

  // Export data as Excel
  exportExcel() {
    // Implement Excel export functionality
    console.log('Exporting as Excel');
  }

  // Print data
  printData() {
    // Implement print functionality
    console.log('Printing data');
  }

  // Toggle column visibility
  toggleColumnVisibility() {
    // Implement column visibility functionality
    console.log('Toggling column visibility');
  }

  // Export data as PDF
  exportPDF() {
    // Implement PDF export functionality
    console.log('Exporting as PDF');
  }
}