import { Routes } from '@angular/router';

/** Montadas em /admin dentro do AdminShell, com adminGuard (ver app.routes.ts). */
export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'produtos' },
  { path: 'produtos', title: 'Produtos · Admin', loadComponent: () => import('./products/pages/admin-products/admin-products.component').then((m) => m.AdminProductsComponent) },
  { path: 'produtos/novo', title: 'Novo produto · Admin', loadComponent: () => import('./products/pages/admin-product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
  { path: 'produtos/:id/editar', title: 'Editar produto · Admin', loadComponent: () => import('./products/pages/admin-product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
  { path: 'pedidos', title: 'Pedidos · Admin', loadComponent: () => import('./orders/pages/admin-orders/admin-orders.component').then((m) => m.AdminOrdersComponent) },
];
