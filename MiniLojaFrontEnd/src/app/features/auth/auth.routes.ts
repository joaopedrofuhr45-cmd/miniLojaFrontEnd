import { Routes } from '@angular/router';

/** Montada em /entrar dentro do shell enxuto, com guestGuard (ver app.routes.ts). */
export const AUTH_ROUTES: Routes = [
  { path: '', title: 'Entrar · MiniLoja', loadComponent: () => import('./pages/auth.page').then((m) => m.AuthPage) },
];
