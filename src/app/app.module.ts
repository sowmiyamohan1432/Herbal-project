import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { WarrantiesComponent } from './warranties/warranties.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

// ✅ Import RouterModule to fix "router-outlet" issue
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // ✅ Import FormsModule
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';  // Import this



// ✅ Import Firebase modules correctly
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { environment } from '../environments/environment';
import { BrandsComponent } from './brands/brands.component';
import { CategoriesComponent } from './categories/categories.component';
import { UnitsComponent } from './units/units.component';
import { SellingPriceComponent } from './selling-price/selling-price.component';
import { VariationsComponent } from './variations/variations.component';
import { AddProductComponent } from './add-product/add-product.component';
import { ListProductsComponent } from './list-products/list-products.component';
import { UpdatePriceComponent } from './update-price/update-price.component';
import { ImportProductsComponent } from './import-products/import-products.component';
import { ImportOpeningComponent } from './import-opening/import-opening.component';
import { PurchaseOrderComponent } from './purchase-order/purchase-order.component';
import { AddPurchaseComponent } from './add-purchase/add-purchase.component';
import { PurchaseRequisitionComponent } from './purchase-requisition/purchase-requisition.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { AddPurchaseRequisitionComponent } from './add-purchase-requisition/add-purchase-requisition.component';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { LayoutComponent } from './layout/layout.component';
import { PrintLabelsComponent } from './print-labels/print-labels.component';
import { ListPurchaseComponent } from './list-purchase/list-purchase.component';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
import { MatTableModule } from '@angular/material/table';
import { SalesOrderComponent } from './sales-order/sales-order.component';
import { AddSaleComponent } from './add-sale/add-sale.component';
import { AddDraftComponent } from './add-draft/add-draft.component';
import { ListDraftComponent } from './list-draft/list-draft.component';
import { AddQuotationComponent } from './add-quotation/add-quotation.component';
import { ListQuotationsComponent } from './list-quotations/list-quotations.component';
import { SellReturnComponent } from './sell-return/sell-return.component';
import { ImportSalesComponent } from './import-sales/import-sales.component';
import { DiscountComponent } from './discount/discount.component';
import { AddPurchaseOrderComponent } from './add-purchase-order/add-purchase-order.component';
import { ShipmentsComponent } from './shipments/shipments.component';
import { SuppliersComponent } from './suppliers/suppliers.component';
import { CustomersComponent } from './customers/customers.component';
import { ListAdjustmentComponent } from './list-adjustment/list-adjustment.component';
import { AddAdjustmentComponent } from './add-adjustment/add-adjustment.component';
import { AddStockComponent } from './add-stock/add-stock.component';
import { ListStockComponent } from './list-stock/list-stock.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
import { ListExpensesComponent } from './list-expenses/list-expenses.component';
import { ExpenseCategoriesComponent } from './expense-categories/expense-categories.component';
import { SalesComponent } from './sales/sales.component';
import { CustomerGroupComponent } from './customer-group/customer-group.component';
import { ImportContactsComponent } from './import-contacts/import-contacts.component';
import { EditStockComponent } from './edit-stock/edit-stock.component';
import { EditAdjustmentComponent } from './edit-adjustment/edit-adjustment.component';
import { SalesOrderDetailComponent } from './sales-order-detail/sales-order-detail.component';
import { ViewPurchaseRequisitionComponent } from './view-purchase-requisition/view-purchase-requisition.component';
import { PurchaseOrderViewComponent } from './purchase-order-view/purchase-order-view.component';
import { ViewPurchaseComponent } from './purchase/view-purchase/view-purchase.component';
import { UsersComponent } from './users/users.component';
import { AddUsersComponent } from './add-users/add-users.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { RolesTableComponent } from './roles-table/roles-table.component';
import { RolesComponent } from './roles/roles.component';
import { SalesAgentsComponent } from './sales-agents/sales-agents.component';
import { ViewExpenseComponent } from './view-expense/view-expense.component';
import { ListAccountsComponent } from './list-accounts/list-accounts.component';
import { TrialBalanceComponent } from './trial-balance/trial-balance.component';
import { CashFlowComponent } from './cash-flow/cash-flow.component';
import { PaymentReportComponent } from './payment-report/payment-report.component';
import { BalanceSheetComponent } from './balance-sheet/balance-sheet.component';
import { BusinessLocationsComponent } from './business-locations/business-locations.component';
import { InvoiceSettingsComponent } from './invoice-settings/invoice-settings.component';
import { BarcodesComponent } from './barcodes/barcodes.component';
import { PrintersComponent } from './printers/printers.component';
import { TaxComponent } from './tax/tax.component';
import { ModifierComponent } from './modifier/modifier.component';
import { TypeOfServiceComponent } from './type-of-service/type-of-service.component';
import { PackageSubscriptionComponent } from './package-subscription/package-subscription.component';
import { BusinessSettingsComponent } from './business-settings/business-settings.component';
import { AddBarcodesComponent } from './add-barcodes/add-barcodes.component';
import { AddPrintersComponent } from './add-printers/add-printers.component';
import { ShipmentDetailsComponent } from './shipment-details/shipment-details.component';
import { CrmComponent } from './crm/crm.component';
import { LeadsComponent } from './crm/leads/leads.component';
import { FollowsUpComponent } from './crm/follows-up/follows-up.component';
import { SourcesComponent } from './crm/sources/sources.component';
import { LifeStageComponent } from './crm/life-stage/life-stage.component';
import { FollowupCategoryComponent } from './crm/followup-category/followup-category.component';

