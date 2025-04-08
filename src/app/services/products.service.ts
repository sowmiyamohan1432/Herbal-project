import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  onSnapshot,
  getDocs 
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Product {
  id?: string;
  productName: string;
  sku: string;
  barcodeType: string;
  unit: string;
  brand: string;
  category: string;
  subCategory: string;
  manageStock: boolean;
  alertQuantity: number | null;
  productDescription: string;
  productImage: any;
  productBrochure: any;
  enableProductDescription: boolean;
  notForSelling: boolean;
  weight: number | null;
  preparationTime: number | null;
  applicableTax: string;
  sellingPriceTaxType: string;
  productType: string;
  defaultPurchasePriceExcTax: number | null;
  defaultPurchasePriceIncTax: number | null;
  marginPercentage: number;
  defaultSellingPriceExcTax: number | null;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private productsCollection;

  constructor(private firestore: Firestore) {
    this.productsCollection = collection(this.firestore, 'products');
  }

  // Add new product
  async addProduct(product: Product): Promise<string> {
    try {
      const productToSave = this.prepareProductData(product);
      const docRef = await addDoc(this.productsCollection, productToSave);
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Get real-time products stream
  getProductsRealTime(): Observable<Product[]> {
    return new Observable(observer => {
      const q = query(this.productsCollection);
      const unsubscribe = onSnapshot(q, 
        (snapshot) => {
          const products = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          observer.next(products as Product[]);
        },
        (error) => {
          console.error('Error fetching products:', error);
          observer.error(error);
        }
      );
      return () => unsubscribe();
    });
  }

  // Update existing product
  async updateProduct(productId: string, updatedData: Partial<Product>): Promise<void> {
    try {
      const productDoc = doc(this.firestore, `products/${productId}`);
      await updateDoc(productDoc, {
        ...updatedData,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(productId: string): Promise<void> {
    try {
      const productDoc = doc(this.firestore, `products/${productId}`);
      await deleteDoc(productDoc);
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Update product by SKU
  async updateProductBySKU(sku: string, updatedData: Partial<Product>): Promise<void> {
    try {
      const q = query(this.productsCollection, where("sku", "==", sku));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const productDoc = doc(this.firestore, `products/${querySnapshot.docs[0].id}`);
        await updateDoc(productDoc, {
          ...updatedData,
          updatedAt: new Date()
        });
      }
    } catch (error) {
      console.error('Error updating product by SKU:', error);
      throw error;
    }
  }

  // Prepare product data before saving
  private prepareProductData(product: Product): Product {
    return {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
      productImage: product.productImage?.name || null,
      productBrochure: product.productBrochure?.name || null,
      alertQuantity: Number(product.alertQuantity) || null,
      weight: Number(product.weight) || null,
      preparationTime: Number(product.preparationTime) || null,
      defaultPurchasePriceExcTax: Number(product.defaultPurchasePriceExcTax) || null,
      defaultPurchasePriceIncTax: Number(product.defaultPurchasePriceIncTax) || null,
      marginPercentage: Number(product.marginPercentage) || 25,
      defaultSellingPriceExcTax: Number(product.defaultSellingPriceExcTax) || null
    };
  }
  fetchAllProducts(): Promise<Product[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const querySnapshot = await getDocs(this.productsCollection);
        const products = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        resolve(products as Product[]);
      } catch (error) {
        console.error('Error fetching all products:', error);
        reject(error);
      }
    });
  }
  
}
