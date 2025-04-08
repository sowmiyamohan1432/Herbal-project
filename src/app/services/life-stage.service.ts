// src/app/services/life-stage.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LifeStageService {

  // Firestore instance should be injected properly
  private firestore: Firestore = inject(Firestore);

  // Define the collection reference
  private lifeStageCollection = collection(this.firestore, 'lifeStages');

  constructor() {}

  // Add a new life stage to Firestore
  addLifeStage(lifeStage: { name: string; description: string }): Promise<DocumentData> {
    return addDoc(this.lifeStageCollection, lifeStage); // This adds the data
  }

  // Get all life stages from Firestore
  getLifeStages(): Promise<DocumentData[]> {
    return getDocs(this.lifeStageCollection).then(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }
}
