import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, doc, deleteDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { getDoc } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root' // ✅ This makes the service injectable
})
export class PurchaseOrderService {
  private orderCollection;

  constructor(private firestore: Firestore) {
    this.orderCollection = collection(this.firestore, 'purchase-orders');
  }

  addOrder(order: any) {
    order.createdAt = new Date();
    return addDoc(this.orderCollection, order);
  }

  getOrders(): Observable<any[]> {
    return new Observable(observer => {
      const unsubscribe = onSnapshot(this.orderCollection, (snapshot) => {
        const orders = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(orders);
      });
      return () => unsubscribe();
    });
  }
  
  async deleteOrder(id: string): Promise<void> {
    try {
      const orderDoc = doc(this.firestore, `purchase-orders/${id}`);
      await deleteDoc(orderDoc);
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error; // Re-throw the error to handle it in the component
    }
  }
  async getOrderById(id: string): Promise<any> {
    const orderDoc = doc(this.firestore, `purchase-orders/${id}`);
    const orderSnapshot = await getDoc(orderDoc);
    if (orderSnapshot.exists()) {
      return { id: orderSnapshot.id, ...orderSnapshot.data() };
    } else {
      throw new Error('Order not found');
    }
  }
}
