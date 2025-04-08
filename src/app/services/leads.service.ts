import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, deleteDoc, doc, onSnapshot, CollectionReference, DocumentData } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class LeadsService {
  private leadsCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.leadsCollection = collection(this.firestore, 'leads');
  }

  addLead(lead: any): Promise<any> {
    return addDoc(this.leadsCollection, lead);
  }

  deleteLead(id: string): Promise<void> {
    const leadDocRef = doc(this.firestore, 'leads', id);
    return deleteDoc(leadDocRef);
  }

  getLeadsSnapshot(callback: (leads: any[]) => void): void {
    onSnapshot(this.leadsCollection, snapshot => {
      const leads = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(leads);
    });
  }
}
