import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartStore } from '../../../core/cart/cart.store';
import { CategoriesApi } from '../../../core/catalog/categories.api';
import { ProductSort, ProductsApi } from '../../../core/catalog/products.api';
import { Category } from '../../../shared/models/category';
import { Page } from '../../../shared/models/page';
import { Product } from '../../../shared/models/product';
import { BrlPipe } from '../../../shared/pipes/brl.pipe';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { IconComponent } from '../../../shared/ui/icon.component';
import { PaginationComponent } from '../../../shared/ui/pagination.component';
import { ProductCardComponent } from '../../../shared/ui/product-card.component';
import { FilterChange, ProductFiltersComponent } from '../components/product-filters.component';

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
  template: `
    <div class="container page">
      <nav class="breadcrumb" aria-label="Você está aqui"><a routerLink="/">Início</a><span aria-current="page">Catálogo</span></nav>
      <div class="layout">
        <aside>
          <h1>Catálogo</h1>
          <p class="muted count">{{ total() === null ? '…' : total() + ' resultados' }}</p>
          <app-product-filters [categories]="categories()" [categoria]="f().categoria" [de]="f().de" [ate]="f().ate" [desconto]="f().desconto" (filtersChange)="set($event)" />
        </aside>
        <section>
          <div class="bar">
            <div class="chips">
              @for (c of chips(); track c.label) {
                <button type="button" class="chip" (click)="set(c.clear)">{{ c.label }} <ui-icon name="x" [size]="12" /></button>
              }
              @if (chips().length) { <button type="button" class="link" (click)="clearAll()">Limpar tudo</button> }
            </div>
            <label class="sort">Ordenar por
              <select (change)="onSort($event)" aria-label="Ordenar por">
                @for (o of sortOptions; track o.value) { <option [value]="o.value" [selected]="o.value === f().ordem">{{ o.label }}</option> }
              </select>
            </label>
          </div>

          @if (state(); as s) {
          @if (s.status === 'loading') {
            <div class="grid">@for (i of skeletons; track i) { <div class="skeleton card-sk"></div> }</div>
          } @else if (s.status === 'error') {
            <div class="card"><ui-empty-state icon="x" title="Não deu pra carregar os produtos" message="Verifique a conexão e tente de novo.">
              <button uiButton variant="cta" (click)="reload.set(reload() + 1)">Tentar de novo</button>
            </ui-empty-state></div>
          } @else if (s.page.content.length === 0) {
            <div class="card"><ui-empty-state title="Nenhum produto encontrado" message="Tente remover algum filtro.">
              <button uiButton variant="outline" (click)="clearAll()">Limpar filtros</button>
            </ui-empty-state></div>
          } @else {
            <div class="grid">@for (p of s.page.content; track p.id) { <ui-product-card [product]="p" (add)="cart.add($event)" /> }</div>
            <ui-pagination [page]="f().page" [totalPages]="s.page.totalPages" (pageChange)="set({ page: $event })" />
          }
          }
        </section>
      </div>
    </div>`,
  styles: [`
    .layout { display: grid; grid-template-columns: 200px 1fr; gap: 24px; align-items: start; }
    h1 { font-size: 24px; font-weight: 700; } .count { margin: 8px 0 18px; }
    section { display: grid; gap: 16px; min-width: 0; }
    .bar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; min-height: 40px; }
    .chips { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .chip { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; border: 1px solid var(--brand); border-radius: 999px; background: var(--brand-soft); color: var(--brand); font-size: 13px; font-weight: 500; }
    .sort { display: flex; align-items: center; gap: 8px; color: var(--muted); }
    .sort select { height: 38px; padding: 0 12px; border: 1px solid #cfcfcf; border-radius: var(--radius); background: #fff; color: var(--ink); font: inherit; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    .card-sk { height: 390px; }
    @media (max-width: 1100px) { .grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (max-width: 860px) { .layout { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
    @media (max-width: 480px) { .grid { grid-template-columns: 1fr; } }
  `],
})
export class CatalogPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ProductsApi);
  protected readonly cart = inject(CartStore);
  private readonly brl = new BrlPipe();

  protected readonly reload = signal(0);
  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletons = Array.from({ length: 8 }, (_, i) => i);
  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

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
