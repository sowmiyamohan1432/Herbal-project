import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PurchaseService } from '../../services/purchase.service';
import { DatePipe } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

interface Purchase {
  id?: string;  // Allow id to be undefined
  referenceNo?: string;
  purchaseDate?: any;
  supplier?: string;
  businessLocation?: string;
  purchaseStatus?: string;
  paymentStatus?: string;
  grandTotal?: number;
  paymentDue?: number;
  items?: any[];
  // Add other properties as needed
}

@Component({
  selector: 'app-view-purchase',
  templateUrl: './view-purchase.component.html',
  styleUrls: ['./view-purchase.component.scss'],
  providers: [DatePipe]
})
export class ViewPurchaseComponent implements OnInit {
  purchase: Purchase | null = null;
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private purchaseService: PurchaseService,
    private datePipe: DatePipe,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadPurchase(id);
    } else {
      this.router.navigate(['/list-purchase']);
    }
  }

  async loadPurchase(id: string): Promise<void> {
    try {
      this.isLoading = true;
      const purchase = await this.purchaseService.getPurchaseById(id);

      let formattedPurchaseDate: string | null = null;
      if (purchase.purchaseDate instanceof Date) {
        // If purchaseDate is already a Date, format it directly
        formattedPurchaseDate = this.datePipe.transform(purchase.purchaseDate, 'mediumDate');
      } else if (purchase.purchaseDate && (purchase.purchaseDate as any).toDate) {
        // If purchaseDate is a Firebase Timestamp (with toDate method), convert it to a Date
        formattedPurchaseDate = this.datePipe.transform((purchase.purchaseDate as any).toDate(), 'mediumDate');
      } else if (typeof purchase.purchaseDate === 'string') {
        // If purchaseDate is a string, convert it to a Date object
        const date = new Date(purchase.purchaseDate);
        if (!isNaN(date.getTime())) {
          formattedPurchaseDate = this.datePipe.transform(date, 'mediumDate');
        }
      }

      this.purchase = {
        ...purchase,
        purchaseDate: formattedPurchaseDate || 'N/A' // Ensure there's a fallback value if it's missing
      };
    } catch (error) {
      console.error('Error loading purchase:', error);
      this.showSnackbar('Failed to load purchase details', 'error');
      this.router.navigate(['/list-purchase']);
    } finally {
      this.isLoading = false;
    }
  }

  private showSnackbar(message: string, type: 'success' | 'error'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: type === 'success' ? ['snackbar-success'] : ['snackbar-error']
    });
  }
}
