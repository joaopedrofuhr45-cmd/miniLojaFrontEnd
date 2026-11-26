import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { Category } from '../../shared/models/category';
import { IconComponent } from '../../shared/ui/icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { AuthStore } from '../auth/auth.store';
import { CartStore } from '../cart/cart.store';
import { CategoriesApi } from '../catalog/categories.api';
import { StoreInfoStore } from '../store-info/store-info.store';
import { ShopFooterComponent } from './shop-footer.component';

/** Layout da loja: faixa de benefícios, header com busca, menu de categorias, conteúdo e footer. */
@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrlPipe, IconComponent, LogoComponent, ShopFooterComponent],
  templateUrl: './shop-shell.component.html',
  styleUrl: './shop-shell.component.scss',
})
export class ShopShellComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  protected readonly info = inject(StoreInfoStore).info;
  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

  protected search(e: Event, term: string): void {
    e.preventDefault();
    this.router.navigate(['/catalogo'], { queryParams: { q: term.trim() || null } });
  }

  protected logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
