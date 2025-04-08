import { Component, OnInit } from '@angular/core';
import { TaxService } from '../services/tax.service';

@Component({
  selector: 'app-tax',
  templateUrl: './tax.component.html',
  styleUrls: ['./tax.component.scss'],
})
export class TaxComponent implements OnInit {
  showTaxRateForm = false;
  showTaxGroupForm = false;

  taxRate = {
    name: '',
    percentage: 0,
    forTaxGroupOnly: false,
  };

  taxGroup = {
    name: '',
    subTaxes: [],
  };

  taxRates: any[] = [];

  constructor(private taxService: TaxService) {}

  ngOnInit() {
    this.getTaxRates();
  }

  toggleTaxRateForm() {
    this.showTaxRateForm = !this.showTaxRateForm;
  }

  toggleTaxGroupForm() {
    this.showTaxGroupForm = !this.showTaxGroupForm;
  }

  addTaxRate() {
    this.taxService.addTaxRate(this.taxRate).then(() => {
      this.taxRate = { name: '', percentage: 0, forTaxGroupOnly: false };
      this.toggleTaxRateForm();
      this.getTaxRates();
    });
  }

  addTaxGroup() {
    this.taxService.addTaxGroup(this.taxGroup).then(() => {
      this.taxGroup = { name: '', subTaxes: [] };
      this.toggleTaxGroupForm();
    });
  }

  getTaxRates() {
    this.taxService.getTaxRates().subscribe((data) => {
      this.taxRates = data.map((e: any) => {
        return {
          id: e.payload.doc.id,
          ...e.payload.doc.data(),
        };
      });
  });
}
}
