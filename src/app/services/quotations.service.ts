import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, getDoc, query, onSnapshot } from '@angular/fire/firestore';
import { inject } from '@angular/core'; // For dependency injection
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private firestore: Firestore = inject(Firestore);

  // Save Quotation
  saveQuotation(quotation: any): Promise<any> {
    const quotationsRef = collection(this.firestore, 'quotations');
    return addDoc(quotationsRef, quotation);
  }

  // Get Quotation by ID
  getQuotationById(id: string): Observable<any> {
    const quotationDocRef = doc(this.firestore, `quotations/${id}`);
    return new Observable(observer => {
      getDoc(quotationDocRef).then((docSnapshot) => {
        if (docSnapshot.exists()) {
          observer.next(docSnapshot.data());
        } else {
          observer.error('Quotation not found');
        }
        observer.complete();
      }).catch(error => observer.error(error));
    });
  }

  // Get all Quotations with real-time updates
  getAllQuotations(): Observable<any[]> {
    const quotationsRef = collection(this.firestore, 'quotations');
    return new Observable(observer => {
      const unsubscribe = onSnapshot(quotationsRef, snapshot => {
        const quotationsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        observer.next(quotationsList);
      }, error => {
        observer.error(error);
      });

      // Return unsubscribe function to stop real-time updates
      return unsubscribe;
    });
  }

  // Update Quotation
  updateQuotation(id: string, quotation: any): Promise<void> {
    const quotationDocRef = doc(this.firestore, `quotations/${id}`);
    return updateDoc(quotationDocRef, quotation);
  }

  // Delete Quotation
  deleteQuotation(id: string): Promise<void> {
    const quotationDocRef = doc(this.firestore, `quotations/${id}`);
    return deleteDoc(quotationDocRef);
  }
}
