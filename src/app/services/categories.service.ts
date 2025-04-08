import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData, addDoc, deleteDoc, doc, updateDoc, onSnapshot, DocumentData, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {
  private categoriesSubject = new BehaviorSubject<any[]>([]); // Create a BehaviorSubject to store the categories
  categories$ = this.categoriesSubject.asObservable(); // Observable to subscribe to the categories

  constructor(private firestore: Firestore) {
    this.fetchCategories(); // Start listening for real-time updates
  }

  // Fetch categories and listen for real-time updates
  private fetchCategories() {
    const categoriesCollection = collection(this.firestore, 'categories');
    onSnapshot(categoriesCollection, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      this.categoriesSubject.next(categoriesData); // Push the updated data to the BehaviorSubject
    });
  }

  // Add a new category
  addCategory(category: any): Promise<DocumentReference<DocumentData>> {
    const categoriesCollection = collection(this.firestore, 'categories');
    return addDoc(categoriesCollection, category);
  }

  // Delete a category
  deleteCategory(id: string): Promise<void> {
    const categoryDocRef = doc(this.firestore, `categories/${id}`);
    return deleteDoc(categoryDocRef);
  }

  // Update an existing category
  updateCategory(id: string, category: any): Promise<void> {
    const categoryDocRef = doc(this.firestore, `categories/${id}`);
    return updateDoc(categoryDocRef, category);
  }
}
