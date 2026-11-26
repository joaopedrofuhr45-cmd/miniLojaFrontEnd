import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/guards';
import { FocusShellComponent } from './core/layout/focus-shell.component';
import { NotFoundPage } from './core/layout/not-found.page';
import { ShopShellComponent } from './core/layout/shop-shell.component';

// Cada branch de feature acrescenta suas rotas nos marcadores abaixo.
// Ordem importa: rotas com shell próprio (foco/admin) vêm antes do shell da loja.
export const routes: Routes = [
  {
    path: 'entrar',
    component: FocusShellComponent,
    data: { note: 'Precisa de ajuda?' },
    canActivate: [guestGuard],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'checkout',
    component: FocusShellComponent,
    data: { note: 'Compra 100% segura', icon: 'lock' },
    canActivate: [authGuard],
    loadChildren: () => import('./features/checkout/checkout.routes').then((m) => m.CHECKOUT_ROUTES),
  },
  // [routes:standalone]
  {
    path: '',
    component: ShopShellComponent,
    children: [
      { path: 'catalogo', loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES) },
      { path: 'produtos', loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.PRODUCT_ROUTES) },
      { path: '', pathMatch: 'full', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'carrinho', loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES) },
      { path: 'pedidos', canActivate: [authGuard], loadChildren: () => import('./features/orders/orders.routes').then((m) => m.ORDERS_ROUTES) },
      // [routes:shop]
      { path: '**', component: NotFoundPage },
    ],
  },
];
