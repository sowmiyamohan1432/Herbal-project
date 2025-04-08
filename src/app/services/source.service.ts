import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SourceService {

  private firestore: Firestore = inject(Firestore);

  private sourceCollection = collection(this.firestore, 'sources');

  constructor() {}

  // Add a new source to Firestore
  addSource(source: { name: string; description: string }): Promise<DocumentData> {
    return addDoc(this.sourceCollection, source);
  }

  // Get all sources from Firestore
  getSources(): Promise<DocumentData[]> {
    return getDocs(this.sourceCollection).then(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }
}
