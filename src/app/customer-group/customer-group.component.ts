import { Component, OnInit } from '@angular/core';
import { CustomerGroupService } from '../services/customer-group.service';

@Component({
  selector: 'app-customer-group',
  templateUrl: './customer-group.component.html',
  styleUrls: ['./customer-group.component.scss']
})
export class CustomerGroupComponent implements OnInit {
  showForm: boolean = false;
  customerGroupName: string = '';
  priceCalculationType: string = 'percentage';
  calculationPercentage: number | null = null;
  sellingPriceGroup: string = '';
  customerGroups: any[] = [];
  currentEditId: string | null = null;

  priceCalculationTypes = ['percentage', 'sellingPrice'];

  constructor(private customerGroupService: CustomerGroupService) {}

  ngOnInit() {
    this.loadCustomerGroups();
  }

  loadCustomerGroups() {
    this.customerGroupService.getCustomerGroups().subscribe((data) => {
      this.customerGroups = data;
    });
  }

  toggleForm(): void {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
  }

  resetForm(): void {
    this.customerGroupName = '';
    this.priceCalculationType = 'percentage';
    this.calculationPercentage = null;
    this.sellingPriceGroup = '';
    this.currentEditId = null;
    this.showForm = false;
  }

  onSubmit(): void {
    const newCustomerGroup = {
      customerGroupName: this.customerGroupName,
      priceCalculationType: this.priceCalculationType,
      calculationPercentage: this.calculationPercentage,
      sellingPriceGroup: this.sellingPriceGroup
    };

    if (this.currentEditId) {
      this.customerGroupService.updateCustomerGroup(this.currentEditId, newCustomerGroup).then(() => {
        this.loadCustomerGroups();
        this.resetForm();
      }).catch((error) => {
        console.error("Error updating customer group: ", error);
      });
    } else {
      this.customerGroupService.addCustomerGroup(newCustomerGroup).then(() => {
        this.loadCustomerGroups();
        this.resetForm();
      }).catch((error) => {
        console.error("Error adding customer group: ", error);
      });
    }
  }

  editCustomerGroup(group: any): void {
    this.customerGroupName = group.customerGroupName;
    this.priceCalculationType = group.priceCalculationType;
    this.calculationPercentage = group.calculationPercentage;
    this.sellingPriceGroup = group.sellingPriceGroup;
    this.currentEditId = group.id;
    this.showForm = true;
  }

  deleteCustomerGroup(id: string): void {
    if (confirm('Are you sure you want to delete this customer group?')) {
      this.customerGroupService.deleteCustomerGroup(id).then(() => {
        this.loadCustomerGroups();
      }).catch((error) => {
        console.error("Error deleting customer group: ", error);
      });
    }
  }

  onCalculationTypeChange(type: string): void {
    this.priceCalculationType = type;
  }
}
