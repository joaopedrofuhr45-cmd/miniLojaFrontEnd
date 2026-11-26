import { Routes } from '@angular/router';

/** Montadas em /admin dentro do AdminShell, com adminGuard (ver app.routes.ts). */
export const ADMIN_ROUTES: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'produtos' },
  { path: 'produtos', title: 'Produtos · Admin', loadComponent: () => import('./products/pages/admin-products.page').then((m) => m.AdminProductsPage) },
  { path: 'produtos/novo', title: 'Novo produto · Admin', loadComponent: () => import('./products/pages/admin-product-form.page').then((m) => m.AdminProductFormPage) },
  { path: 'produtos/:id/editar', title: 'Editar produto · Admin', loadComponent: () => import('./products/pages/admin-product-form.page').then((m) => m.AdminProductFormPage) },
  { path: 'pedidos', title: 'Pedidos · Admin', loadComponent: () => import('./orders/pages/admin-orders.page').then((m) => m.AdminOrdersPage) },
];
