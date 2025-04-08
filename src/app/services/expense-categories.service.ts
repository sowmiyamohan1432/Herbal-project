import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

interface ExpenseCategory {
  id?: string;
  categoryName: string;
  categoryCode?: string;
  isSubCategory: boolean;
  parentCategory?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseCategoriesService {
  private categoriesCollection;
  private expenseCategories = new BehaviorSubject<ExpenseCategory[]>([]);

  constructor(private firestore: Firestore) {
    this.categoriesCollection = collection(this.firestore, 'expense-categories');
    this.listenToExpenseCategories();
  }

  // Add new expense category
  async addCategory(category: ExpenseCategory): Promise<void> {
    try {
      await addDoc(this.categoriesCollection, category);
      console.log('Category Added Successfully!');
    } catch (error) {
      console.error('Error adding category:', error);
    }
  }

  // Listen to Firestore changes in real-time
  private listenToExpenseCategories(): void {
    onSnapshot(this.categoriesCollection, (snapshot) => {
      const categories = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ExpenseCategory[];
      
      this.expenseCategories.next(categories);
    });
  }

  // Get real-time updates as an observable
  getCategories() {
    return this.expenseCategories.asObservable();
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'expense-categories', id));
      console.log('Category Deleted Successfully!');
    } catch (error) {
      console.error('Error deleting category:', error);
    }
  }

  // Update category
  async updateCategory(id: string, updatedCategory: Partial<ExpenseCategory>): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'expense-categories', id), updatedCategory);
      console.log('Category Updated Successfully!');
    } catch (error) {
      console.error('Error updating category:', error);
    }
  }
}
