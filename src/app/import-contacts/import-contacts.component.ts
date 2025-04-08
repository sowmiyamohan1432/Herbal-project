import { Component } from '@angular/core';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-import-contacts',
  templateUrl: './import-contacts.component.html',
  styleUrls: ['./import-contacts.component.scss']
})
export class ImportContactsComponent {
  selectedFile: File | null = null;

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  onSubmit(): void {
    if (this.selectedFile) {
      console.log('Uploading:', this.selectedFile);
    }
  }

  downloadTemplate(): void {
    const worksheetData = [
      [
         'Email', 'Mobile',
        'Alternate Contact Number', 'Landline', 'City', 'State', 'Country',
        'Address Line 1', 'Address Line 2', 'Zip Code', 'Date of Birth',
        'Custom Field 1', 'Custom Field 2', 'Custom Field 3', 'Custom Field 4'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contacts');

    XLSX.writeFile(workbook, 'Contacts_Template.xlsx');
  }
}
