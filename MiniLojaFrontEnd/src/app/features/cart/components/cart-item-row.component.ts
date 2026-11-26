import { Component, input, output, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CartItem } from '../../../core/cart/cart.store';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { IconComponent } from '../../../shared/ui/icon.component';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';

@Component({
  selector: 'app-cart-item-row',
  standalone: true,
  imports: [RouterLink, BrlPipe, IconComponent, ProductThumbComponent],
  template: `
    <div class="thumb"><ui-product-thumb [seed]="item().productId" [imageUrl]="item().imageUrl" [alt]="item().name" [iconSize]="34" /></div>
    <div class="info">
      <a [routerLink]="['/produtos', item().productId]" class="name">{{ item().name }}</a>
      <span class="muted">{{ item().categoryName }}</span>
      <div class="links">
        <button type="button" class="link" (click)="remove.emit()">Remover</button>
        <button type="button" class="link" (click)="saved.set(!saved())">{{ saved() ? 'Salvo nos favoritos ✓' : 'Salvar nos favoritos' }}</button>
      </div>
    </div>
    <div class="stepper" role="group" [attr.aria-label]="'Quantidade de ' + item().name">
      <button type="button" aria-label="Diminuir" (click)="quantityChange.emit(item().quantity - 1)"><ui-icon name="minus" [size]="12" /></button>
      <output>{{ item().quantity }}</output>
      <button type="button" aria-label="Aumentar" [disabled]="item().quantity >= item().stock" (click)="quantityChange.emit(item().quantity + 1)"><ui-icon name="plus" [size]="12" /></button>
    </div>
    <div class="price">
      @if (item().originalPrice) { <s>{{ item().originalPrice! * item().quantity | brl }}</s> }
      <b>{{ item().price * item().quantity | brl }}</b>
    </div>`,
  styles: [`
    :host { display: grid; grid-template-columns: 86px 1fr auto 130px; align-items: center; gap: 20px; padding: 20px 0; border-top: 1px solid var(--line); }
    .thumb { width: 86px; height: 86px; border-radius: 4px; overflow: hidden; }
    .info { display: grid; gap: 4px; } .name { color: var(--ink); font-weight: 600; } .muted { font-size: 13px; }
    .links { display: flex; gap: 14px; margin-top: 4px; }
    .stepper { display: inline-flex; align-items: center; border: 1px solid #cfcfcf; border-radius: var(--radius); }
    .stepper button { width: 36px; height: 38px; display: grid; place-items: center; background: none; border: 0; color: var(--brand); } .stepper button:disabled { opacity: .35; cursor: not-allowed; }
    .stepper output { min-width: 40px; text-align: center; font-weight: 500; }
    .price { display: grid; justify-items: end; } .price s { font-size: 12px; color: var(--muted); } .price b { font-size: 18px; font-weight: 600; }
    @media (max-width: 640px) { :host { grid-template-columns: 64px 1fr; } .thumb { width: 64px; height: 64px; } .stepper { grid-column: 1; justify-self: start; } .price { grid-column: 2; } }
  `],
})
export class CartItemRowComponent {
  readonly item = input.required<CartItem>();
  readonly remove = output<void>();
  readonly quantityChange = output<number>();
  protected readonly saved = signal(false); // favoritos: só visual no MVP
}
