import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  { path: '', title: 'MiniLoja · Ofertas e lançamentos', loadComponent: () => import('./pages/home.page').then((m) => m.HomePage) },
];
