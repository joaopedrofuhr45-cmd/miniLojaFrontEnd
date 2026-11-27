import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartService } from '@core/cart/services/cart.service';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';

/** Resumo do pedido. O total é só de exibição: o back recalcula preço e estoque no POST /orders. */
@Component({
  selector: 'app-order-summary',
  standalone: true,
  imports: [RouterLink, BrlPipe, ButtonComponent, IconComponent, ProductThumbComponent],
  templateUrl: './order-summary.component.html',
  styleUrl: './order-summary.component.scss',
})
export class OrderSummaryComponent {
  protected readonly cart = inject(CartService);
  readonly busy = input(false);
  readonly confirm = output<void>();
  protected short(name: string): string { return name.split(' · ')[0]; }
}
