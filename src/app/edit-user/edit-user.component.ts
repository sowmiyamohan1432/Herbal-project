import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {
  editUserForm!: FormGroup;
  userId!: string;
  user: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // Retrieve the user ID from the route parameters
    this.userId = this.route.snapshot.paramMap.get('id')!;
    // Fetch the user's current details
    this.userService.getUserById(this.userId).subscribe(user => {
      this.user = user;
      // Initialize the form with the user's current details
      this.editUserForm = this.fb.group({
        firstName: [this.user.firstName, Validators.required],
        lastName: [this.user.lastName],
        email: [this.user.email, [Validators.required, Validators.email]],
        // Add other form controls as necessary
      });
    });
  }

  // Handle form submission
  onSubmit(): void {
    if (this.editUserForm.valid) {
      const updatedData = this.editUserForm.value;
      this.userService.updateUser(this.userId, updatedData)
        .then(() => {
          console.log('User updated successfully');
          // Navigate back to the users list
          this.router.navigate(['/users']);
        })
        .catch(error => {
          console.error('Error updating user: ', error);
        });
    }
  }
}
