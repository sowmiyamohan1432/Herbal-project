// sidebar.component.ts
import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent {
  @Input() isOpen = true;
  
  menuItems = [
      
    {
      name: 'Home',
      icon: 'home',
      isExpanded: false,
      subItems: []
    },
    {
      name: 'User Management',
      icon: 'people',
      isExpanded: false,
      subItems: [
        { name: 'Users', route: '/users' },
        { name: 'Roles', route: '/roles-table' },
      ]
    },
    {
      name: 'Contacts',
      icon: 'contacts',
      isExpanded: false,
      subItems: [
        { name: 'Suppliers', route: '/suppliers' },
        { name: 'Customers', route: '/customers' },
        { name: 'Customer Groups', route: '/customer-group' },
        {name:'Import Contacts',route:'/import-contacts'}
 
      ]
    },
    {
      name: 'Products',
      icon: 'inventory_2',
      isExpanded: false,
      subItems: [
        { name: 'List Products', route: '/list-products' },
        { name: 'Add Product', route: '/add-product' },
        { name: 'Update Price', route: '/update-price' },
        { name: 'Variations', route: '/variations' },
        { name: 'Import Products', route: '/import-products' },
        { name: 'Import Opening Stock', route: '/import-opening' },
        { name: 'Selling Price Group', route: '/selling-price' },
        { name: 'Units', route: '/units' },
        { name: 'Categories', route: '/categories' },
        { name: 'Brands', route: '/brands' },
        { name: 'Warranties', route: '/warranties' }
      ]
    },
    {
      name: 'Purchases',
      icon: 'shopping_cart',
      isExpanded: false,
      subItems: [
        { name: 'Purchase Requisition', route: '/purchase-requisition' },
        { name: 'Purchase Order', route: '/purchase-order' },
        { name: 'List Purchases', route: '/list-purchase' },
        { name: 'Add Purchase', route: '/add-purchase' },
        { name: 'List Purchase Return', route: '/purchase-return' }
      ]
    },
    {
      name: 'Sell',
      icon: 'point_of_sale',
      isExpanded: false,
      subItems: [
        { name: 'Sales Order', route: '/sales-order' },
        { name: 'All sales', route: '/sales' },
        { name: 'Add Sale', route: '/add-sale' },
        { name: 'Add Draft', route: '/add-draft' },
        { name: 'List Drafts', route: '/list-draft' },
        { name: 'Add Quotation', route: '/add-quotation' },
        { name: 'List Quotation', route: '/list-quotations' },

        { name: 'List Sell Return', route: '/sell-return' },
        { name: 'Shipments', route: '/shipments' },
        { name: 'Discounts', route: '/discount' },
        { name: 'Import Sales', route: '/import-sales' }
      ]
    },
    {
      name: 'Stock Transfers',
      icon: 'swap_horiz',
      isExpanded: false,
      subItems: [
        { name: 'List Stock Transfers', route: '/list-stock' },
        { name: 'Add Stock Transfer', route: '/add-stock' }


      ]
    },
    {
      name: 'Stock Adjustment',
      icon: 'adjust',
      isExpanded: false,
      subItems: [
        { name: 'List Stock Adjustments', route: '/list-adjustment' },
        { name: 'Add Stock Adjustment', route: '/add-adjustment' }


      ]
    },
    {
      name: 'Expenses',
      icon: 'receipt',
      isExpanded: false,
      subItems: [
        { name: 'List Expenses', route: '/list-expenses' },
        { name: 'Add Expense', route: '/add-expense' },
        { name: 'Expense Categories', route: '/expense-categories' },

      ]
    },
    {
      name: 'Payment Accounts',
      icon: 'account_balance',
      isExpanded: false,
      subItems: [
        { name: 'List Accounts', route: '/list-accounts' },
        { name: 'Balance Sheet', route: '/balance-sheet' },
        { name: 'Trial Balance', route: '/trial-balance' },
        { name: 'Cash Flow', route: '/cash-flow' },
        { name: 'Payment Account Report', route: '/payment-report' },


      ]
    },
    {
      name: 'Reports',
      icon: 'assessment',
      isExpanded: false,
      subItems: []
    },
    {
      name: 'Notification Templates',
      icon: 'notifications',
      isExpanded: false,
      subItems: []
    },
    {
      name: 'Settings',
      icon: 'settings',
      isExpanded: false,
      subItems: [
        { name: 'Business Settings', route: '/business-settings' },
        { name: 'Business Locations', route: '/business-locations' },
        { name: 'Invoice Settings', route: '/invoice-settings' },
        { name: 'Barcode Settings', route: '/barcodes' },
        { name: 'Receipt Printers', route: '/printers' },
        { name: 'Tax Rates', route: '/tax' },
        { name: 'Modifiers', route: '/modifier' },
        { name: 'Types of Service', route: '/type-of-service' },
        { name: 'Package Subscription ', route: '/package-subscription' },

      ]
    },
    {
      name: 'CRM',
      icon: 'people',
      isExpanded: false,
      route: '/crm'  // Direct route property
    }
  ];
  
  constructor(private router: Router) {}

  handleMenuItemClick(item: any): void {
    if (item.subItems?.length) {
      // If it has subitems, toggle expansion
      item.isExpanded = !item.isExpanded;
    } else if (item.route) {
      // If it has a direct route, navigate
      this.router.navigate([item.route]);
    }
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }

  isActive(route?: string): boolean {
    if (!route) return false;
    return this.router.url === route;
  }

  hasActiveChild(item: any): boolean {
    if (!item.subItems) return false;
    return item.subItems.some((subItem: any) => this.isActive(subItem.route));
  }
}