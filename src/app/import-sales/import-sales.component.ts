import { Component } from '@angular/core';
import * as ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-import-sales',
  templateUrl: './import-sales.component.html',
  styleUrls: ['./import-sales.component.scss']
})
export class ImportSalesComponent {
  selectedFile: File | null = null;
  manualData: any = {
    invoiceNo: '',
    customerName: '',
    phone: '',
    email: '',
    saleDate: '',
    products: [this.createEmptyProduct()]
  };
  
  importableFields = [
    'Invoice No.',
    'Customer name',
    'Customer Phone number',
    'Customer Email',
    'Sale Date',
    'Product Name',
    'Product SKU',
    'Quantity',
    'Product Unit',
    'Unit Price',
    'Item Tax',
    'Item Discount',
    'Item Description',
    'Order Total'
  ];

  validationRules = [
    'Either customer email id or phone number required',
    'Either customer email id or phone number required',
    'Sale date time format should be "Y-m-d H:i:s" (2020-07-15 17:45:32)',
    'Either product name (for single and combo only) or product sku required',
    'Either product name (for single and combo only) or product sku required',
    'Required'
  ];

  showManualEntry = false;
  submittedData: any = null;
imports: any;

  createEmptyProduct() {
    return {
      productName: '',
      sku: '',
      quantity: '',
      unit: 'pcs',
      unitPrice: '',
      tax: '',
      discount: '',
      description: '',
      total: ''
    };
  }

  addProduct() {
    this.manualData.products.push(this.createEmptyProduct());
  }

  removeProduct(index: number) {
    if (this.manualData.products.length > 1) {
      this.manualData.products.splice(index, 1);
    }
  }

  onFileSelect(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    }
  }

  onSubmit() {
    if (this.showManualEntry) {
      // Validate manual data
      if (!this.manualData.invoiceNo || !this.manualData.customerName || 
          (!this.manualData.phone && !this.manualData.email)) {
        alert('Please fill all required fields');
        return;
      }
      
      this.submittedData = {...this.manualData};
      alert('Manual data submitted successfully!');
    } else {
      // File upload logic
      if (!this.selectedFile) {
        alert('Please select a file before submitting.');
        return;
      }
      alert(`File "${this.selectedFile.name}" uploaded successfully.`);
    }
  }

  downloadTemplate() {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sales Import Template');

    // Define columns for customer/sales data
    worksheet.columns = [
      { header: 'Invoice No.', key: 'invoice_no', width: 20 },
      { header: 'Customer Name', key: 'customer_name', width: 25 },
      { header: 'Customer Phone number', key: 'phone', width: 20 },
      { header: 'Customer Email', key: 'email', width: 25 },
      { header: 'Sale Date (Y-m-d H:i:s)', key: 'sale_date', width: 25 },
      { header: 'Product Name', key: 'product_name', width: 25 },
      { header: 'Product SKU', key: 'sku', width: 20 },
      { header: 'Quantity', key: 'quantity', width: 15 },
      { header: 'Product Unit', key: 'unit', width: 15 },
      { header: 'Unit Price', key: 'unit_price', width: 15 },
      { header: 'Item Tax', key: 'tax', width: 15 },
      { header: 'Item Discount', key: 'discount', width: 15 },
      { header: 'Item Description', key: 'description', width: 30 },
      { header: 'Order Total', key: 'total', width: 15 }
    ];

    // Add sample data
    worksheet.addRow([
      'INV-001', 
      'John Doe', 
      '5551234567', 
      'john@example.com', 
      '2025-01-15 14:30:45',
      'Premium Widget',
      'WID-001',
      2,
      'pcs',
      49.99,
      4.99,
      5.00,
      'Premium quality widget',
      99.98
    ]);

    // Save workbook as a file
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      saveAs(blob, 'SalesImportTemplate.xlsx');
    });
  }

  toggleEntryMode() {
    this.showManualEntry = !this.showManualEntry;
    if (!this.showManualEntry) {
      this.submittedData = null;
    }
  }
}