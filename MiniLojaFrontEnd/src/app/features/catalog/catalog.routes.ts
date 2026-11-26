import { Routes } from '@angular/router';

/** Montadas em /catalogo e /produtos (ver app.routes.ts). */
export const CATALOG_ROUTES: Routes = [
  { path: '', title: 'Catálogo · MiniLoja', loadComponent: () => import('./pages/catalog.page').then((m) => m.CatalogPage) },
];

export const PRODUCT_ROUTES: Routes = [
  { path: ':id', title: 'Produto · MiniLoja', loadComponent: () => import('./pages/product-detail.page').then((m) => m.ProductDetailPage) },
];
