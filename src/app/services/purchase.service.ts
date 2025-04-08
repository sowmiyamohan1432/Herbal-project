import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, doc, deleteDoc, getDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

interface Purchase {
  id?: string;
  supplierId: string;
  supplierName: string;
  address: string;
  referenceNo: string;
  purchaseDate: string | Date;
  purchaseStatus: string;
  businessLocation: string;
  payTerm: string;
  document: string | null;
  discountType: string;
  discountAmount: number;
  purchaseTax: number;
  additionalNotes: string;
  shippingCharges: number;
  purchaseTotal: number;
  paymentAmount: number;
  paidOn: string | Date;
  paymentMethod: string;
  paymentNote: string;
  paymentDue: number;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PurchaseService {
  private purchasesCollection;

  constructor(private firestore: Firestore) {
    this.purchasesCollection = collection(this.firestore, 'purchases');
  }

  // Add Purchase
  addPurchase(purchase: Purchase) {
    // Convert dates to Firestore Timestamp
    const purchaseData = {
      ...purchase,
      purchaseDate: new Date(purchase.purchaseDate),
      paidOn: new Date(purchase.paidOn),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return addDoc(this.purchasesCollection, purchaseData);
  }

  // Real-time updates: Get all purchases
  getPurchases(): Observable<Purchase[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.purchasesCollection, (snapshot) => {
        const purchases = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as Purchase
        }));
        observer.next(purchases);
      });
      return () => unsubscribe();
    });
  }

  // Delete a purchase by ID
  async deletePurchase(id: string): Promise<void> {
    const purchaseDoc = doc(this.firestore, `purchases/${id}`);
    return deleteDoc(purchaseDoc);
  }

  // Get purchase by ID
  async getPurchaseById(id: string): Promise<Purchase> {
    const purchaseRef = doc(this.firestore, 'purchases', id);
    const purchaseSnap = await getDoc(purchaseRef);
    
    if (purchaseSnap.exists()) {
      return { id: purchaseSnap.id, ...purchaseSnap.data() } as Purchase;
    } else {
      throw new Error('Purchase not found');
    }
  }
  
}