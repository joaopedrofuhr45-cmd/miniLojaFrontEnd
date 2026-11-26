import { Routes } from '@angular/router';

/** Montada em /checkout dentro do shell enxuto, com authGuard (ver app.routes.ts). */
export const CHECKOUT_ROUTES: Routes = [
  { path: '', title: 'Finalizar compra · MiniLoja', loadComponent: () => import('./pages/checkout.page').then((m) => m.CheckoutPage) },
];
