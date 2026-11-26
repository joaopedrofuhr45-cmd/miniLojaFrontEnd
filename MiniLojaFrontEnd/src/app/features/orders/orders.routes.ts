import { Routes } from '@angular/router';

/** Montada em /pedidos dentro do shell da loja, com authGuard (ver app.routes.ts). */
export const ORDERS_ROUTES: Routes = [
  { path: '', title: 'Meus pedidos · MiniLoja', loadComponent: () => import('./pages/orders.page').then((m) => m.OrdersPage) },
];
