import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SupplierService {

  constructor(private firestore: Firestore) { }

  // Add a new supplier
  addSupplier(supplier: any): Promise<any> {
    const suppliersRef = collection(this.firestore, 'suppliers');
    return addDoc(suppliersRef, supplier);
  }

  // Get all suppliers with real-time updates using onSnapshot()
  getSuppliers(): Observable<any[]> {
    const suppliersRef = collection(this.firestore, 'suppliers');
    return new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(suppliersRef, (snapshot) => {
        const suppliersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(suppliersList);  // Emit the updated list of suppliers
      });

      // Cleanup subscription on unsubscription
      return () => unsubscribe();
    });
  }

  // Update an existing supplier
  updateSupplier(id: string, supplier: any): Promise<void> {
    const supplierRef = doc(this.firestore, 'suppliers', id);
    return updateDoc(supplierRef, supplier);
  }

  // Delete a supplier
  deleteSupplier(id: string): Promise<void> {
    const supplierRef = doc(this.firestore, 'suppliers', id);
    return deleteDoc(supplierRef);
  }
}
