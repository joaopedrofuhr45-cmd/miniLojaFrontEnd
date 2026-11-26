import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Product } from '@shared/models/product';
import { StoreInfoService } from '@core/store-info/services/store-info.service';

export interface CartItem {
  productId: number;
  name: string;
  categoryName: string;
  price: number;
  originalPrice: number | null;
  imageUrl: string | null;
  stock: number;
  quantity: number;
}

/**
 * Carrinho só no front (signal + localStorage). Fica em core porque catálogo, detalhe, home, carrinho,
 * checkout e pedidos usam. O preço guardado é só para exibir: o back recalcula no POST /orders.
 */
@Injectable({ providedIn: 'root' })
export class CartService {
  private readonly KEY = 'miniloja.cart';
  private readonly storeInfo = inject(StoreInfoService);

  readonly items = signal<CartItem[]>(this.load());
  readonly count = computed(() => this.items().reduce((n, i) => n + i.quantity, 0));
  readonly subtotal = computed(() => this.items().reduce((s, i) => s + i.price * i.quantity, 0));
  readonly originalSubtotal = computed(() => this.items().reduce((s, i) => s + (i.originalPrice ?? i.price) * i.quantity, 0));
  readonly shipping = computed(() => (this.items().length ? this.storeInfo.shippingFor(this.subtotal()) : 0));
  readonly total = computed(() => this.subtotal() + this.shipping());
  /** 0–100: quanto falta para o frete grátis (barra do carrinho). */
  readonly freeShippingProgress = computed(() => Math.min(100, (this.subtotal() / this.storeInfo.info().freeShippingThreshold) * 100));
  readonly missingForFreeShipping = computed(() => Math.max(0, this.storeInfo.info().freeShippingThreshold - this.subtotal()));

  constructor() {
    effect(() => {
      try { localStorage.setItem(this.KEY, JSON.stringify(this.items())); } catch { /* storage indisponível */ }
    });
  }

  add(p: Product, qty = 1): void {
    if (p.stock <= 0) return;
    this.items.update((list) => {
      const found = list.find((i) => i.productId === p.id);
      if (found) {
        return list.map((i) => (i.productId === p.id ? { ...i, stock: p.stock, quantity: Math.min(i.quantity + qty, p.stock) } : i));
      }
      return [...list, {
        productId: p.id, name: p.name, categoryName: p.category.name, price: p.price, originalPrice: p.originalPrice,
        imageUrl: p.imageUrl, stock: p.stock, quantity: Math.min(qty, p.stock),
      }];
    });
  }

  setQuantity(productId: number, quantity: number): void {
    if (quantity < 1) return this.remove(productId);
    this.items.update((l) => l.map((i) => (i.productId === productId ? { ...i, quantity: Math.min(quantity, i.stock) } : i)));
  }

  remove(productId: number): void { this.items.update((l) => l.filter((i) => i.productId !== productId)); }
  clear(): void { this.items.set([]); }

  private load(): CartItem[] {
    try { return JSON.parse(localStorage.getItem(this.KEY) ?? '[]'); } catch { return []; }
  }
}
