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
  templateUrl: './payment-options.component.html',
  styleUrl: './payment-options.component.scss',
})
export class PaymentOptionsComponent {
  readonly value = input.required<PaymentMethod>();
  readonly valueChange = output<PaymentMethod>();
  protected readonly options = OPTIONS;
}
