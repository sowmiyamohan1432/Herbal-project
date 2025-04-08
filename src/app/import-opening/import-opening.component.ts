import { Component } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-import-opening',
  templateUrl: './import-opening.component.html',
  styleUrls: ['./import-opening.component.scss'],
})
export class ImportOpeningComponent {
  selectedFile: File | null = null;

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (!this.selectedFile) {
      alert('Please select a file before submitting.');
      return;
    }
    // Implement upload logic here
    alert(`File "${this.selectedFile.name}" uploaded successfully.`);
  }

  downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Opening Stock Template');

    // Define columns
    worksheet.columns = [
      { header: 'SKU (Required)', key: 'sku', width: 20 },
      { header: 'Location (Optional)', key: 'location', width: 20 },
      { header: 'Quantity (Required)', key: 'quantity', width: 15 },
      { header: 'Unit Cost (Before Tax) (Required)', key: 'unit_cost', width: 25 },
      { header: 'Lot Number (Optional)', key: 'lot_number', width: 20 },
      { header: 'Expiry Date (Optional) (mm/dd/yyyy)', key: 'expiry_date', width: 25 },
    ];

    // Add sample data row
    worksheet.addRow(['SKU123', 'Warehouse A', 100, 50.0, 'LOT001', '03/25/2025']);

    // Save workbook as a file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'OpeningStockTemplate.xlsx');
    });
  }
}
