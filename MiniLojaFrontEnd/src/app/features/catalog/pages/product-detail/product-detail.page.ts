import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartStore } from '../../../../core/cart/cart.store';
import { ProductsApi } from '../../../../core/catalog/products.api';
import { Product } from '../../../../shared/models/product';
import { ButtonComponent } from '../../../../shared/ui/button/button.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state/empty-state.component';
import { ProductCardComponent } from '../../../../shared/ui/product-card/product-card.component';
import { BuyBoxComponent } from '../../components/buy-box/buy-box.component';
import { ProductGalleryComponent } from '../../components/product-gallery/product-gallery.component';

type State = { status: 'loading' } | { status: 'error' } | { status: 'notfound' } | { status: 'ok'; product: Product };

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, ProductCardComponent, BuyBoxComponent, ProductGalleryComponent],
  templateUrl: './product-detail.page.html',
  styleUrl: './product-detail.page.scss',
})
export class ProductDetailPage {
  /** Vem do parâmetro de rota :id (withComponentInputBinding). */
  readonly id = input.required<string>();
  private readonly api = inject(ProductsApi);
  protected readonly cart = inject(CartStore);
  protected readonly reload = signal(0);

  protected readonly state = toSignal(
    toObservable(computed(() => ({ id: Number(this.id()), r: this.reload() }))).pipe(
      switchMap(({ id }): Observable<State> =>
        this.api.get(id).pipe(
          map((product): State => ({ status: 'ok', product })),
          startWith<State>({ status: 'loading' }),
          catchError((e: HttpErrorResponse) => of<State>({ status: e.status === 404 ? 'notfound' : 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  private readonly sameCategory = toSignal(
    toObservable(computed(() => { const s = this.state(); return s.status === 'ok' ? s.product.category.id : null; })).pipe(
      filter((c): c is number => c !== null),
      switchMap((category) => this.api.list({ category, size: 5 }).pipe(map((p) => p.content), catchError(() => of([] as Product[])))),
    ),
    { initialValue: [] as Product[] },
  );
  protected readonly related = computed(() => this.sameCategory().filter((p) => p.id !== Number(this.id())).slice(0, 4));

  protected shortName(p: Product): string { return p.name.split(' · ')[0]; }
  protected paragraphs(p: Product): string[] { return p.description.split(/\n{2,}/).filter(Boolean); }
}
