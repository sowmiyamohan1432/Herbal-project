import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: any[] = [];
  entries: number = 25;
  currentPage: number = 1;
  totalEntries: number = 0;
  totalPages: number = 0;
  searchQuery: string = '';
  
  constructor(private router: Router, private userService: UserService) {}
  
  ngOnInit(): void {
    this.loadUsers();
  }
  
  loadUsers(): void {
    this.userService.getUsers().subscribe(users => {
      this.users = users;
      this.totalEntries = users.length;
      this.totalPages = Math.ceil(this.totalEntries / this.entries);
      console.log('Real-time Users:', this.users);
    });
  }
  
  // Navigate to the Add User page
  goToAddUserPage() {
    this.router.navigate(['/add-users']);
  }
  
  // View a user's details
  viewUser(userId: string): void {
    this.router.navigate(['/view-user', userId]);
  }
  
  // Edit a user's data
  editUser(userId: string): void {
    this.router.navigate(['/edit-user', userId]);
  }
  
  // Delete a user
  deleteUser(userId: string): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.deleteUser(userId)
        .then(() => {
          console.log('User deleted successfully');
        })
        .catch((error) => {
          console.error('Error deleting user: ', error);
        });
    }
  }
  
  exportCSV(): void {
    const headers = ['Username', 'Name', 'Role', 'Email'];
    let csvContent = headers.join(',') + '\n';
    
    this.users.forEach(user => {
      const row = [
        user.username,
        user.name,
        user.role,
        user.email
      ];
      csvContent += row.join(',') + '\n';
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'users.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }
  
  exportExcel(): void {
    // In a real application, you would use a library like exceljs or xlsx
    console.log('Export to Excel functionality would be implemented here');
  }
  
  exportPDF(): void {
    // In a real application, you would use a library like jspdf
    console.log('Export to PDF functionality would be implemented here');
  }
  
  print(): void {
    window.print();
  }
  
  setColumnVisibility(): void {
    // This would typically open a modal or dropdown to select which columns to show
    console.log('Column visibility configuration would be implemented here');
  }
  
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }
  
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  
  search(event: any): void {
    this.searchQuery = event.target.value;
    // Implement search functionality here
  }
  
  getPaginatedUsers(): any[] {
    const startIndex = (this.currentPage - 1) * this.entries;
    const endIndex = startIndex + this.entries;
    return this.users.slice(startIndex, endIndex);
  }
}
