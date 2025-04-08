import { Component, OnInit } from '@angular/core';
import { FollowupCategoryService } from '../../services/followup-category.service';

@Component({
  selector: 'app-followup-category',
  templateUrl: './followup-category.component.html',
  styleUrls: ['./followup-category.component.scss']
})
export class FollowupCategoryComponent implements OnInit {

  // Toggle form visibility
  showForm = false;

  // Model for the followup category data
  followupCategory = {
    name: '',
    description: ''
  };

  // List of categories fetched from Firestore
  followupCategories: any[] = [];

  constructor(private followupCategoryService: FollowupCategoryService) {}

  ngOnInit(): void {
    this.loadCategories();  // Load categories when the component is initialized
  }

  // Toggle form visibility
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  // Load all categories from Firestore
  loadCategories(): void {
    this.followupCategoryService.getFollowupCategories().then(data => {
      this.followupCategories = data;  // Store fetched data in the categories array
    }).catch(error => {
      console.error("Error fetching categories: ", error);
    });
  }

  // Save the new follow-up category to Firestore
  onSave(): void {
    if (this.followupCategory.name && this.followupCategory.description) {
      this.followupCategoryService.addFollowupCategory(this.followupCategory).then(() => {
        console.log('Category added!');
        this.loadCategories();  // Reload categories after adding a new one
        this.resetForm();  // Reset the form after saving
        this.toggleForm();  // Close the form
      }).catch((error) => {
        console.error('Error adding category: ', error);
      });
    } else {
      alert('Please fill in all fields!');
    }
  }

  // Reset the form after saving data
  resetForm(): void {
    this.followupCategory.name = '';
    this.followupCategory.description = '';
  }
}
