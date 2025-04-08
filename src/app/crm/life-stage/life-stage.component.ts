// src/app/components/life-stage/life-stage.component.ts
import { Component, OnInit } from '@angular/core';
import { LifeStageService } from '../../services/life-stage.service';

@Component({
  selector: 'app-life-stage',
  templateUrl: './life-stage.component.html',
  styleUrls: ['./life-stage.component.scss']
})
export class LifeStageComponent implements OnInit {

  // To toggle form visibility
  showForm = false;

  // Form model for life stage data
  lifeStage = {
    name: '',
    description: ''
  };

  // List of life stages fetched from Firestore
  lifeStages: any[] = [];

  constructor(private lifeStageService: LifeStageService) {}

  ngOnInit(): void {
    this.loadLifeStages(); // Load life stages when component is initialized
  }

  // Toggle the form visibility
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  // Fetch all life stages from Firestore
  loadLifeStages(): void {
    this.lifeStageService.getLifeStages().then(data => {
      this.lifeStages = data; // Store the fetched data in the lifeStages array
    }).catch(error => {
      console.error("Error fetching life stages: ", error);
    });
  }

  // Save the new life stage to Firestore
  onSave(): void {
    if (this.lifeStage.name && this.lifeStage.description) {
      this.lifeStageService.addLifeStage(this.lifeStage).then(() => {
        console.log('Life stage added!');
        this.loadLifeStages();  // Reload the life stages after adding a new one
        this.resetForm();  // Reset the form after saving
        this.toggleForm();  // Close the form
      }).catch((error) => {
        console.error('Error adding life stage: ', error);
      });
    } else {
      alert('Please fill in all fields!');
    }
  }

  // Reset form after saving data
  resetForm(): void {
    this.lifeStage.name = '';
    this.lifeStage.description = '';
  }
}
