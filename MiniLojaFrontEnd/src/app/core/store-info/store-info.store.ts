import { Injectable, inject, signal } from '@angular/core';
import { StoreInfo } from '../../shared/models/store-info';
import { StoreInfoApi } from './store-info.api';

const DEFAULTS: StoreInfo = { freeShippingThreshold: 199, shippingFee: 15, maxInstallments: 10, returnDays: 7 };

/** Frete grátis, parcelas etc. vêm de GET /store-info; os defaults evitam tela piscando se a API demorar/falhar. */
@Injectable({ providedIn: 'root' })
export class StoreInfoStore {
  readonly info = signal<StoreInfo>(DEFAULTS);

  constructor() {
    inject(StoreInfoApi).get().subscribe({ next: (i) => this.info.set(i), error: () => undefined });
  }

  /** Só para EXIBIR. O back recalcula o frete no pedido. */
  shippingFor(subtotal: number): number {
    const i = this.info();
    return subtotal >= i.freeShippingThreshold ? 0 : i.shippingFee;
  }
}
