import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, query, onSnapshot, doc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DiscountService {
  private discountCollection;

  constructor(private firestore: Firestore) {
    this.discountCollection = collection(this.firestore, 'discount');
  }

  // Add a new discount to Firestore
  addDiscount(discountData: any) {
    return addDoc(this.discountCollection, discountData);
  }

  // Update an existing discount in Firestore
  updateDiscount(id: string, discountData: any) {
    const discountDocRef = doc(this.firestore, `discount/${id}`);
    return updateDoc(discountDocRef, discountData);
  }

  // Delete a discount from Firestore
  deleteDiscount(id: string) {
    const discountDocRef = doc(this.firestore, `discount/${id}`);
    return deleteDoc(discountDocRef);
  }

  // Get discounts in real-time using onSnapshot
  getDiscountsRealTime(): Observable<any[]> {
    const q = query(this.discountCollection);

    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const discounts: any[] = [];
        snapshot.forEach((doc) => {
          discounts.push({ id: doc.id, ...doc.data() });
        });
        observer.next(discounts); // Emit the latest discounts
      });

      // Cleanup the subscription when it's no longer needed
      return () => unsubscribe();
    }).pipe(
      map((discounts) => discounts) // Data transformation if needed
    );
  }
}
