import { Component, input, output } from '@angular/core';
import { PaymentMethod } from '../../../shared/models/order';
import { IconComponent } from '../../../shared/ui/icon.component';

const OPTIONS: { value: PaymentMethod; icon: string; title: string; hint: string }[] = [
  { value: 'PIX', icon: 'bolt', title: 'Pix', hint: 'Aprovação imediata' },
  { value: 'CARD', icon: 'card', title: 'Cartão de crédito', hint: 'Em até 10x sem juros' },
  { value: 'BOLETO', icon: 'doc', title: 'Boleto bancário', hint: 'Vence em 3 dias úteis' },
];

/** Escolha da forma de pagamento (simulada no MVP). */
@Component({
  selector: 'app-payment-options',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div role="radiogroup" aria-label="Forma de pagamento">
      @for (o of options; track o.value) {
        <label [class.on]="value() === o.value">
          <input type="radio" name="payment" [value]="o.value" [checked]="value() === o.value" (change)="valueChange.emit(o.value)" />
          <span class="radio" aria-hidden="true"></span>
          <ui-icon [name]="o.icon" [size]="22" />
          <span class="txt"><b>{{ o.title }}</b><small>{{ o.hint }}</small></span>
        </label>
      }
    </div>`,
  styles: [`
    div { display: grid; gap: 12px; }
    label { display: flex; align-items: center; gap: 14px; padding: 12px 16px; border: 1px solid #cfcfcf; border-radius: var(--radius); cursor: pointer; color: var(--ink2); }
    label.on { border: 2px solid var(--brand); padding: 11px 15px; background: var(--brand-soft); color: var(--brand); }
    input { position: absolute; opacity: 0; } input:focus-visible + .radio { outline: 2px solid var(--brand); outline-offset: 2px; }
    .radio { width: 20px; height: 20px; border: 2px solid #9a9a9a; border-radius: 50%; display: grid; place-items: center; flex: none; }
    .on .radio { border-color: var(--brand); } .on .radio::after { content: ''; width: 10px; height: 10px; border-radius: 50%; background: var(--brand); }
    .txt { display: grid; } b { color: var(--ink); font-size: 15px; font-weight: 600; } small { font-size: 12px; color: var(--muted); }
  `],
})
export class PaymentOptionsComponent {
  readonly value = input.required<PaymentMethod>();
  readonly valueChange = output<PaymentMethod>();
  protected readonly options = OPTIONS;
}
