import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommissionService } from '../services/commission.service';

@Component({
  selector: 'app-sales-agents',
  templateUrl: './sales-agents.component.html',
  styleUrls: ['./sales-agents.component.scss'],
})
export class SalesAgentsComponent implements OnInit, OnDestroy {
  salesAgents: any[] = [];
  showModal: boolean = false;
  agentForm!: FormGroup;
  isEditMode: boolean = false;
  currentAgentId: string | null = null;

  // Pagination
  currentPage: number = 1;
  entriesPerPage: number = 25;
  totalEntries: number = 0;

  // Search
  searchTerm: string = '';

  private unsubscribe: () => void = () => {};

  constructor(private fb: FormBuilder, private commissionService: CommissionService) {}

  ngOnInit(): void {
    this.agentForm = this.fb.group({
      prefix: ['Mr'],
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      contactNumber: ['', Validators.required],
      address: [''],
      commissionPercentage: ['', [Validators.required, Validators.min(0)]],
    });

    // Set up real-time listener
    this.unsubscribe = this.commissionService.listenToSalesAgents((agents) => {
      this.salesAgents = agents;
      this.totalEntries = agents.length;
    });
  }

  ngOnDestroy(): void {
    // Clean up the listener when the component is destroyed
    this.unsubscribe();
  }

  openModal(isEdit: boolean = false, agent: any = null) {
    console.log('openModal called', isEdit, agent); // Debug log
    this.isEditMode = isEdit;
    this.showModal = true; // This is crucial

    if (isEdit && agent) {
      this.currentAgentId = agent.id;
      this.agentForm.patchValue(agent);
    } else {
      this.agentForm.reset();
      this.currentAgentId = null;
    }
  }

  // Close the modal and reset the form
  closeModal() {
    this.showModal = false;
    this.agentForm.reset({ prefix: 'Mr' });
    this.isEditMode = false;
    this.currentAgentId = null;
  }

  // Save agent (add new or update existing)
  async saveAgent() {
    if (this.agentForm.valid) {
      if (this.isEditMode && this.currentAgentId) {
        // Update the existing agent
        await this.commissionService.updateSalesAgent(this.currentAgentId, this.agentForm.value);
      } else {
        // Add a new agent
        await this.commissionService.addSalesAgent(this.agentForm.value);
      }
      this.closeModal();
    }
  }

  // Delete an agent
  async deleteAgent(id: string) {
    if (confirm('Are you sure you want to delete this agent?')) {
      await this.commissionService.deleteSalesAgent(id);
    }
  }

  // Handle entries per page change
  changeEntriesPerPage(event: any) {
    this.entriesPerPage = parseInt(event.target.value);
  }

  // Export functions
  exportCSV() {
    this.commissionService.exportAgentsCSV(this.salesAgents);
  }

  exportExcel() {
    this.commissionService.exportAgentsExcel(this.salesAgents);
  }

  exportPDF() {
    this.commissionService.exportAgentsCSV(this.salesAgents);
  }

  // Print function
  printTable() {
    window.print();
  }

  // Search function
  onSearch(event: any) {
    this.searchTerm = event.target.value;
    // Implement search logic here or use a pipe in the template
  }

  // Toggle column visibility
  toggleColumnVisibility() {
    // Implement column visibility toggle logic
  }
    // Example of a math function you might need
    calculatePower(base: number, exponent: number): number {
      return Math.pow(base, exponent);
    }
  

  // Get data for current page
  get paginatedAgents() {
    const start = (this.currentPage - 1) * this.entriesPerPage;
    const end = start + this.entriesPerPage;

    return this.salesAgents.slice(start, end);
  }

  // Pagination controls
  nextPage() {
    if (this.currentPage * this.entriesPerPage < this.totalEntries) {
      this.currentPage++;
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  // Get full name
  getFullName(agent: any): string {
    return `${agent.prefix || ''} ${agent.firstName || ''} ${agent.lastName || ''}`.trim();
  }


}
