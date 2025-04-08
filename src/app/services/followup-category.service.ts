import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, getDocs, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FollowupCategoryService {

  private firestore: Firestore = inject(Firestore);

  private followupCategoryCollection = collection(this.firestore, 'followupCategories');

  constructor() { }

  // Add a new Follow-up Category to Firestore
  addFollowupCategory(category: { name: string; description: string }): Promise<DocumentData> {
    return addDoc(this.followupCategoryCollection, category);
  }

  // Get all follow-up categories from Firestore
  getFollowupCategories(): Promise<DocumentData[]> {
    return getDocs(this.followupCategoryCollection).then(snapshot => {
      return snapshot.docs.map(doc => doc.data());
    });
  }
}
