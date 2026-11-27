import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  { path: '', title: 'Entrar · MiniLoja', loadComponent: () => import('./pages/auth/auth.component').then((m) => m.AuthComponent) },
];
