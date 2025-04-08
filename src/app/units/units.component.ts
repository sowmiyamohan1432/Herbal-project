import { Component, OnInit } from '@angular/core';
import { UnitsService } from '../services/units.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface Unit {
  id?: string;
  name: string;
  shortName: string;
  allowDecimal: boolean;
  isMultiple: boolean;
  baseUnit?: string;
  multiplier?: number;
}

@Component({
  selector: 'app-units',
  templateUrl: './units.component.html',
  styleUrls: ['./units.component.scss']
})
export class UnitsComponent implements OnInit {
  units: Unit[] = [];
  filteredUnits: Unit[] = [];
  unitForm!: FormGroup;
  showPopup = false;
  isEditing = false;
  editId: string | null = null;
  searchTerm = '';
  currentPage = 1;
  pageSize = 3; // Changed to show 3 items per page
  totalPages = 1;
  sortField = 'name';
  sortDirection = 'asc';
  Math = Math;

  constructor(
    private unitsService: UnitsService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.loadUnits();
    this.initForm();
  }

  initForm() {
    this.unitForm = this.fb.group({
      name: ['', [Validators.required]],
      shortName: ['', [Validators.required]],
      allowDecimal: [false, [Validators.required]],
      isMultiple: [false],
      baseUnit: [''],
      multiplier: [1]
    });

    this.unitForm.get('isMultiple')?.valueChanges.subscribe(isMultiple => {
      const baseUnitControl = this.unitForm.get('baseUnit');
      const multiplierControl = this.unitForm.get('multiplier');
      
      if (isMultiple) {
        baseUnitControl?.setValidators([Validators.required]);
        multiplierControl?.setValidators([Validators.required, Validators.min(0.000001)]);
      } else {
        baseUnitControl?.clearValidators();
        multiplierControl?.clearValidators();
        baseUnitControl?.setValue('');
        multiplierControl?.setValue(1);
      }
      
      baseUnitControl?.updateValueAndValidity();
      multiplierControl?.updateValueAndValidity();
    });
  }

  loadUnits() {
    this.unitsService.getUnits().subscribe(data => {
      this.units = data;
      this.filterAndPaginateUnits();
    });
  }

  filterAndPaginateUnits() {
    // Filter
    this.filteredUnits = this.units.filter(unit => 
      unit.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      unit.shortName.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
    
    // Sort
    this.filteredUnits.sort((a, b) => {
      const aValue = a[this.sortField as keyof Unit] as string;
      const bValue = b[this.sortField as keyof Unit] as string;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return this.sortDirection === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      return 0;
    });
    
    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredUnits.length / this.pageSize);
    
    // Get current page items
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.filteredUnits = this.filteredUnits.slice(startIndex, startIndex + this.pageSize);
  }

  getPageArray(): number[] {
    return Array(this.totalPages).fill(0).map((_, index) => index + 1);
  }

  search(event: Event) {
    this.searchTerm = (event.target as HTMLInputElement).value;
    this.currentPage = 1;
    this.filterAndPaginateUnits();
  }

  changePageSize(event: Event) {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.currentPage = 1;
    this.filterAndPaginateUnits();
  }

  changePage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    this.filterAndPaginateUnits();
  }

  sortBy(field: keyof Unit) {
    if (this.sortField === field) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortField = field;
      this.sortDirection = 'asc';
    }
    this.filterAndPaginateUnits();
  }

  openPopup(editData: Unit | null = null) {
    this.showPopup = true;
    this.initForm();
    
    if (editData && editData.id) {
      this.isEditing = true;
      this.editId = editData.id;
      this.unitForm.patchValue({
        name: editData.name,
        shortName: editData.shortName,
        allowDecimal: editData.allowDecimal,
        isMultiple: editData.isMultiple || false,
        baseUnit: editData.baseUnit || '',
        multiplier: editData.multiplier || 1
      });
    } else {
      this.isEditing = false;
      this.editId = null;
    }
  }

  closePopup() {
    this.showPopup = false;
    this.unitForm.reset({
      allowDecimal: false,
      isMultiple: false,
      multiplier: 1
    });
  }

  saveUnit() {
    if (this.unitForm.invalid) {
      this.markFormGroupTouched(this.unitForm);
      return;
    }

    const unitData: Unit = {
      ...this.unitForm.value
    };

    if (!unitData.isMultiple) {
      unitData.baseUnit = undefined;
      unitData.multiplier = undefined;
    }

    if (this.isEditing && this.editId) {
      this.unitsService.updateUnit(this.editId, unitData).then(() => {
        this.loadUnits();
        this.closePopup();
      }).catch(err => {
        console.error('Error updating unit:', err);
      });
    } else {
      this.unitsService.addUnit(unitData).then(() => {
        this.loadUnits();
        this.closePopup();
      }).catch(err => {
        console.error('Error adding unit:', err);
      });
    }
  }

  deleteUnit(id: string) {
    if (confirm('Are you sure you want to delete this unit?')) {
      this.unitsService.deleteUnit(id).then(() => {
        this.loadUnits();
      }).catch(err => {
        console.error('Error deleting unit:', err);
      });
    }
  }

  markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  hasError(controlName: string, errorName: string) {
    const control = this.unitForm.get(controlName);
    return control?.touched && control?.hasError(errorName);
  }

  exportToCSV() {
    console.log('Export to CSV');
  }

  exportToExcel() {
    console.log('Export to Excel');
  }

  exportToPDF() {
    console.log('Export to PDF');
  }

  print() {
    console.log('Print');
  }

  toggleColumnVisibility() {
    console.log('Toggle column visibility');
  }
}