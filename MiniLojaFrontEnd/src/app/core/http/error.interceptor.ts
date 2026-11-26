import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '@core/auth/services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 em /auth/* é só "senha errada": quem trata é a tela de login.
      if (err.status === 401 && !req.url.includes('/auth/')) {
        auth.logout();
        router.navigate(['/entrar'], { queryParams: { returnUrl: router.url } });
      }
      return throwError(() => err); // a tela decide o que mostrar nos outros erros
    }),
  );
};
