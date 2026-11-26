import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CartService } from '@core/cart/services/cart.service';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { ProductsService } from '@core/catalog/services/products.service';
import { Category } from '@shared/models/category';
import { Product } from '@shared/models/product';
import { BenefitsStripComponent } from '../../components/benefits-strip/benefits-strip.component';
import { CategoryShortcutsComponent } from '../../components/category-shortcuts/category-shortcuts.component';
import { HeroBannerComponent } from '../../components/hero-banner/hero-banner.component';
import { ProductShowcaseComponent } from '../../components/product-showcase/product-showcase.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [HeroBannerComponent, BenefitsStripComponent, CategoryShortcutsComponent, ProductShowcaseComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {
  private readonly api = inject(ProductsService);
  protected readonly cart = inject(CartService);

  protected readonly categories = toSignal(inject(CategoriesService).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });
  protected readonly offers = toSignal(this.load({ onSale: true, size: 4 }), { initialValue: null });
  protected readonly latest = toSignal(this.load({ sort: 'newest', size: 4 }), { initialValue: null });

  private load(filters: Parameters<ProductsService['list']>[0]) {
    return this.api.list(filters).pipe(map((p) => p.content as Product[] | null), catchError(() => of([] as Product[])));
  }
}
