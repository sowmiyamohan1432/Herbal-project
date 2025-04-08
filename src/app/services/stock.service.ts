import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc
} from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StockService {
  private stockCollection;
  private stockListSubject = new BehaviorSubject<any[]>([]);

  constructor(private firestore: Firestore) {
    this.stockCollection = collection(this.firestore, 'stock');
  }

  // Add a new stock item to Firestore
  addStock(stockData: any) {
    return addDoc(this.stockCollection, stockData);
  }

  // Real-time list of all stock entries
  getStockList() {
    const q = query(this.stockCollection, orderBy('date', 'desc'));
    onSnapshot(q, (querySnapshot) => {
      const stockList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.stockListSubject.next(stockList);
    });

    return this.stockListSubject.asObservable();
  }

  getStockById(stockId: string): Observable<any> {
    return new Observable((observer) => {
      const stockDoc = doc(this.firestore, 'stock', stockId);
      
      const unsubscribe = onSnapshot(stockDoc, (docSnap) => {
        if (docSnap.exists()) {
          observer.next({ id: docSnap.id, ...docSnap.data() });
        } else {
          observer.next(null);
        }
      }, (error) => {
        observer.error(error);
      });
      
      // Unsubscribe Firestore listener when observable is unsubscribed
      return () => unsubscribe();
    });
  }

  // Update a stock document
  updateStock(stockId: string, updatedData: any) {
    const stockDoc = doc(this.firestore, 'stock', stockId);
    return updateDoc(stockDoc, updatedData);
  }

  // Delete a stock document - FIXED collection name
  async deleteStock(stockId: string): Promise<void> {
    try {
      const stockDoc = doc(this.firestore, 'stock', stockId);
      await deleteDoc(stockDoc);
    } catch (error) {
      console.error('Error deleting stock:', error);
      throw error; // Re-throw to handle in component
    }
  }
  
}