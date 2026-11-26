import { Component } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon.component';

/** Etapas: Carrinho (feito) → Entrega e pagamento (atual) → Confirmação. */
@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  imports: [IconComponent],
  template: `
    <ol aria-label="Etapas da compra">
      <li class="done"><span class="dot"><ui-icon name="check" [size]="14" [stroke]="3" /></span>Carrinho</li>
      <li class="line done" aria-hidden="true"></li>
      <li class="now" aria-current="step"><span class="dot">2</span>Entrega e pagamento</li>
      <li class="line" aria-hidden="true"></li>
      <li><span class="dot">3</span>Confirmação</li>
    </ol>`,
  styles: [`
    ol { display: flex; align-items: center; gap: 14px; font-size: 13px; font-weight: 600; color: var(--muted); }
    li { display: flex; align-items: center; gap: 8px; white-space: nowrap; }
    .dot { display: grid; place-items: center; width: 26px; height: 26px; border-radius: 50%; background: #d4d4d4; color: #fff; font-size: 12px; }
    .done, .now { color: var(--brand); } .done .dot, .now .dot { background: var(--brand); } .done .dot { background: var(--ok); }
    .line { flex: 1; height: 2px; background: #d4d4d4; min-width: 24px; } .line.done { background: var(--ok); }
    @media (max-width: 640px) { li:not(.line):not(.now) { font-size: 0; } li:not(.line):not(.now) .dot { font-size: 12px; } }
  `],
})
export class CheckoutStepsComponent {}
