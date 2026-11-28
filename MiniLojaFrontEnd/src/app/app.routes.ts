import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/auth/guards/guards';
import { AdminShellComponent } from './features/admin/layout/admin-shell/admin-shell.component';
import { FocusShellComponent } from './shared/layout/focus-shell/focus-shell.component';
import { NotFoundPage } from './shared/layout/not-found/not-found.page';
import { ShopShellComponent } from './shared/layout/shop-shell/shop-shell.component';

/**
 * Mapa de todas as URLs do app. Cada página é carregada sob demanda (lazy).
 *
 * Três "shells" (moldura da página):
 *  - FocusShell: topo enxuto, para login e checkout
 *  - AdminShell: menu lateral do painel admin
 *  - ShopShell:  header + footer completos da loja (inclui a página 404)
 *
 * Ordem importa: o ShopShell fica por último porque tem o `**` (404).
 */
export const routes: Routes = [
  // ── Fluxos enxutos ───────────────────────────────────────────────
  {
    path: '',
    component: FocusShellComponent,
    data: { note: 'Precisa de ajuda?' },
    canActivate: [guestGuard], // logado não vê login nem cadastro
    children: [
      { path: 'entrar', title: 'Entrar · MiniLoja', loadComponent: () => import('./features/auth/pages/login/login.page').then((m) => m.LoginPage) },
      { path: 'cadastrar', title: 'Criar conta · MiniLoja', loadComponent: () => import('./features/auth/pages/register/register.page').then((m) => m.RegisterPage) },
    ],
  },
  {
    path: 'checkout',
    component: FocusShellComponent,
    data: { note: 'Compra 100% segura', icon: 'lock' },
    canActivate: [authGuard],
    children: [
      { path: '', title: 'Finalizar compra · MiniLoja', loadComponent: () => import('./features/checkout/pages/checkout/checkout.page').then((m) => m.CheckoutPage) },
    ],
  },

  // ── Painel admin (rotas internas em features/admin/admin.routes.ts) ──
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [adminGuard],
    loadChildren: () => import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },

  // ── Loja ─────────────────────────────────────────────────────────
  {
    path: '',
    component: ShopShellComponent,
    children: [
      { path: '', pathMatch: 'full', title: 'MiniLoja · Ofertas e lançamentos', loadComponent: () => import('./features/home/pages/home/home.page').then((m) => m.HomePage) },
      { path: 'catalogo', title: 'Catálogo · MiniLoja', loadComponent: () => import('./features/catalog/pages/catalog/catalog.page').then((m) => m.CatalogPage) },
      { path: 'produtos/:id', title: 'Produto · MiniLoja', loadComponent: () => import('./features/catalog/pages/product-detail/product-detail.page').then((m) => m.ProductDetailPage) },
      { path: 'carrinho', title: 'Carrinho · MiniLoja', loadComponent: () => import('./features/cart/pages/cart/cart.page').then((m) => m.CartPage) },
      { path: 'pedidos', title: 'Meus pedidos · MiniLoja', canActivate: [authGuard], loadComponent: () => import('./features/orders/pages/orders/orders.page').then((m) => m.OrdersPage) },
      { path: '**', title: 'Página não encontrada · MiniLoja', component: NotFoundPage },
    ],
  },
];
