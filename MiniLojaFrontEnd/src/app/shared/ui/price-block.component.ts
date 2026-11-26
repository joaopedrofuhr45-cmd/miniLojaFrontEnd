import { Component, computed, input } from '@angular/core';
import { BrlPipe } from '../pipes/brl.pipe';
import { discountPct, installments } from '../utils/price';

@Component({
  selector: 'ui-price-block',
  standalone: true,
  imports: [BrlPipe],
  template: `
    <s class="old">@if (originalPrice() && off()) { {{ originalPrice() | brl }} } @else { &nbsp; }</s>
    <div class="now"><span class="price">{{ price() | brl }}</span>@if (off()) { <span class="off">{{ off() }}% OFF</span> }</div>
    @if (parcels() > 1) { <div class="inst">em {{ parcels() }}x {{ price() / parcels() | brl }} sem juros</div> }`,
  host: { '[attr.data-size]': 'size()' },
  styles: [`
    :host { display: block; }
    .old { display: block; min-height: 14px; font-size: 11px; color: var(--muted); }
    .now { display: flex; align-items: baseline; gap: 8px; }
    .price { font-size: 24px; font-weight: 500; letter-spacing: -.01em; }
    .off { font-size: 12px; font-weight: 700; color: var(--ok); }
    .inst { font-size: 12px; color: var(--ok); }
    :host([data-size='detail']) .old { font-size: 13px; }
    :host([data-size='detail']) .price { font-size: 38px; font-weight: 400; }
    :host([data-size='detail']) .off { font-size: 14px; }
    :host([data-size='detail']) .inst { font-size: 14px; margin-top: 2px; }
  `],
})
export class PriceBlockComponent {
  readonly price = input.required<number>();
  readonly originalPrice = input<number | null>(null);
  readonly size = input<'card' | 'detail'>('card');
  readonly maxInstallments = input(10);
  protected readonly off = computed(() => discountPct(this.price(), this.originalPrice()));
  protected readonly parcels = computed(() => installments(this.price(), this.maxInstallments()));
}
