import { Component, computed, input } from '@angular/core';
import { BrlPipe } from '../pipes/brl.pipe';
import { discountPct, installments } from '../utils/price';

@Component({
  selector: 'ui-price-block',
  standalone: true,
  imports: [BrlPipe],
  templateUrl: './price-block.component.html',
  host: { '[attr.data-size]': 'size()' },
  styleUrl: './price-block.component.scss',
})
export class PriceBlockComponent {
  readonly price = input.required<number>();
  readonly originalPrice = input<number | null>(null);
  readonly size = input<'card' | 'detail'>('card');
  readonly maxInstallments = input(10);
  protected readonly off = computed(() => discountPct(this.price(), this.originalPrice()));
  protected readonly parcels = computed(() => installments(this.price(), this.maxInstallments()));
}
