import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CartStore } from '../../../core/cart/cart.store';
import { CategoriesApi } from '../../../core/catalog/categories.api';
import { ProductsApi } from '../../../core/catalog/products.api';
import { Category } from '../../../shared/models/category';
import { Product } from '../../../shared/models/product';
import { BenefitsStripComponent } from '../components/benefits-strip.component';
import { CategoryShortcutsComponent } from '../components/category-shortcuts.component';
import { HeroBannerComponent } from '../components/hero-banner.component';
import { ProductShowcaseComponent } from '../components/product-showcase.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroBannerComponent, BenefitsStripComponent, CategoryShortcutsComponent, ProductShowcaseComponent],
  templateUrl: './home.page.html',
})
export class HomePage {
  private readonly api = inject(ProductsApi);
  protected readonly cart = inject(CartStore);

  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });
  protected readonly offers = toSignal(this.load({ onSale: true, size: 4 }), { initialValue: null });
  protected readonly latest = toSignal(this.load({ sort: 'newest', size: 4 }), { initialValue: null });

  private load(filters: Parameters<ProductsApi['list']>[0]) {
    return this.api.list(filters).pipe(map((p) => p.content as Product[] | null), catchError(() => of([] as Product[])));
  }
}
