import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, filter, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CartStore } from '../../../core/cart/cart.store';
import { ProductsApi } from '../../../core/catalog/products.api';
import { Product } from '../../../shared/models/product';
import { ButtonComponent } from '../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../shared/ui/empty-state.component';
import { ProductCardComponent } from '../../../shared/ui/product-card.component';
import { BuyBoxComponent } from '../components/buy-box.component';
import { ProductGalleryComponent } from '../components/product-gallery.component';

type State = { status: 'loading' } | { status: 'error' } | { status: 'notfound' } | { status: 'ok'; product: Product };

@Component({
  selector: 'app-product-detail-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent, ProductCardComponent, BuyBoxComponent, ProductGalleryComponent],
  template: `
    <div class="container page">
      @if (state(); as s) {
      @if (s.status === 'ok') {
        <nav class="breadcrumb" aria-label="Você está aqui">
          <a routerLink="/">Início</a><a routerLink="/catalogo">Catálogo</a>
          <a routerLink="/catalogo" [queryParams]="{ categoria: s.product.category.id }">{{ s.product.category.name }}</a>
          <span aria-current="page">{{ shortName(s.product) }}</span>
        </nav>
        <div class="cols">
          <div class="left">
            <div class="card gallery"><app-product-gallery [product]="s.product" /></div>
            <div class="card desc">
              <h2>Descrição</h2>
              @for (para of paragraphs(s.product); track $index) { <p>{{ para }}</p> }
            </div>
          </div>
          <app-buy-box [product]="s.product" />
        </div>
        @if (related().length) {
          <div class="head"><h2 class="section-title">Quem viu este produto também viu</h2><a routerLink="/catalogo" [queryParams]="{ categoria: s.product.category.id }">Ver mais ›</a></div>
          <div class="grid">@for (p of related(); track p.id) { <ui-product-card [product]="p" (add)="cart.add($event)" /> }</div>
        }
      } @else if (s.status === 'loading') {
        <div class="cols"><div class="skeleton" style="height:480px"></div><div class="skeleton" style="height:480px"></div></div>
      } @else if (s.status === 'notfound') {
        <div class="card"><ui-empty-state icon="search" title="Produto não encontrado" message="Ele pode ter saído do catálogo.">
          <a uiButton variant="cta" routerLink="/catalogo">Ver catálogo</a></ui-empty-state></div>
      } @else {
        <div class="card"><ui-empty-state icon="x" title="Não deu pra carregar o produto" message="Tente de novo em instantes.">
          <button uiButton variant="cta" (click)="reload.set(reload() + 1)">Tentar de novo</button></ui-empty-state></div>
      }
      }
    </div>`,
  styles: [`
    .cols { display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); gap: 20px; align-items: start; }
    .left { display: grid; gap: 16px; } .gallery { padding: 20px; }
    .desc { padding: 24px 28px; display: grid; gap: 10px; } .desc h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; } .desc p { color: var(--ink2); }
    .head { display: flex; justify-content: space-between; align-items: baseline; } .head a { font-size: 13px; font-weight: 600; }
    .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; }
    @media (max-width: 960px) { .cols { grid-template-columns: 1fr; } .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
  `],
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
