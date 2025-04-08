import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PurchaseOrderService } from '../services/purchase-order.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-purchase-order-view',
  templateUrl: './purchase-order-view.component.html',
  styleUrls: ['./purchase-order-view.component.scss']
})
export class PurchaseOrderViewComponent implements OnInit {
  order: any;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private orderService: PurchaseOrderService,
    private router: Router,  // Add this line

  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadOrder(id);
    } else {
      this.error = 'No order ID provided';
      this.isLoading = false;
    }
  }

  async loadOrder(id: string): Promise<void> {
    try {
      this.order = await this.orderService.getOrderById(id);
      this.isLoading = false;
    } catch (err) {
      this.error = 'Failed to load order';
      this.isLoading = false;
      console.error(err);
    }
  }
  goBackToList(): void {
    this.router.navigate(['/purchase-order']);
  }
}