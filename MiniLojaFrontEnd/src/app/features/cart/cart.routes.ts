import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  { path: '', title: 'Carrinho · MiniLoja', loadComponent: () => import('./pages/cart/cart.component').then((m) => m.CartComponent) },
];
