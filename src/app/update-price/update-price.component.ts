import { Component } from '@angular/core';
import { ProductsService } from '../services/products.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-update-price',
  templateUrl: './update-price.component.html',
  styleUrls: ['./update-price.component.scss']
})
export class UpdatePriceComponent {
  selectedFile: File | null = null;

  constructor(private productService: ProductsService) {}

  // 🚀 Export Firestore Data to Excel
  async exportToExcel() {
    const products = await this.productService.fetchAllProducts();
    if (products.length === 0) {
      alert("No products found in Firestore!");
      return;
    }

    // Select fields to export - updated to match the actual Product interface
    const exportData = products.map((product) => ({
      Name: product.productName,
      SKU: product.sku,
      SellingPrice: product.defaultSellingPriceExcTax,
      DefaultPurchasePrice: product.defaultPurchasePriceExcTax
    }));

    // Convert to Excel
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(exportData);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Products');

    // Download file
    XLSX.writeFile(wb, 'Product_Prices.xlsx');
  }

  // Handle File Selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // 🚀 Import & Update Prices
  importUpdatedPrices() {
    if (!this.selectedFile) {
      alert("Please select a file first!");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e: any) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

      try {
        let updatedCount = 0;
        for (const product of jsonData) {
          await this.productService.updateProductBySKU(product.SKU, {
            defaultSellingPriceExcTax: Number(product.SellingPrice),
            defaultPurchasePriceExcTax: Number(product.DefaultPurchasePrice)
          });
          updatedCount++;
        }
        
        alert(`${updatedCount} product prices updated successfully!`);
      } catch (error) {
        console.error('Error updating products:', error);
        alert('Error updating product prices. Please check console for details.');
      }
    };

    reader.readAsArrayBuffer(this.selectedFile);
  }
}