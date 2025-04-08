import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  CollectionReference,
  DocumentData,
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TaxService {
  constructor(private firestore: Firestore) {}

  addTaxRate(rate: any) {
    const collRef = collection(this.firestore, 'taxRates');
    return addDoc(collRef, rate);
  }

  getTaxRates(): Observable<any[]> {
    return new Observable((observer) => {
      const collRef: CollectionReference<DocumentData> = collection(this.firestore, 'taxRates');
      const unsubscribe = onSnapshot(collRef, (snapshot) => {
        const taxRates = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        observer.next(taxRates);
      });

      // Clean up listener on unsubscribe
      return () => unsubscribe();
    });
  }

  addTaxGroup(group: any) {
    const collRef = collection(this.firestore, 'taxGroups');
    return addDoc(collRef, group);
  }
}
