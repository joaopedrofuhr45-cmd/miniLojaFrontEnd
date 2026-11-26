import { Component } from '@angular/core';
import { IconComponent } from '../../../shared/ui/icon.component';

/** Etapas: Carrinho (feito) → Entrega e pagamento (atual) → Confirmação. */
@Component({
  selector: 'app-checkout-steps',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './checkout-steps.component.html',
  styleUrl: './checkout-steps.component.scss',
})
export class CheckoutStepsComponent {}
