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
      // [routes:shop]
      { path: '**', component: NotFoundPage },
    ],
  },
];
