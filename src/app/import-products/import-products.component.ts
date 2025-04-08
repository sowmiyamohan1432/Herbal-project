// import-products.component.ts
import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-import-products',
  templateUrl: './import-products.component.html',
  styleUrls: ['./import-products.component.scss'],
})
export class ImportProductsComponent {
  selectedFile: File | null = null;

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0] as File;
  }

  downloadTemplate() {
    // Create template data with headers
    const templateData = [
      {
        'Product Name (Required)': '',
        'Brand (Optional)': '',
        'Unit (Required)': '',
        'Category (Optional)': ''
      },
      {
        'Product Name (Required)': 'Example Product',
        'Brand (Optional)': 'Example Brand',
        'Unit (Required)': 'pcs',
        'Category (Optional)': 'Example Category'
      }
    ];

    // Create worksheet
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(templateData, { skipHeader: false });
    
    // Create workbook
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'ProductsTemplate');
    
    // Generate Excel file
    const excelBuffer: any = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data: Blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    // Save file
    saveAs(data, 'Products_Import_Template.xlsx');
  }

  importProducts() {
    if (!this.selectedFile) {
      alert('Please select a file first');
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (e) => {
      const arrayBuffer: any = fileReader.result;
      const data = new Uint8Array(arrayBuffer);
      const arr = [];
      
      for (let i = 0; i !== data.length; ++i) {
        arr[i] = String.fromCharCode(data[i]);
      }
      
      const bstr = arr.join('');
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      
      // Convert to JSON
      const importedData = XLSX.utils.sheet_to_json(worksheet);
      console.log('Imported data:', importedData);
      
      // Here you would typically send the data to your backend
      alert('File imported successfully!');
    };
    fileReader.readAsArrayBuffer(this.selectedFile);
  }
}
