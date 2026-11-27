import { Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthStore } from '../../../../core/auth/services/auth.store';
import { CartStore } from '../../services/cart.store';
import { StoreInfoStore } from '../../../../shared/services/store-info.store';
import { BrlPipe } from '../../../../shared/pipes/brl/brl.pipe';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { installments } from '../../../../shared/utils/price';

/** Barra de frete grátis + resumo. Os valores são só de exibição: o back recalcula no pedido. */
@Component({
  selector: 'app-cart-summary',
  standalone: true,
  imports: [BrlPipe, ButtonComponent],
  templateUrl: './cart-summary.component.html',
  styleUrl: './cart-summary.component.scss',
})
export class CartSummaryComponent {
  protected readonly cart = inject(CartStore);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly info = inject(StoreInfoStore).info;
  protected readonly parcels = computed(() => installments(this.cart.total(), this.info().maxInstallments));

  protected next(): void {
    if (this.auth.isLoggedIn()) this.router.navigate(['/checkout']);
    else this.router.navigate(['/entrar'], { queryParams: { returnUrl: '/checkout' } });
  }
}
