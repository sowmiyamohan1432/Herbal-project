import { Injectable } from '@angular/core';
import { 
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  deleteDoc,
  updateDoc,
  Timestamp,
  query,
  orderBy,
  onSnapshot,
  CollectionReference
} from '@angular/fire/firestore';
import { Observable } from 'rxjs';

export interface Variation {
  id: string;
  name: string;
  values: string[];
  createdAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class VariationsService {
  constructor(private firestore: Firestore) {}

  getVariations(): Observable<Variation[]> {
    const variationsRef = collection(this.firestore, 'variations') as CollectionReference;
    const q = query(variationsRef, orderBy('createdAt', 'desc'));
    
    return new Observable<Variation[]>((observer) => {
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const variations: Variation[] = [];
        querySnapshot.forEach((doc) => {
          variations.push({
            id: doc.id,
            name: doc.data()['name'],
            values: doc.data()['values'],
            createdAt: doc.data()['createdAt'].toDate(),
          });
        });
        observer.next(variations);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  async addVariation(variation: Omit<Variation, 'id' | 'createdAt'>): Promise<void> {
    const variationsRef = collection(this.firestore, 'variations');
    await addDoc(variationsRef, {
      name: variation.name,
      values: variation.values,
      createdAt: Timestamp.now()
    });
  }

  async deleteVariation(id: string): Promise<void> {
    const docRef = doc(this.firestore, `variations/${id}`);
    await deleteDoc(docRef);
  }

  // Update variation method
  async updateVariation(id: string, variation: Omit<Variation, 'id' | 'createdAt'>): Promise<void> {
    const variationRef = doc(this.firestore, `variations/${id}`);
    await updateDoc(variationRef, {
      name: variation.name,
      values: variation.values
    });
  }
}
