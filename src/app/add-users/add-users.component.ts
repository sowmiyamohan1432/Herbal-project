import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';
import { LocationService } from '../services/location.service';
import { RolesService } from '../services/roles.service'; // Add this import

@Component({
  selector: 'app-add-users',
  templateUrl: './add-users.component.html',
  styleUrls: ['./add-users.component.scss']
})
export class AddUsersComponent implements OnInit {
  addUserForm!: FormGroup;
  users: any[] = [];
  businessLocations: any[] = [];
  selectedLocations: string[] = [];
  roles: any[] = []; // Add this property to store roles

  constructor(
    private fb: FormBuilder, 
    private userService: UserService,
    private locationService: LocationService,
    private rolesService: RolesService // Inject RolesService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.fetchUsers();
    this.fetchBusinessLocations();  // This will now subscribe to the observable
    this.fetchRoles(); // Add this method call
  }

  // Add this method to fetch roles from RolesService
  fetchRoles(): void {
    this.rolesService.getRoles().subscribe((roles: any[]) => {
      this.roles = roles;
      console.log('Available Roles:', this.roles);
    });
  }

  initializeForm(): void {
    this.addUserForm = this.fb.group({
      // Basic Info
      prefix: ['Mr'],
      firstName: ['', Validators.required],
      lastName: [''],
      email: ['', [Validators.required, Validators.email]],
      isActive: [false],
      enableServicePin: [false],

      // Login
      allowLogin: [false],
      role: [''], // Changed default from 'Admin' to empty to use dynamic roles
      allLocations: [true],
      username: [''],
      password: [''],
      confirmPassword: [''],

      // Rest of the form fields remain unchanged
      salesCommission: [''],
      maxDiscount: [''],
      allowSelectedContacts: [false],
      selectedContact: [''],

      // More Information
      dob: [''],
      gender: [''],
      maritalStatus: [''],
      bloodGroup: [''],
      mobileNumber: [''],
      alternateContactNumber: [''],
      familyContactNumber: [''],
      facebookLink: [''],
      twitterLink: [''],
      socialMedia1: [''],
      socialMedia2: [''],
      customField1: [''],
      customField2: [''],
      customField3: [''],
      customField4: [''],
      guardianName: [''],
      idProofName: [''],
      idProofNumber: [''],
      permanentAddress: [''],
      currentAddress: [''],

      // Bank Details
      accountHolderName: [''],
      accountNumber: [''],
      bankName: [''],
      bankIdentifierCode: [''],
      branch: [''],
      taxPayerId: ['']
    });
  }

  fetchUsers(): void {
    this.userService.getUsers().subscribe((users: any[]) => {
      this.users = users;
      console.log('Real-time Users:', this.users);
    });
  }

  // Updated to use the observable returned by getLocations()
  fetchBusinessLocations(): void {
    this.locationService.getLocations((locations: any[]) => {
      this.businessLocations = locations;
      console.log('Business Locations:', this.businessLocations);
    }).subscribe(
      (locations) => {
        console.log('Updated Locations:', locations);
        this.businessLocations = locations;  // Update locations in component state
      },
      (error) => {
        console.error('Error fetching locations:', error);  // Error handling
      }
    );
  }

  onAllLocationsChange(): void {
    const allLocationsControl = this.addUserForm.get('allLocations');
    if (allLocationsControl?.value) {
      this.selectedLocations = [];
    }
  }

  isLocationSelected(locationId: string): boolean {
    return this.selectedLocations.includes(locationId);
  }

  onLocationSelect(locationId: string, event: any): void {
    if (event.target.checked) {
      if (!this.selectedLocations.includes(locationId)) {
        this.selectedLocations.push(locationId);
      }
    } else {
      this.selectedLocations = this.selectedLocations.filter(id => id !== locationId);
    }
  }

  onSubmit(): void {
    if (this.addUserForm.invalid) {
      return;
    }

    const formData = {
      ...this.addUserForm.value,
      selectedLocations: this.selectedLocations
    };

    this.userService.addUser(formData)
      .then((docRef) => {
        console.log("User added with ID: ", docRef.id);
        this.addUserForm.reset();
        this.selectedLocations = [];
      })
      .catch((error) => {
        console.error("Error adding user: ", error);
      });
  }

  deleteUser(userId: string): void {
    this.userService.deleteUser(userId)
      .then(() => {
        console.log('User deleted successfully');
      })
      .catch((error) => {
        console.error('Error deleting user: ', error);
      });
  }
}
