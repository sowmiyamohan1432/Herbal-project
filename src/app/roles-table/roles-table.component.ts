import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RolesService } from '../services/roles.service';
import { DocumentData } from 'firebase/firestore';
import { Observable, of } from 'rxjs';  // Import 'of' for default value

@Component({
  selector: 'app-roles-table',
  templateUrl: './roles-table.component.html',
  styleUrls: ['./roles-table.component.scss']
})
export class RolesTableComponent implements OnInit {
  roles: DocumentData[] = [];  // To store roles from Firestore
  roles$: Observable<DocumentData[]> = of([]);  // Initialize with empty array

  constructor(
    private router: Router,
    private rolesService: RolesService  // Inject the RolesService
  ) {}

  ngOnInit(): void {
    // Fetch roles in real-time
    this.roles$ = this.rolesService.getRoles();  // Now it will be assigned with real-time data

    // Subscribe to the roles Observable to update the roles in the component
    this.roles$.subscribe((roles) => {
      this.roles = roles;
    });
  }

  navigateToRoles() {
    this.router.navigate(['/roles']);  // Navigate to the roles form page
  }

  editRole(roleId: string) {
    // Handle the edit logic by navigating to the edit page with roleId
    this.router.navigate(['/roles', roleId]);
  }

  deleteRole(roleId: string) {
    // Call the delete function from the roles service
    this.rolesService.deleteRole(roleId).then(() => {
      console.log('Role deleted successfully!');
    }).catch((error) => {
      console.error('Error deleting role: ', error);
    });
  }
}
