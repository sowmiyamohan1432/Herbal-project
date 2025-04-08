// view-purchase-requisition.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseRequisitionService } from '../services/purchase-requisition.service';

@Component({
  selector: 'app-view-purchase-requisition',
  templateUrl: './view-purchase-requisition.component.html',
  styleUrls: ['./view-purchase-requisition.component.scss']
})
export class ViewPurchaseRequisitionComponent implements OnInit {
  requisition: any;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private requisitionService: PurchaseRequisitionService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.requisitionService.getRequisitionById(id).subscribe(data => {
        this.requisition = data;
        this.isLoading = false;
      });
    }
  }
  // view-purchase-requisition.component.ts
goBack() {
  window.history.back();
}

printRequisition() {
  window.print();
}
}