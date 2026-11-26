import { Component, inject } from '@angular/core';
import { StoreInfoStore } from '../../../core/store-info/store-info.store';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { IconComponent } from '../../../shared/ui/icon.component';

/** Faixa de confiança. Frete, parcelas e troca vêm de /store-info, não ficam fixos no código. */
@Component({
  selector: 'app-benefits-strip',
  standalone: true,
  imports: [BrlPipe, IconComponent],
  templateUrl: './benefits-strip.component.html',
  styleUrl: './benefits-strip.component.scss',
})
export class BenefitsStripComponent {
  protected readonly info = inject(StoreInfoStore).info;
}
