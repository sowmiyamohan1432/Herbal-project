import { Component, OnInit, OnDestroy } from '@angular/core';
import { FollowUpService } from '../../services/follow-up.service';
import { FollowUp } from '../../models/follow-up.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-follows-up',
  templateUrl: './follows-up.component.html',
  styleUrls: ['./follows-up.component.scss']
})
export class FollowsUpComponent implements OnInit, OnDestroy {
  title = 'All Follow ups';
  entriesPerPage = 25;
  currentPage = 1;
  totalEntries = 0;
  showColumnVisibilityOptions = false;
  showAddForm = false;
  isLoading = false;
  public mathRef = Math;
  
  private followUpsSubscription: Subscription | undefined;

  // Form model
  newFollowUp: FollowUp = {
    title: '',
    status: '',
    description: '',
    customerLead: '',
    endDatetime: '',
    followUpType: '',
    followupCategory: '',
    assignedTo: ''
  };

  // Status options
  statusOptions = [
    'Pending',
    'In Progress',
    'Completed',
    'Cancelled'
  ];

  followUpTypeOptions = [
    'Call',
    'Email',
    'Meeting',
    'Task'
  ];

  followupCategoryOptions = [
    'General',
    'Sales',
    'Support',
    'Feedback'
  ];

  // Sample data structure - replace with your actual data
  followUps: FollowUp[] = [];

  // Column visibility options
  columns = [
    { name: 'Action', visible: true },
    { name: 'Contact', visible: true },
    { name: 'Start', visible: true },
    { name: 'End', visible: true },
    { name: 'Status', visible: true },
    { name: 'Follow Up Type', visible: true },
    { name: 'Followup Category', visible: true },
    { name: 'Assigned to', visible: true },
    { name: 'Description', visible: true },
    { name: 'Additional info', visible: true },
    { name: 'Title', visible: true }
  ];

  constructor(private followUpService: FollowUpService) {}

  ngOnInit() {
    this.loadFollowUps();
  }

  ngOnDestroy() {
    // Clean up subscriptions
    if (this.followUpsSubscription) {
      this.followUpsSubscription.unsubscribe();
    }
  }

  loadFollowUps() {
    this.isLoading = true;
    // Subscribe to the real-time updates
    this.followUpsSubscription = this.followUpService.followUps$.subscribe({
      next: (data) => {
        this.followUps = data;
        this.totalEntries = data.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading follow-ups:', err);
        this.isLoading = false;
      }
    });
  }

  // Calculate visible columns count
  get visibleColumnsCount(): number {
    return this.columns.filter(c => c.visible).length;
  }

  toggleColumnVisibility() {
    this.showColumnVisibilityOptions = !this.showColumnVisibilityOptions;
  }

  exportToCSV() {
    // Implement CSV export logic
    console.log('Exporting to CSV');
  }

  exportToExcel() {
    // Implement Excel export logic
    console.log('Exporting to Excel');
  }

  exportToPDF() {
    // Implement PDF export logic
    console.log('Exporting to PDF');
  }

  printTable() {
    // Implement print logic
    console.log('Printing table');
  }

  addNewFollowUp() {
    this.showAddForm = true;
  }

  closeForm() {
    this.showAddForm = false;
    this.resetForm();
  }

  resetForm() {
    this.newFollowUp = {
      title: '',
      status: '',
      description: '',
      customerLead: '',
      endDatetime: '',
      followUpType: '',
      followupCategory: '',
      assignedTo: ''
    };
  }

  onSubmit() {
    this.isLoading = true;
    this.followUpService.addFollowUp(this.newFollowUp)
      .then(() => {
        this.closeForm();
        this.isLoading = false;
        // No need to reload - the onSnapshot will update automatically
      })
      .catch(error => {
        console.error('Error adding follow-up:', error);
        this.isLoading = false;
      });
  }
  
  // Add delete functionality
  deleteFollowUp(id: string) {
    if (confirm('Are you sure you want to delete this follow-up?')) {
      this.isLoading = true;
      this.followUpService.deleteFollowUp(id)
        .then(() => {
          // No need to reload - the onSnapshot will update automatically
          this.isLoading = false;
        })
        .catch(error => {
          console.error('Error deleting follow-up:', error);
          this.isLoading = false;
        });
    }
  }
}