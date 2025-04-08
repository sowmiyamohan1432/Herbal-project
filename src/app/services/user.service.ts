import { Injectable } from '@angular/core';
import { Firestore, doc, getDoc, updateDoc, deleteDoc, collection, addDoc, onSnapshot } from '@angular/fire/firestore';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private firestore: Firestore;

  constructor() {
    this.firestore = inject(Firestore);
  }

  // Add a new user to Firestore
  async addUser(userData: any): Promise<any> {
    try {
      const userCollection = collection(this.firestore, 'users');
      const docRef = await addDoc(userCollection, userData);
      return docRef;
    } catch (error) {
      console.error('Error adding user: ', error);
      throw error;
    }
  }

  // Get all users (real-time updates using onSnapshot)
  getUsers(): Observable<any[]> {
    const userCollection = collection(this.firestore, 'users');
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userCollection, snapshot => {
        const users = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        observer.next(users);
      });

      // Return the unsubscribe function when the observer unsubscribes
      return () => unsubscribe();
    });
  }

  // Get a user by ID
  getUserById(userId: string): Observable<any> {
    const userDoc = doc(this.firestore, 'users', userId);
    return new Observable(observer => {
      const unsubscribe = onSnapshot(userDoc, snapshot => {
        if (snapshot.exists()) {
          observer.next({
            id: snapshot.id,
            ...snapshot.data()
          });
        } else {
          observer.error('User not found');
        }
      });

      return () => unsubscribe();
    });
  }

  // Update a user's data in Firestore
  async updateUser(userId: string, updatedData: any): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      await updateDoc(userDoc, updatedData);
    } catch (error) {
      console.error('Error updating user: ', error);
      throw error;
    }
  }

  // Delete a user from Firestore
  async deleteUser(userId: string): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', userId);
      await deleteDoc(userDoc);
    } catch (error) {
      console.error('Error deleting user: ', error);
      throw error;
    }
  }
}
