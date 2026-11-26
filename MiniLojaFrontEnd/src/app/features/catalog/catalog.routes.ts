import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  { path: '', title: 'Catálogo · MiniLoja', loadComponent: () => import('./pages/catalog/catalog.component').then((m) => m.CatalogComponent) },
];
