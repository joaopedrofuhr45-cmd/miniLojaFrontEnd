import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { ProductSort, ProductsService } from '@core/catalog/services/products.service';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { FilterChange } from '../models/filter-change';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';

export type Ordem = 'relevantes' | 'menor-preco' | 'maior-preco' | 'lancamentos';
export type CatalogState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Product> };

const SORT: Record<Ordem, ProductSort> = { relevantes: 'relevance', 'menor-preco': 'price_asc', 'maior-preco': 'price_desc', lancamentos: 'newest' };
const toNum = (v: string | null) => (v !== null && v !== '' && !isNaN(Number(v)) ? Number(v) : null);

/** Os filtros vivem na URL (?categoria=2&ate=100&ordem=relevantes&page=1): dá pra compartilhar e o voltar funciona. */
@Injectable()
export class CatalogFacade {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly products = inject(ProductsService);
  private readonly brl = new BrlPipe();

  readonly categories = inject(CategoriesService).categories;
  readonly reload = signal(0);

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  readonly f = computed(() => {
    const p = this.params();
    return {
      q: p.get('q') ?? '', categoria: toNum(p.get('categoria')), de: toNum(p.get('de')), ate: toNum(p.get('ate')),
      desconto: p.get('desconto') === '1', ordem: (p.get('ordem') as Ordem) in SORT ? (p.get('ordem') as Ordem) : ('relevantes' as Ordem),
      page: Math.max(1, toNum(p.get('page')) ?? 1),
    };
  });

  readonly state = toSignal(
    toObservable(computed(() => ({ f: this.f(), r: this.reload() }))).pipe(
      switchMap(({ f }): Observable<CatalogState> =>
        this.products.list({
          page: f.page - 1, size: 8, search: f.q || undefined, category: f.categoria ?? undefined, minPrice: f.de ?? undefined,
          maxPrice: f.ate ?? undefined, onSale: f.desconto, sort: SORT[f.ordem],
        }).pipe(map((page): CatalogState => ({ status: 'ok', page })), startWith<CatalogState>({ status: 'loading' }), catchError(() => of<CatalogState>({ status: 'error' }))),
      ),
    ),
    { initialValue: { status: 'loading' } as CatalogState },
  );

  readonly total = computed(() => { const s = this.state(); return s.status === 'ok' ? s.page.totalElements : null; });

  readonly chips = computed(() => {
    const f = this.f(); const out: { label: string; clear: FilterChange }[] = [];
    if (f.q) out.push({ label: `“${f.q}”`, clear: { q: null, page: null } });
    if (f.categoria) out.push({ label: this.categories().find((c) => c.id === f.categoria)?.name ?? 'Categoria', clear: { categoria: null, page: null } });
    if (f.de !== null) out.push({ label: `A partir de ${this.brl.transform(f.de, 0)}`, clear: { de: null, page: null } });
    if (f.ate !== null) out.push({ label: `Até ${this.brl.transform(f.ate, 0)}`, clear: { ate: null, page: null } });
    if (f.desconto) out.push({ label: 'Com desconto', clear: { desconto: null, page: null } });
    return out;
  });

  /** Atualiza só o que mudou na URL (null remove o parâmetro). */
  set(changes: FilterChange): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: changes, queryParamsHandling: 'merge' });
  }

  retry(): void { this.reload.update((n) => n + 1); }

  clearAll(): void { this.router.navigate([], { relativeTo: this.route, queryParams: {} }); }
}
