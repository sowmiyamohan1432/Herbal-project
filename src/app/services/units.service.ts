import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, updateDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnitsService {
  private unitsSubject = new BehaviorSubject<any[]>([]); // Store units in a BehaviorSubject
  units$ = this.unitsSubject.asObservable(); // Observable to subscribe to real-time data

  private unitsCollection;

  constructor(private firestore: Firestore) {
    this.unitsCollection = collection(this.firestore, 'units'); // Firestore collection initialization
    this.fetchUnits(); // Start listening for real-time updates
  }

  // Real-time data fetching using onSnapshot
  private fetchUnits() {
    onSnapshot(this.unitsCollection, (snapshot) => {
      const unitsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.unitsSubject.next(unitsData); // Push the data to the BehaviorSubject
    });
  }

  // Add a new unit
  addUnit(unit: any) {
    return addDoc(this.unitsCollection, unit);
  }

  // Get units as an observable
  getUnits() {
    return this.units$;
  }

  // Update an existing unit
  updateUnit(id: string, unit: any) {
    const unitDoc = doc(this.firestore, `units/${id}`);
    return updateDoc(unitDoc, unit);
  }

  // Delete a unit
  deleteUnit(id: string) {
    const unitDoc = doc(this.firestore, `units/${id}`);
    return deleteDoc(unitDoc);
  }
}
