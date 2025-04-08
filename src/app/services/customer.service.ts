import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, getDocs, query, where, onSnapshot } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor(private firestore: Firestore) { }

  // Add a new customer
  addCustomer(customer: any) {
    const customersRef = collection(this.firestore, 'customers');
    return addDoc(customersRef, customer);
  }

  // Fetch customers data
  getCustomers(): Observable<any[]> {
    const customersRef = collection(this.firestore, 'customers');
    return new Observable(observer => {
      const unsubscribe = onSnapshot(customersRef, (snapshot) => {
        const customersList: any[] = [];
        snapshot.forEach((doc) => {
          customersList.push({ ...doc.data(), id: doc.id });
        });
        observer.next(customersList);
      });
      return () => unsubscribe();
    });
  }

  // Update customer data
  updateCustomer(id: string, customer: any) {
    const customerRef = doc(this.firestore, 'customers', id);
    return updateDoc(customerRef, customer);
  }

  // Delete a customer
  deleteCustomer(id: string) {
    const customerRef = doc(this.firestore, 'customers', id);
    return deleteDoc(customerRef);
  }
}
