import { Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: ':id', title: 'Produto · MiniLoja', loadComponent: () => import('./pages/product-detail/product-detail.component').then((m) => m.ProductDetailComponent) },
];
