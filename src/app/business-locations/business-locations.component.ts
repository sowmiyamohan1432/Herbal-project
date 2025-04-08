import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LocationService } from '../services/location.service';

@Component({
  selector: 'app-business-locations',
  templateUrl: './business-locations.component.html',
  styleUrls: ['./business-locations.component.scss']
})
export class BusinessLocationsComponent {
resetForm() {
throw new Error('Method not implemented.');
}
  showPopup = false;
  locationForm!: FormGroup;
  locations: any[] = [];

  constructor(private fb: FormBuilder, private locationService: LocationService) {
    this.createForm();
    this.loadLocations();
  }

  createForm() {
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      locationId: [''],
      landmark: [''],
      city: ['', Validators.required],
      zipCode: ['', Validators.required],
      state: ['', Validators.required],
      country: ['', Validators.required],
      mobile: [''],
      alternateContact: [''],
      email: [''],
      website: [''],
      invoiceSchemePOS: ['Default', Validators.required],
      invoiceSchemeSale: ['Default', Validators.required],
      invoiceLayoutPOS: ['Default', Validators.required],
      invoiceLayoutSale: ['Default', Validators.required],
      sellingPriceGroup: ['Default'],
      customField1: [''],
      customField2: [''],
      customField3: [''],
      customField4: [''],
      paymentOptions: this.fb.group({
        cash: ['None'],
        card: ['None'],
        cheque: ['None'],
        bankTransfer: ['None'],
        other: ['None']
      })
    });
  }

  loadLocations() {
    this.locationService.getLocations((data) => {
      this.locations = data;
    });
  }

  openPopup() {
    this.showPopup = true;
  }

  closePopup() {
    this.showPopup = false;
    this.locationForm.reset();
  }

  saveLocation() {
    if (this.locationForm.valid) {
      this.locationService.addLocation(this.locationForm.value).then(() => {
        this.closePopup();
        this.loadLocations();
      });
    } else {
      alert('Please fill required fields');
    }
  }

  editLocation(location: any) {
    this.locationForm.patchValue({
      ...location,
      paymentOptions: location.paymentOptions || {
        cash: 'None',
        card: 'None',
        cheque: 'None',
        bankTransfer: 'None',
        other: 'None'
      }
    });
    this.openPopup();
  }
  openSettings(location: any) {
    console.log('Settings clicked for:', location);
    // You can implement settings logic here later
  }
  
  deactivateLocation(location: any) {
    console.log('Deactivate clicked for:', location);
    // You can implement deactivation logic here later
  }
  
}