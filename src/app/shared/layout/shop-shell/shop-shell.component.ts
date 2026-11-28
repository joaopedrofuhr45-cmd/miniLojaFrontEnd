import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BrlPipe } from '../../pipes/brl/brl.pipe';
import { Category } from '../../models/category';
import { IconComponent } from '../../ui/icon/icon.component';
import { LogoComponent } from '../../ui/logo/logo.component';
import { ThemeService } from '../../../core/theme.service';
import { AuthStore } from '../../../core/auth/services/auth.store';
import { CartStore } from '../../../features/cart/services/cart.store';
import { CategoriesApi } from '../../../features/catalog/services/categories.api';
import { StoreInfoStore } from '../../services/store-info.store';
import { ShopFooterComponent } from '../shop-footer/shop-footer.component';
import { SwapComponent } from '../../ui/swap/swap.component';

/** Layout da loja: faixa de benefícios, header com busca, menu de categorias, conteúdo e footer. */
@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrlPipe, IconComponent, LogoComponent, ShopFooterComponent, SwapComponent],
  templateUrl: './shop-shell.component.html',
  styleUrl: './shop-shell.component.scss',
})
export class ShopShellComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly theme = inject(ThemeService);
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
