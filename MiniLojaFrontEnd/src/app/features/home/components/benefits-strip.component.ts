import { Component, inject } from '@angular/core';
import { StoreInfoStore } from '../../../core/store-info/store-info.store';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { IconComponent } from '../../../shared/ui/icon.component';

/** Faixa de confiança. Frete, parcelas e troca vêm de /store-info, não ficam fixos no código. */
@Component({
  selector: 'app-benefits-strip',
  standalone: true,
  imports: [BrlPipe, IconComponent],
  template: `
    <ul class="card">
      <li><span class="ico"><ui-icon name="truck" /></span><div><b>Frete grátis</b><small>em compras acima de {{ info().freeShippingThreshold | brl: 0 }}</small></div></li>
      <li><span class="ico"><ui-icon name="card" /></span><div><b>Até {{ info().maxInstallments }}x sem juros</b><small>no cartão de crédito</small></div></li>
      <li><span class="ico"><ui-icon name="lock" /></span><div><b>Compra segura</b><small>seus dados protegidos</small></div></li>
      <li><span class="ico"><ui-icon name="return" /></span><div><b>Troca em {{ info().returnDays }} dias</b><small>sem complicação</small></div></li>
    </ul>`,
  styles: [`
    ul { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; padding: 16px 20px; }
    li { display: flex; align-items: center; gap: 12px; } div { display: grid; } b { font-size: 12px; font-weight: 600; } small { font-size: 11px; color: var(--muted); }
    .ico { display: grid; place-items: center; width: 36px; height: 36px; border-radius: 50%; background: var(--brand-soft); color: var(--brand); flex: none; }
    @media (max-width: 860px) { ul { grid-template-columns: 1fr 1fr; } }
  `],
})
export class BenefitsStripComponent {
  protected readonly info = inject(StoreInfoStore).info;
}
