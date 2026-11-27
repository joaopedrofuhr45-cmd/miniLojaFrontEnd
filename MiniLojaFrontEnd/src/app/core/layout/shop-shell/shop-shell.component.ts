import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { AuthService } from '@core/auth/services/auth.service';
import { CartService } from '@core/cart/services/cart.service';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { StoreInfoService } from '@core/store-info/services/store-info.service';
import { ShopFooterComponent } from '../shop-footer/shop-footer.component';

/** Layout da loja: faixa de benefícios, header com busca, menu de categorias, conteúdo e footer. */
@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrlPipe, IconComponent, LogoComponent, ShopFooterComponent],
  templateUrl: './shop-shell.component.html',
  styleUrl: './shop-shell.component.scss',
})
export class ShopShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly cart = inject(CartService);
  private readonly router = inject(Router);
  protected readonly info = inject(StoreInfoService).info;
  protected readonly categories = inject(CategoriesService).categories;

  protected search(e: Event, term: string): void {
    e.preventDefault();
    this.router.navigate(['/catalogo'], { queryParams: { q: term.trim() || null } });
  }

  protected logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
