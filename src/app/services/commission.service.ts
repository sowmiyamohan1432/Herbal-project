import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, deleteDoc, updateDoc, onSnapshot } from '@angular/fire/firestore';
import * as XLSX from 'xlsx';  // Import xlsx package

@Injectable({
  providedIn: 'root',
})
export class CommissionService {
  private collectionName = 'salesAgents';

  constructor(private firestore: Firestore) {}

  // Add a new sales agent
  async addSalesAgent(agent: any): Promise<void> {
    const salesAgentsCollection = collection(this.firestore, this.collectionName);
    await addDoc(salesAgentsCollection, agent);
  }

  // Update an existing sales agent
  async updateSalesAgent(id: string, agent: any): Promise<void> {
    const agentDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await updateDoc(agentDocRef, agent);
  }

  // Delete a sales agent by ID
  async deleteSalesAgent(id: string): Promise<void> {
    const agentDocRef = doc(this.firestore, `${this.collectionName}/${id}`);
    await deleteDoc(agentDocRef);
  }

  // Listen for real-time updates
  listenToSalesAgents(callback: (agents: any[]) => void): () => void {
    const salesAgentsCollection = collection(this.firestore, this.collectionName);
    return onSnapshot(salesAgentsCollection, (snapshot) => {
      const agents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(agents);
    });
  }

  // Export sales agents to CSV
  exportAgentsCSV(salesAgents: any[]): void {
    const csvData = this.convertToCSV(salesAgents);
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_agents.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }

  // Export sales agents to Excel
  exportAgentsExcel(salesAgents: any[]): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(salesAgents);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sales Agents');
    XLSX.writeFile(wb, 'sales_agents.xlsx');
  }

  // Helper method to convert data to CSV
  private convertToCSV(data: any[]): string {
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(item => Object.values(item).join(','));
    return [headers, ...rows].join('\n');
  }
}
