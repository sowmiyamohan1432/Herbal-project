import { Component, OnInit } from '@angular/core';
import { TypeOfServiceService } from '../services/type-of-service.service';

@Component({
  selector: 'app-type-of-service',
  templateUrl: './type-of-service.component.html',
  styleUrls: ['./type-of-service.component.scss']
})
export class TypeOfServiceComponent implements OnInit {
  services: any[] = [];
  service: any = {};
  openForm: boolean = false;
  isEdit: boolean = false;
  searchText: string = '';

  constructor(private typeService: TypeOfServiceService) {}

  ngOnInit(): void {
    this.typeService.getServicesRealtime().subscribe({
      next: (data) => {
        this.services = data;
      },
      error: (err: any) => {
        console.error('Error fetching services:', err);
      }
    });
  }

  saveService() {
    if (this.isEdit) {
      this.typeService.updateService(this.service.id, this.service).then(() => {
        this.closeForm();
      });
    } else {
      this.typeService.addService(this.service).then(() => {
        this.closeForm();
      });
    }
  }

  editService(service: any) {
    this.service = { ...service };
    this.isEdit = true;
    this.openForm = true;
  }

  deleteService(id: string) {
    this.typeService.deleteService(id);
  }

  closeForm() {
    this.openForm = false;
    this.isEdit = false;
    this.service = {};
  }

  filteredServices() {
    return this.services.filter(item =>
      item.name?.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }
}