@NgModule({
  declarations: [
    AppComponent,
    WarrantiesComponent,
    BrandsComponent,
    CategoriesComponent,
    UnitsComponent,
    SellingPriceComponent,
    VariationsComponent,
    AddProductComponent,
    ListProductsComponent,
    UpdatePriceComponent,
    ImportProductsComponent,
    ImportOpeningComponent,
    PurchaseOrderComponent,
    AddPurchaseComponent,
    PurchaseRequisitionComponent,
    AddPurchaseRequisitionComponent,
    HeaderComponent,
    SidebarComponent,
    LayoutComponent,
    PrintLabelsComponent,
    ListPurchaseComponent,
    PurchaseReturnComponent,
    SalesOrderComponent,
    AddSaleComponent,
    AddDraftComponent,
    ListDraftComponent,
    AddQuotationComponent,
    ListQuotationsComponent,
    SellReturnComponent,
    ImportSalesComponent,
    DiscountComponent,
    AddPurchaseOrderComponent,
    ShipmentsComponent,
    SuppliersComponent,
    CustomersComponent,
  
    ListAdjustmentComponent,
    AddAdjustmentComponent,
    AddStockComponent,
    ListStockComponent,
    AddExpenseComponent,
    ListExpensesComponent,
    ExpenseCategoriesComponent,
    SalesComponent,
    CustomerGroupComponent,
    ImportContactsComponent,
    EditStockComponent,
    EditAdjustmentComponent,
    SalesOrderDetailComponent,
    ViewPurchaseRequisitionComponent,
    PurchaseOrderViewComponent,
    ViewPurchaseComponent,
    UsersComponent,
    AddUsersComponent,
    EditUserComponent,
    RolesTableComponent,
    RolesComponent,
    SalesAgentsComponent,
    ViewExpenseComponent,
    ListAccountsComponent,
    TrialBalanceComponent,
    CashFlowComponent,
    PaymentReportComponent,
    BalanceSheetComponent,
    BusinessLocationsComponent,
    InvoiceSettingsComponent,
    BarcodesComponent,
    PrintersComponent,
    TaxComponent,
    ModifierComponent,
    TypeOfServiceComponent,
    PackageSubscriptionComponent,
    BusinessSettingsComponent,
    AddBarcodesComponent,
    AddPrintersComponent,
    ShipmentDetailsComponent,
    CrmComponent,
    LeadsComponent,
    FollowsUpComponent,
    SourcesComponent,
    LifeStageComponent,
    FollowupCategoryComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    
    NgxDatatableModule,
    MatTableModule,
    MatDialogModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatNativeDateModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    RouterModule ,
    MatAutocompleteModule,

    CommonModule,// ✅ Fix router-outlet issue
  ],
  providers: [
    provideClientHydration(),
    DatePipe,

    // ✅ Corrected Firebase Initialization
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideFirestore(() => getFirestore()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
