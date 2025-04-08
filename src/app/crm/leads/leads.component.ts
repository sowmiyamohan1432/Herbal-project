import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LeadsService } from '../../services/leads.service';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-leads',
  templateUrl: './leads.component.html',
  styleUrls: ['./leads.component.scss']
})
export class LeadsComponent implements OnInit {

  leadForm!: FormGroup;
  showPopup: boolean = false;
  showIndividualFields: boolean = true;
  showBusinessFields: boolean = false;
  leads: any[] = [];

  constructor(private fb: FormBuilder, private leadsService: LeadsService) {}

  ngOnInit(): void {
    this.initForm();
    this.onPersonTypeChange();
    this.loadLeads();
  }

  initForm() {
    this.leadForm = this.fb.group({
      contact_type: ['Lead', Validators.required],
      contact_person_type: ['individual', Validators.required],
      contact_id: [''],
      prefix: [''],
      first_name: [''],
      middle_name: [''],
      last_name: [''],
      dob: [''],
      business_name: [''],
      mobile: ['', Validators.required],
      alternate_contact: [''],
      landline: [''],
      email: [''],
      source: [''],
      lifestage: [''],
      assigned_to: ['', Validators.required],
      last_follow_up: [''],
      upcoming_follow_up: [''],
      address: [''],
      tax_number: [''],
      custom_field_1: [''],
      custom_field_2: ['']
    });
  }

  onPersonTypeChange() {
    const type = this.leadForm.get('contact_person_type')?.value;
    this.showIndividualFields = type === 'individual';
    this.showBusinessFields = type === 'business';
  }

  openPopup() {
    this.leadForm.reset({ contact_type: 'Lead', contact_person_type: 'individual' });
    this.showPopup = true;
    this.onPersonTypeChange();
  }

  closePopup() {
    this.showPopup = false;
  }

  saveLead() {
    if (this.leadForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const data = {
      ...this.leadForm.value,
      created_at: Timestamp.now()
    };

    this.leadsService.addLead(data)
      .then(() => {
        alert('Lead saved successfully!');
        this.closePopup();
      })
      .catch(err => {
        console.error(err);
        alert('Error saving lead');
      });
  }

  loadLeads() {
    this.leadsService.getLeadsSnapshot((leads) => {
      this.leads = leads;
    });
  }

  deleteLead(id: string) {
    this.leadsService.deleteLead(id)
      .then(() => alert('Lead deleted!'))
      .catch(err => alert('Error deleting lead'));
  }

  editLead(lead: any) {
    this.leadForm.patchValue(lead);
    this.showPopup = true;
    this.onPersonTypeChange();
  }
}
