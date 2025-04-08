import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot } from '@angular/fire/firestore';
import { Observable, of } from 'rxjs';  // Import Observable and of

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  constructor(private firestore: Firestore) {}

  // Adding location to Firestore
  addLocation(data: any) {
    const coll = collection(this.firestore, 'locations');
    return addDoc(coll, data);
  }

  // Modified getLocations to return an Observable
  getLocations(callback?: (locations: any[]) => void): Observable<any[]> {
    const coll = collection(this.firestore, 'locations');
    
    // Observable to wrap onSnapshot to allow subscription
    const locationsObservable = new Observable<any[]>((observer) => {
      const unsubscribe = onSnapshot(coll, (snapshot) => {
        const locations = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Emit locations to subscribers
        observer.next(locations);
        
        // If callback is passed, also invoke it
        if (callback) {
          callback(locations);
        }
      }, (error) => {
        observer.error(error);  // Handle any errors that might occur during snapshot
      });

      // Cleanup on unsubscription
      return () => unsubscribe();
    });

    return locationsObservable;
  }
}
