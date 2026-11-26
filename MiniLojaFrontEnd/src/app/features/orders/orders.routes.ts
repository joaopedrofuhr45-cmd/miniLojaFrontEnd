import { Routes } from '@angular/router';

export const ORDERS_ROUTES: Routes = [
  { path: '', title: 'Meus pedidos · MiniLoja', loadComponent: () => import('./pages/orders/orders.component').then((m) => m.OrdersComponent) },
];
