import { Routes } from '@angular/router';

export const CART_ROUTES: Routes = [
  { path: '', title: 'Carrinho · MiniLoja', loadComponent: () => import('./pages/cart.page').then((m) => m.CartPage) },
];
