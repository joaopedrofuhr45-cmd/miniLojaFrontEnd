import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartStore } from '../../../core/cart/cart.store';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { CartItemRowComponent } from '../components/cart-item-row.component';
import { CartSummaryComponent } from '../components/cart-summary.component';

@Component({
  selector: 'app-cart-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, IconComponent, CartItemRowComponent, CartSummaryComponent],
  templateUrl: './cart.page.html',
  styleUrl: './cart.page.scss',
})
export class CartPage {
  protected readonly cart = inject(CartStore);
}
