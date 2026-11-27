import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { catchError, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { ProductsService } from '@core/catalog/services/products.service';
import { Product } from '@shared/models/product';

export type ProductState = { status: 'loading' } | { status: 'notfound' } | { status: 'error' } | { status: 'ok'; product: Product };

/** Carrega o produto da rota (:id) e os relacionados da mesma categoria. */
@Injectable()
export class ProductDetailFacade {
  private readonly products = inject(ProductsService);
  private readonly route = inject(ActivatedRoute);

  readonly reload = signal(0);
  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => Number(p.get('id')))), { initialValue: Number(this.route.snapshot.paramMap.get('id')) });

  readonly state = toSignal(
    toObservable(computed(() => ({ id: this.id(), r: this.reload() }))).pipe(
      switchMap(({ id }): Observable<ProductState> =>
        this.products.get(id).pipe(
          map((product): ProductState => ({ status: 'ok', product })),
          startWith<ProductState>({ status: 'loading' }),
          catchError((e: HttpErrorResponse) => of<ProductState>({ status: e.status === 404 ? 'notfound' : 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as ProductState },
  );

  private readonly sameCategory = toSignal(
    toObservable(computed(() => { const s = this.state(); return s.status === 'ok' ? s.product.category.id : null; })).pipe(
      filter((c): c is number => c !== null),
      switchMap((category) => this.products.list({ category, size: 5 }).pipe(map((p) => p.content), catchError(() => of([] as Product[])))),
    ),
    { initialValue: [] as Product[] },
  );
  readonly related = computed(() => this.sameCategory().filter((p) => p.id !== this.id()).slice(0, 4));

  retry(): void { this.reload.update((n) => n + 1); }
}
