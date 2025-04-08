import { Component, OnInit } from '@angular/core';
import { SourceService } from '../../services/source.service';

@Component({
  selector: 'app-sources',
  templateUrl: './sources.component.html',
  styleUrls: ['./sources.component.scss']
})
export class SourcesComponent implements OnInit {

  // To toggle form visibility
  showForm = false;

  // Model for the source data
  source = {
    name: '',
    description: ''
  };

  // List of sources fetched from Firestore
  sources: any[] = [];

  constructor(private sourceService: SourceService) {}

  ngOnInit(): void {
    this.loadSources(); // Load sources when the component is initialized
  }

  // Toggle the form visibility
  toggleForm(): void {
    this.showForm = !this.showForm;
  }

  // Load all sources from Firestore
  loadSources(): void {
    this.sourceService.getSources().then(data => {
      this.sources = data; // Store the fetched data in the sources array
    }).catch(error => {
      console.error("Error fetching sources: ", error);
    });
  }

  // Save the new source to Firestore
  onSave(): void {
    if (this.source.name && this.source.description) {
      this.sourceService.addSource(this.source).then(() => {
        console.log('Source added!');
        this.loadSources();  // Reload the sources after adding a new one
        this.resetForm();  // Reset the form after saving
        this.toggleForm();  // Close the form
      }).catch((error) => {
        console.error('Error adding source: ', error);
      });
    } else {
      alert('Please fill in all fields!');
    }
  }

  // Reset the form after saving data
  resetForm(): void {
    this.source.name = '';
    this.source.description = '';
  }
}
