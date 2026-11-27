import { Routes } from '@angular/router';

export const CHECKOUT_ROUTES: Routes = [
  { path: '', title: 'Finalizar compra · MiniLoja', loadComponent: () => import('./pages/checkout/checkout.component').then((m) => m.CheckoutComponent) },
];
