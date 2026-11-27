import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  { path: '', title: 'MiniLoja · Ofertas e lançamentos', loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent) },
];
