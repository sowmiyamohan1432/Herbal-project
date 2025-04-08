import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  onSnapshot,
  query,
  doc,
  updateDoc,
  deleteDoc
} from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TypeOfServiceService {
  private firestore = inject(Firestore);
  private collectionName = 'services';

  constructor() {}

  addService(serviceData: any) {
    const servicesRef = collection(this.firestore, this.collectionName);
    return addDoc(servicesRef, serviceData);
  }

  updateService(id: string, data: any) {
    const docRef = doc(this.firestore, this.collectionName, id);
    return updateDoc(docRef, data);
  }

  deleteService(id: string) {
    const docRef = doc(this.firestore, this.collectionName, id);
    return deleteDoc(docRef);
  }

  getServicesRealtime(): Observable<any[]> {
    return new Observable((observer) => {
      const servicesRef = collection(this.firestore, this.collectionName);
      const q = query(servicesRef);

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const services: any[] = [];
        snapshot.forEach((doc) => {
          services.push({ id: doc.id, ...doc.data() });
        });
        observer.next(services);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }
}
