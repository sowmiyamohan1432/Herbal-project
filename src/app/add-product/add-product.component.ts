import { Component, OnInit, OnDestroy } from '@angular/core';
import { ProductsService } from '../services/products.service';
import { CategoriesService } from '../services/categories.service';
import { BrandsService } from '../services/brands.service';
import { UnitsService } from '../services/units.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.scss']
})
export class AddProductComponent implements OnInit, OnDestroy {
  product: any = {
    productName: '',
    sku: '',
    barcodeType: 'Code 128 (C128)',
    unit: '',
    brand: '',
    category: '',
    subCategory: '',
    manageStock: true,
    alertQuantity: null,
    productDescription: '',
    productImage: null,
    productBrochure: null,
    enableProductDescription: false,
    notForSelling: false,
    weight: null,
    preparationTime: null,
    applicableTax: 'None',
    sellingPriceTaxType: 'Exclusive',
    productType: 'Single',
    defaultPurchasePriceExcTax: null,
    defaultPurchasePriceIncTax: null,
    marginPercentage: 25.00,
    defaultSellingPriceExcTax: null
  };

  categories: any[] = [];
  brands: any[] = [];
  units: any[] = [];
  subCategories: any[] = [];
  filteredSubCategories: any[] = [];
  products: any[] = [];
  isGeneratingSku: boolean = false;
  isLoading: boolean = false;
  isEditing: boolean = false;
  private productsSubscription!: Subscription;

  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private brandsService: BrandsService,
    private unitsService: UnitsService
  ) {}

  ngOnInit() {
    this.loadInitialData();
    this.setupProductsListener();
  }

  ngOnDestroy() {
    if (this.productsSubscription) {
      this.productsSubscription.unsubscribe();
    }
  }

  setupProductsListener() {
    this.productsSubscription = this.productsService.getProductsRealTime().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error in products subscription:', error);
        alert('Error loading products. Please refresh the page.');
      }
    });
  }

  async loadInitialData() {
    try {
      this.isLoading = true;
      await Promise.all([
        this.loadCategories(),
        this.loadBrands(),
        this.loadUnits(),
        this.loadSubCategories()
      ]);
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      this.isLoading = false;
    }
  }

  loadCategories() {
    return new Promise<void>((resolve) => {
      this.categoriesService.categories$.subscribe({
        next: (categories) => {
          this.categories = categories;
          resolve();
        },
        error: (error) => {
          console.error('Error loading categories:', error);
          resolve();
        }
      });
    });
  }

  loadBrands() {
    return new Promise<void>((resolve) => {
      this.brandsService.brands$.subscribe({
        next: (brands) => {
          this.brands = brands;
          resolve();
        },
        error: (error) => {
          console.error('Error loading brands:', error);
          resolve();
        }
      });
    });
  }

  loadUnits() {
    return new Promise<void>((resolve) => {
      this.unitsService.units$.subscribe({
        next: (units) => {
          this.units = units;
          resolve();
        },
        error: (error) => {
          console.error('Error loading units:', error);
          resolve();
        }
      });
    });
  }

  loadSubCategories() {
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        this.subCategories = [
          { name: 'Office Chairs', category: 'Furniture' },
          { name: 'Dining Chairs', category: 'Furniture' },
          { name: 'Smartphones', category: 'Electronics' },
          { name: 'Laptops', category: 'Electronics' },
        ];
        resolve();
      }, 500);
    });
  }

  onCategoryChange() {
    this.filterSubCategories();
  }

  filterSubCategories() {
    if (this.product.category) {
      this.filteredSubCategories = this.subCategories.filter(
        subCat => subCat.category === this.product.category
      );
    } else {
      this.filteredSubCategories = [];
    }
    this.product.subCategory = '';
  }

  generateSkuFromProductName(productName: string): string {
    if (!productName || productName.trim().length === 0) return '';
    
    let cleanName = productName.trim().toUpperCase();
    cleanName = cleanName.replace(/[^A-Z0-9]/g, '');
    
    let prefix = cleanName.substring(0, 3);
    while (prefix.length < 3) prefix += 'X';
    
    if (productName.toLowerCase().includes('ipa chair')) {
      return 'C12036';
    }
    
    const timestamp = new Date().getTime().toString().substr(-3);
    const randomNum = Math.floor(100 + Math.random() * 900);
    
    return `${prefix}${timestamp}${randomNum}`.substring(0, 6);
  }

  onProductNameChange() {
    if (this.product.productName && !this.product.sku) {
      this.isGeneratingSku = true;
      setTimeout(() => {
        this.product.sku = this.generateSkuFromProductName(this.product.productName);
        this.isGeneratingSku = false;
      }, 300);
    }
  }

  async addProduct() {
    try {
      this.isLoading = true;
      
      if (!this.product.sku && this.product.productName) {
        this.product.sku = this.generateSkuFromProductName(this.product.productName);
      }

      if (this.isEditing && this.product.id) {
        await this.productsService.updateProduct(this.product.id, this.product);
        alert('Product updated successfully!');
      } else {
        await this.productsService.addProduct(this.product);
        alert('Product added successfully!');
      }

      this.resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(`Error: ${error instanceof Error ? error.message : 'Failed to save product'}`);
    } finally {
      this.isLoading = false;
    }
  }

  editProduct(product: any) {
    this.product = { ...product };
    this.isEditing = true;
    window.scrollTo(0, 0);
  }

  async deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await this.productsService.deleteProduct(productId);
        alert('Product deleted successfully!');
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  }

  resetForm() {
    this.product = {
      productName: '',
      sku: '',
      barcodeType: 'Code 128 (C128)',
      unit: '',
      brand: '',
      category: '',
      subCategory: '',
      manageStock: true,
      alertQuantity: null,
      productDescription: '',
      productImage: null,
      productBrochure: null,
      enableProductDescription: false,
      notForSelling: false,
      weight: null,
      preparationTime: null,
      applicableTax: 'None',
      sellingPriceTaxType: 'Exclusive',
      productType: 'Single',
      defaultPurchasePriceExcTax: null,
      defaultPurchasePriceIncTax: null,
      marginPercentage: 25.00,
      defaultSellingPriceExcTax: null
    };
    this.isEditing = false;
    this.filteredSubCategories = [];
  }

  onFileSelected(event: any, type: 'image' | 'brochure') {
    const file = event.target.files[0];
    if (file) {
      if (type === 'image') {
        this.product.productImage = file;
      } else {
        this.product.productBrochure = file;
      }
    }
  }

  calculateSellingPrice() {
    if (this.product.defaultPurchasePriceExcTax && this.product.marginPercentage) {
      this.product.defaultSellingPriceExcTax = 
        this.product.defaultPurchasePriceExcTax * (1 + (this.product.marginPercentage / 100));
    }
  }
}
