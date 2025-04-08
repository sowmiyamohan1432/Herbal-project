// expense.service.ts
import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc,getDoc, onSnapshot, deleteDoc, doc, updateDoc, query, orderBy } from '@angular/fire/firestore';
import { BehaviorSubject } from 'rxjs';

export interface Expense {
  id?: string;
  businessLocation: string;
  expenseCategory: string;
  subCategory: string;
  referenceNo: string;
  date: string;
  expenseFor: string;
  expenseForContact: string;
  document?: string;
  applicableTax: string;
  totalAmount: number;
  expenseNote: string;
  isRefund: boolean;
  isRecurring: boolean;
  recurringInterval: string;
  repetitions?: number;
  paymentAmount: number;
  paidOn: string;
  paymentMethod: string;
  paymentAccount?: string;
  paymentNote?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExpenseService {
  private expensesCollection;
  private expenses = new BehaviorSubject<Expense[]>([]);

  constructor(private firestore: Firestore) {
    this.expensesCollection = collection(this.firestore, 'expenses');
    this.listenToExpenses();
  }

  private listenToExpenses(): void {
    const q = query(this.expensesCollection, orderBy('date', 'desc'));
    
    onSnapshot(q, (snapshot) => {
      const expenses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data() as Expense
      }));
      this.expenses.next(expenses);
    });
  }

  async addExpense(expense: Expense): Promise<void> {
    try {
      await addDoc(this.expensesCollection, expense);
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  getExpenses() {
    return this.expenses.asObservable();
  }

  async deleteExpense(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.firestore, 'expenses', id));
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  async updateExpense(id: string, updatedExpense: Partial<Expense>): Promise<void> {
    try {
      await updateDoc(doc(this.firestore, 'expenses', id), updatedExpense);
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  async getExpenseById(id: string): Promise<Expense | null> {
    const snapshot = await getDoc(doc(this.firestore, 'expenses', id));
    return snapshot.exists() ? { id: snapshot.id, ...snapshot.data() as Expense } : null;
  }

}
