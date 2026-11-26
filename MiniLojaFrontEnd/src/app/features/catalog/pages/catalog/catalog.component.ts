import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartService } from '@core/cart/services/cart.service';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { ProductSort, ProductsService } from '@core/catalog/services/products.service';
import { Category } from '@shared/models/category';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { ProductCardComponent } from '@shared/ui/product-card/product-card.component';
import { FilterChange, ProductFiltersComponent } from '../../components/product-filters/product-filters.component';

type Ordem = 'relevantes' | 'menor-preco' | 'maior-preco' | 'lancamentos';
type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Product> };

const SORT: Record<Ordem, ProductSort> = { relevantes: 'relevance', 'menor-preco': 'price_asc', 'maior-preco': 'price_desc', lancamentos: 'newest' };
const SORT_OPTIONS: { value: Ordem; label: string }[] = [
  { value: 'relevantes', label: 'Mais relevantes' }, { value: 'menor-preco', label: 'Menor preço' },
  { value: 'maior-preco', label: 'Maior preço' }, { value: 'lancamentos', label: 'Lançamentos' },
];
const toNum = (v: string | null) => (v !== null && v !== '' && !isNaN(Number(v)) ? Number(v) : null);

/** Os filtros vivem na URL (?categoria=2&ate=100&ordem=relevantes&page=1): dá pra compartilhar e o voltar funciona. */
@Component({
  selector: 'app-catalog-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, IconComponent, PaginationComponent, ProductCardComponent, ProductFiltersComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsService);
  protected readonly cart = inject(CartService);
  private readonly brl = new BrlPipe();

  protected readonly reload = signal(0);
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);
  protected readonly categories = toSignal(inject(CategoriesService).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

  private readonly params = toSignal(this.route.queryParamMap, { initialValue: this.route.snapshot.queryParamMap });
  protected readonly f = computed(() => {
    const p = this.params();
    return {
      q: p.get('q') ?? '', categoria: toNum(p.get('categoria')), de: toNum(p.get('de')), ate: toNum(p.get('ate')),
      desconto: p.get('desconto') === '1', ordem: (p.get('ordem') as Ordem) in SORT ? (p.get('ordem') as Ordem) : ('relevantes' as Ordem),
      page: Math.max(1, toNum(p.get('page')) ?? 1),
    };
  });

  protected readonly state = toSignal(
    toObservable(computed(() => ({ f: this.f(), r: this.reload() }))).pipe(
      switchMap(({ f }): Observable<State> =>
        this.api.list({
          page: f.page - 1, size: 8, search: f.q || undefined, category: f.categoria ?? undefined, minPrice: f.de ?? undefined,
          maxPrice: f.ate ?? undefined, onSale: f.desconto, sort: SORT[f.ordem],
        }).pipe(map((page): State => ({ status: 'ok', page })), startWith<State>({ status: 'loading' }), catchError(() => of<State>({ status: 'error' }))),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected readonly total = computed(() => { const s = this.state(); return s.status === 'ok' ? s.page.totalElements : null; });

  protected readonly chips = computed(() => {
    const f = this.f(); const out: { label: string; clear: FilterChange }[] = [];
    if (f.q) out.push({ label: `“${f.q}”`, clear: { q: null, page: null } });
    if (f.categoria) out.push({ label: this.categories().find((c) => c.id === f.categoria)?.name ?? 'Categoria', clear: { categoria: null, page: null } });
    if (f.de !== null) out.push({ label: `A partir de ${this.brl.transform(f.de, 0)}`, clear: { de: null, page: null } });
    if (f.ate !== null) out.push({ label: `Até ${this.brl.transform(f.ate, 0)}`, clear: { ate: null, page: null } });
    if (f.desconto) out.push({ label: 'Com desconto', clear: { desconto: null, page: null } });
    return out;
  });

  /** Atualiza só o que mudou na URL (null remove o parâmetro). */
  protected set(changes: FilterChange): void {
    this.router.navigate([], { relativeTo: this.route, queryParams: changes, queryParamsHandling: 'merge' });
  }

  protected clearAll(): void { this.router.navigate([], { relativeTo: this.route, queryParams: {} }); }
  protected onSort(e: Event): void { this.set({ ordem: (e.target as HTMLSelectElement).value, page: null }); }
}
