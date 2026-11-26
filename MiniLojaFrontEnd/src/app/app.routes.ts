import { Routes } from '@angular/router';
import { NotFoundPage } from './core/layout/not-found.page';
import { ShopShellComponent } from './core/layout/shop-shell.component';

// Cada branch de feature acrescenta suas rotas nos marcadores abaixo.
// Ordem importa: rotas com shell próprio (foco/admin) vêm antes do shell da loja.
export const routes: Routes = [
  // [routes:standalone]
  {
    path: '',
    component: ShopShellComponent,
    children: [
      { path: 'catalogo', loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.CATALOG_ROUTES) },
      { path: 'produtos', loadChildren: () => import('./features/catalog/catalog.routes').then((m) => m.PRODUCT_ROUTES) },
      { path: '', pathMatch: 'full', loadChildren: () => import('./features/home/home.routes').then((m) => m.HOME_ROUTES) },
      { path: 'carrinho', loadChildren: () => import('./features/cart/cart.routes').then((m) => m.CART_ROUTES) },
      // [routes:shop]
      { path: '**', component: NotFoundPage },
    ],
  },
];
