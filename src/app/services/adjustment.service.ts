import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject, Observable, of } from 'rxjs'; // Import 'of' here
import { doc, getDoc } from '@angular/fire/firestore';
import {  setDoc } from '@angular/fire/firestore'; // Import setDoc
import { deleteDoc } from '@angular/fire/firestore'; // Add this import



interface StockAdjustment {
  id?: string;
  businessLocation: string;
  referenceNo?: string;
  date: string;
  adjustmentType: string;
  totalAmount: number;
  totalAmountRecovered?: number;
  reason?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdjustmentService {
  private adjustmentsCollection;
  private stockAdjustments = new BehaviorSubject<StockAdjustment[]>([]);

  constructor(private firestore: Firestore) {
    this.adjustmentsCollection = collection(this.firestore, 'adjustments');
    this.listenToAdjustments(); // Start listening to Firestore changes
  }

  // Add a new stock adjustment
  async addStockAdjustment(adjustment: StockAdjustment): Promise<void> {
    try {
      await addDoc(this.adjustmentsCollection, adjustment);
      console.log('Stock Adjustment Added Successfully!');
    } catch (error) {
      console.error('Error adding adjustment:', error);
    }
  }

  // Listen to Firestore updates in real-time using onSnapshot
  private listenToAdjustments(): void {
    onSnapshot(this.adjustmentsCollection, (snapshot) => {
      const adjustments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as StockAdjustment[];
      
      this.stockAdjustments.next(adjustments); // Update observable data
    });
  }

  // Get real-time updates as an observable
  getStockAdjustments() {
    return this.stockAdjustments.asObservable();
  }

  // Get a stock adjustment by its ID
  getStockAdjustmentById(id: string): Observable<StockAdjustment | undefined> {
    // Access the value from the BehaviorSubject and then use find
    const adjustment = this.stockAdjustments.getValue().find((adj: StockAdjustment) => adj.id === id);
    return of(adjustment); // Return the result as an observable
  }

  updateStockAdjustment(adjustment: StockAdjustment): Promise<void> {
    const adjustmentRef = doc(this.firestore, 'adjustments', adjustment.id || '');
    return setDoc(adjustmentRef, adjustment)  // `setDoc` is used to update the document.
      .then(() => {
        console.log('Stock adjustment updated successfully');
      })
      .catch((error) => {
        console.error('Error updating adjustment:', error);
        throw error;  // Propagate error to the caller
      });
  }
 
  async delete(id: string): Promise<void> {
    try {
      const adjustmentRef = doc(this.firestore, 'adjustments', id);
      await deleteDoc(adjustmentRef);
      console.log('Document successfully deleted!');
    } catch (error) {
      console.error('Error removing document: ', error);
      throw error; // Re-throw the error so component can handle it
    }
  }
}

