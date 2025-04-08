import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import { FollowUp } from '../models/follow-up.model';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FollowUpService {
  private followUpsSubject = new BehaviorSubject<FollowUp[]>([]);
  followUps$ = this.followUpsSubject.asObservable();
  
  private unsubscribe: (() => void) | undefined;
  
  constructor(private firestore: Firestore) {
    // Start listening for changes when the service is created
    this.getFollowUpsRealtime();
  }

  // Add a new follow-up
  addFollowUp(followUp: FollowUp) {
    const followUpsRef = collection(this.firestore, 'followUps');
    // Add timestamp
    const followUpWithTimestamp = {
      ...followUp,
      createdAt: new Date().toISOString()
    };
    return addDoc(followUpsRef, followUpWithTimestamp);
  }

  // Get all follow-ups with real-time updates
  getFollowUpsRealtime() {
    const followUpsRef = collection(this.firestore, 'followUps');
    
    // Unsubscribe from previous listener if it exists
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    
    // Set up real-time listener
    this.unsubscribe = onSnapshot(followUpsRef, (snapshot) => {
      const followUps: FollowUp[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        followUps.push({
          id: doc.id,
          title: data['title'],
          status: data['status'],
          description: data['description'],
          customerLead: data['customerLead'],
          endDatetime: data['endDatetime'],
          followUpType: data['followUpType'],
          followupCategory: data['followupCategory'],
          assignedTo: data['assignedTo'],
          createdAt: data['createdAt']
        });
      });
      
      this.followUpsSubject.next(followUps);
    }, (error) => {
      console.error('Error getting real-time updates:', error);
    });
  }
  
  // For backward compatibility, return the observable
  getFollowUps(): Observable<FollowUp[]> {
    return this.followUps$;
  }

  // Delete a follow-up
  deleteFollowUp(id: string) {
    const followUpDoc = doc(this.firestore, `followUps/${id}`);
    return deleteDoc(followUpDoc);
  }

  // Update a follow-up
  updateFollowUp(id: string, data: Partial<FollowUp>) {
    const followUpDoc = doc(this.firestore, `followUps/${id}`);
    return updateDoc(followUpDoc, data);
  }
  
  // Cleanup method to unsubscribe when no longer needed
  cleanup() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}