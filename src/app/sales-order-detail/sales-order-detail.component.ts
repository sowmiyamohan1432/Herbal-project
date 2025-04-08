import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SaleService } from '../services/sale.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sales-order-detail',
  templateUrl: './sales-order-detail.component.html',
  styleUrls: ['./sales-order-detail.component.scss']
})
export class SalesOrderDetailComponent implements OnInit {
  sale$!: Observable<any>;  // Observable to hold the sale data
  saleId!: string;  // Will hold the sale ID from the route

  constructor(
    private saleService: SaleService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Get the sale ID from the route parameters
    this.saleId = this.route.snapshot.paramMap.get('id')!;
    this.loadSaleDetails();
  }

  loadSaleDetails(): void {
    // Fetch the sale data using the sale ID
    this.sale$ = this.saleService.getSaleById(this.saleId);
  }
}