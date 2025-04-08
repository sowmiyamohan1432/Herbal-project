import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WarrantiesComponent } from './warranties/warranties.component';
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
import { AddPurchaseRequisitionComponent } from './add-purchase-requisition/add-purchase-requisition.component';
import { PrintLabelsComponent } from './print-labels/print-labels.component';
import { ListPurchaseComponent } from './list-purchase/list-purchase.component';
import { PurchaseReturnComponent } from './purchase-return/purchase-return.component';
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
import { ListStockComponent } from './list-stock/list-stock.component';
import { AddStockComponent } from './add-stock/add-stock.component';
import { ListExpensesComponent } from './list-expenses/list-expenses.component';
import { AddExpenseComponent } from './add-expense/add-expense.component';
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
import { BusinessSettingsComponent } from './business-settings/business-settings.component';
import { BusinessLocationsComponent } from './business-locations/business-locations.component';
import { InvoiceSettingsComponent } from './invoice-settings/invoice-settings.component';
import { BarcodesComponent } from './barcodes/barcodes.component';
import { PrintersComponent } from './printers/printers.component';
import { TaxComponent } from './tax/tax.component';
import { ModifierComponent } from './modifier/modifier.component';
import { TypeOfServiceComponent } from './type-of-service/type-of-service.component';
import { PackageSubscriptionComponent } from './package-subscription/package-subscription.component';
import { AddBarcodesComponent } from './add-barcodes/add-barcodes.component';
import { AddPrintersComponent } from './add-printers/add-printers.component';
import { ShipmentDetailsComponent } from './shipment-details/shipment-details.component';
import { CrmComponent } from './crm/crm.component';
import { LeadsComponent } from './crm/leads/leads.component';
import { FollowsUpComponent } from './crm/follows-up/follows-up.component';
import { FollowupCategoryComponent } from './crm/followup-category/followup-category.component';
import { LifeStageComponent } from './crm/life-stage/life-stage.component';
import { SourcesComponent } from './crm/sources/sources.component';


const routes: Routes = [

{path:'warranties',component:WarrantiesComponent},
{path:'brands',component:BrandsComponent},
{path:'categories',component:CategoriesComponent},
{path:'units',component:UnitsComponent},
{path:'selling-price',component:SellingPriceComponent},
{path:'variations',component:VariationsComponent},
{path:'add-product',component:AddProductComponent},
{path:'list-products',component:ListProductsComponent},
{path:'update-price',component:UpdatePriceComponent},
{path:'import-products',component:ImportProductsComponent},
{path:'import-opening',component:ImportOpeningComponent},
{path:'purchase-order',component:PurchaseOrderComponent},
{path:'add-purchase',component:AddPurchaseComponent},
{path:'purchase-requisition',component:PurchaseRequisitionComponent},
{ path: 'add-purchase-requisition', component: AddPurchaseRequisitionComponent},
{path:'print-labels',component:PrintLabelsComponent},
{path:'list-purchase',component:ListPurchaseComponent},
{path:'purchase-return',component:PurchaseReturnComponent},
{path:'sales-order',component:SalesOrderComponent},
{path:'add-sale',component:AddSaleComponent},
{path:'add-draft',component:AddDraftComponent},
{path:'sales-order',component:SalesOrderComponent},
{path:'list-draft',component:ListDraftComponent},
{path:'add-quotation',component:AddQuotationComponent},
{path:'list-quotations',component:ListQuotationsComponent},
{path:'sell-return',component:SellReturnComponent},
{path:'import-sales',component:ImportSalesComponent},
{path:'discount',component:DiscountComponent},
{path:'add-purchase-order',component:AddPurchaseOrderComponent},
{ path:'shipments',component:ShipmentsComponent},
{path:'suppliers',component:SuppliersComponent},
{path:'customers',component:CustomersComponent},
{path:'list-adjustment',component:ListAdjustmentComponent},
{path:'add-adjustment',component:AddAdjustmentComponent},
{path:'list-adjustment',component:ListAdjustmentComponent},
{path:'list-stock',component:ListStockComponent},
{path:'sales-agents',component:SalesAgentsComponent},
{path:'add-stock',component:AddStockComponent},
{path:'list-expenses',component:ListExpensesComponent},
{path:'add-expense',component:AddExpenseComponent},
{path:'expense-categories',component:ExpenseCategoriesComponent},
{path:'sales',component:SalesComponent},
{path:'customer-group',component:CustomerGroupComponent},
{path:'import-contacts',component:ImportContactsComponent},
{path:'edit-stock/:id',component:EditStockComponent},
{ path: 'edit-adjustment/:id', component: EditAdjustmentComponent },
{ path: 'sales/view/:id', component: SalesOrderDetailComponent},
{ path: 'view-purchase-requisition/:id', component: ViewPurchaseRequisitionComponent},
{ path: 'purchase-orders/view/:id', component: PurchaseOrderViewComponent},
{ path: 'view-purchase/:id', component: ViewPurchaseComponent},
{path:'users',component:UsersComponent},
{path:'add-users',component:AddUsersComponent},
{ path: 'edit-user/:id', component: EditUserComponent},
{path:'roles-table',component:RolesTableComponent},
{path:'roles',component:RolesComponent},
{ path: 'view-expense/:id', component: ViewExpenseComponent},
{path:'list-accounts',component:ListAccountsComponent},
{path:'trial-balance',component:TrialBalanceComponent},
{path:'cash-flow',component:CashFlowComponent},
{path:'payment-report',component:PaymentReportComponent},
{path:'balance-sheet',component:BalanceSheetComponent},
{path:'business-settings',component:BusinessSettingsComponent},
{path:'business-locations',component:BusinessLocationsComponent},
{path:'invoice-settings',component:InvoiceSettingsComponent},
{path:'barcodes',component:BarcodesComponent},
{path:'printers',component:PrintersComponent},
{path:'tax',component:TaxComponent},
{path:'modifier',component:ModifierComponent},
{path:'type-of-service',component:TypeOfServiceComponent},
{path:'package-subscription',component:PackageSubscriptionComponent},
{path:'add-barcodes',component:AddBarcodesComponent},
{path:'add-printers',component:AddPrintersComponent},
{path:'shipments/view/:id',component:ShipmentDetailsComponent},
{
  path: 'crm',
  component:CrmComponent,
  children: [
    { path: 'leads', component:LeadsComponent},
    { path: 'follows-up', component:FollowsUpComponent},
    {path:'followup-category',component:FollowupCategoryComponent},
    {path:'life-stage',component:LifeStageComponent},
    {path:'sources',component:SourcesComponent}
  ]
}












];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
