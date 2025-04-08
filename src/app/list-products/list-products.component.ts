import { Component, OnInit } from '@angular/core';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-list-products',
  templateUrl: './list-products.component.html',
  styleUrls: ['./list-products.component.scss']
})
export class ListProductsComponent implements OnInit {
  products: any[] = [];

  constructor(private productService: ProductsService) {}

  ngOnInit(): void {
    // Subscribe to the real-time updates of products
    this.productService.getProductsRealTime().subscribe((data: any[]) => {
      this.products = data; // This will update the products list in real time
    });
  }
}