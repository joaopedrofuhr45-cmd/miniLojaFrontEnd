import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '@core/cart/services/cart.service';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';

@Component({
  selector: 'app-cart-item-row',
  standalone: true,
  imports: [RouterLink, BrlPipe, IconComponent, ProductThumbComponent],
  templateUrl: './cart-item-row.component.html',
  styleUrl: './cart-item-row.component.scss',
})
export class CartItemRowComponent {
  readonly item = input.required<CartItem>();
  readonly remove = output<void>();
  readonly quantityChange = output<number>();
  protected readonly saved = signal(false); // favoritos: só visual no MVP
}
