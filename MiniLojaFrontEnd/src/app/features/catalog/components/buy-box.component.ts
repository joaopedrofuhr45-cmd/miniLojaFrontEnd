import { Component, computed, inject, input, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CartStore } from '../../../core/cart/cart.store';
import { StoreInfoStore } from '../../../core/store-info/store-info.store';
import { Product } from '../../../shared/models/product';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { PriceBlockComponent } from '../../../shared/ui/price-block.component';

/** Caixa de compra: preço, frete, estoque, quantidade, Comprar agora e Adicionar ao carrinho. */
@Component({
  selector: 'app-buy-box',
  standalone: true,
  imports: [BrlPipe, ButtonComponent, IconComponent, PriceBlockComponent],
  templateUrl: './buy-box.component.html',
  styleUrl: './buy-box.component.scss',
})
export class BuyBoxComponent {
  readonly product = input.required<Product>();
  private readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  protected readonly info = inject(StoreInfoStore).info;
  protected readonly qty = signal(1);
  protected readonly added = signal(false);
  protected readonly cepClicked = signal(false);
  protected readonly maxQty = computed(() => this.product().stock);

  protected addToCart(): void {
    this.cart.add(this.product(), this.qty());
    this.added.set(true);
    setTimeout(() => this.added.set(false), 1400);
  }

  protected buyNow(): void {
    this.cart.add(this.product(), this.qty());
    this.router.navigate(['/checkout']);
  }
}
