import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from '@core/auth/guards/guards';
import { AdminShellComponent } from '@core/layout/admin-shell/admin-shell.component';
import { FocusShellComponent } from '@core/layout/focus-shell/focus-shell.component';
import { NotFoundComponent } from '@core/layout/not-found/not-found.component';
import { ShopShellComponent } from '@core/layout/shop-shell/shop-shell.component';

/**
 * Cada feature tem o seu `*.routes.ts` e é carregada sob demanda (lazy).
 * Três "shells" (moldura da página): FocusShell (login/checkout), AdminShell e ShopShell (loja + 404).
 * Ordem importa: o ShopShell fica por último porque tem o `**` (404).
 */
export const routes: Routes = [
  {
    path: 'entrar',
    component: FocusShellComponent,
    canActivate: [guestGuard],
    data: { note: 'Precisa de ajuda?' },
    loadChildren: () => import('@features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'checkout',
    component: FocusShellComponent,
    canActivate: [authGuard],
    data: { note: 'Compra 100% segura', icon: 'lock' },
    loadChildren: () => import('@features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('@features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  {
    path: '',
    component: ShopShellComponent,
    children: [
      { path: '', pathMatch: 'full', loadChildren: () => import('@features/home/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'catalogo', loadChildren: () => import('@features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES) },
      { path: 'produtos', loadChildren: () => import('@features/product/product.routes').then((m) => m.PRODUCT_ROUTES) },
      { path: 'carrinho', loadChildren: () => import('@features/cart/cart.routes').then((m) => m.CART_ROUTES) },
      { path: 'pedidos', canActivate: [authGuard], loadChildren: () => import('@features/orders/orders.routes').then((m) => m.ORDERS_ROUTES) },
      { path: '**', title: 'Página não encontrada · MiniLoja', component: NotFoundComponent },
    ],
  },
];
