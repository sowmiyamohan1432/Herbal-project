import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, onSnapshot, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { inject } from '@angular/core';  // Use inject to inject Firestore
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RolesService {
  private firestore: Firestore;

  constructor() {
    // Using inject to correctly inject Firestore
    this.firestore = inject(Firestore);
  }

  // Create or Update a role in Firestore
  saveRole(roleName: string, permissions: any): Promise<any> {
    const roleData = {
      roleName,
      permissions,
      createdAt: new Date()
    };

    // Reference to the roles collection
    const rolesCollection = collection(this.firestore, 'roles');

    // Add a new document with the role data
    return addDoc(rolesCollection, roleData);
  }

  // Get all roles with real-time updates using onSnapshot
  getRoles(): Observable<DocumentData[]> {
    const rolesCollection = collection(this.firestore, 'roles') as CollectionReference<DocumentData>;

    // Create an observable that emits real-time updates
    return new Observable((observer) => {
      const unsubscribe = onSnapshot(rolesCollection, (snapshot) => {
        const roles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(roles);
      });

      // Return the unsubscribe function to clean up the listener
      return () => unsubscribe();
    });
  }

  // Delete a role by its ID
  deleteRole(roleId: string): Promise<void> {
    const roleRef = doc(this.firestore, 'roles', roleId);
    return deleteDoc(roleRef);  // Deletes the document from Firestore
  }
}
