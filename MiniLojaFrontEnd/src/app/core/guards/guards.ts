import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../auth/auth.store';

// Guards são só UX. A segurança de verdade está no back (hasRole("ADMIN")).

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return auth.isLoggedIn() || router.createUrlTree(['/entrar'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return !auth.isLoggedIn() || router.createUrlTree(['/catalogo']);
};

export const adminGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  if (auth.isAdmin()) return true;
  return auth.isLoggedIn() ? router.createUrlTree(['/']) : router.createUrlTree(['/entrar'], { queryParams: { returnUrl: state.url } });
};
