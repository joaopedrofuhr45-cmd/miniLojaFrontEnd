import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesApi } from '../../../../core/catalog/categories.api';
import { Category } from '../../../../shared/models/category';
import { Page } from '../../../../shared/models/page';
import { Product } from '../../../../shared/models/product';
import { BrlPipe } from '../../../../shared/pipes/brl.pipe';
import { BadgeComponent } from '../../../../shared/ui/badge.component';
import { ButtonComponent } from '../../../../shared/ui/button.component';
import { EmptyStateComponent } from '../../../../shared/ui/empty-state.component';
import { ModalComponent } from '../../../../shared/ui/modal.component';
import { PaginationComponent } from '../../../../shared/ui/pagination.component';
import { ProductThumbComponent } from '../../../../shared/ui/product-thumb.component';
import { AdminProductsApi } from '../data/admin-products.api';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Product> };
const SIZE = 6;

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [RouterLink, BrlPipe, BadgeComponent, ButtonComponent, EmptyStateComponent, ModalComponent, PaginationComponent, ProductThumbComponent],
  template: `
    <div class="head page-head">
      <div><h1>Produtos</h1><p class="muted">Gerencie o catálogo da loja</p></div>
      <a uiButton variant="cta" routerLink="/admin/produtos/novo">+ Novo produto</a>
    </div>
    @if (actionError()) { <p class="alert error" role="alert">{{ actionError() }}</p> }

    <section class="card box">
      <div class="filters">
        <input class="input" type="search" placeholder="Buscar por nome..." aria-label="Buscar por nome" (input)="onSearch($event)" />
        <select class="input" aria-label="Categoria" (change)="onCategory($event)">
          <option value="">Categoria</option>@for (c of categories(); track c.id) { <option [value]="c.id">{{ c.name }}</option> }
        </select>
        <select class="input" aria-label="Status" (change)="onStatus($event)">
          <option value="">Status</option><option value="active">Ativo</option><option value="inactive">Inativo</option><option value="out">Sem estoque</option>
        </select>
      </div>

      @if (state(); as s) {
        @if (s.status === 'loading') { <div class="skeleton" style="height:360px"></div> }
        @else if (s.status === 'error') {
          <ui-empty-state icon="x" title="Não deu pra carregar os produtos" message="Tente de novo em instantes.">
            <button uiButton variant="cta" (click)="reload.set(reload() + 1)">Tentar de novo</button></ui-empty-state>
        } @else if (s.page.content.length === 0) {
          <ui-empty-state title="Nenhum produto encontrado" message="Ajuste a busca ou os filtros." />
        } @else {
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th class="w-thumb"></th><th>Nome</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Status</th><th></th></tr></thead>
              <tbody>
                @for (p of s.page.content; track p.id) {
                  <tr>
                    <td><span class="thumb"><ui-product-thumb [seed]="p.id" [imageUrl]="p.imageUrl" [iconSize]="18" /></span></td>
                    <td><b>{{ shortName(p) }}</b></td>
                    <td>{{ p.category.name }}</td>
                    <td><b>{{ p.price | brl }}</b>@if (p.originalPrice) { <s>{{ p.originalPrice | brl }}</s> }</td>
                    <td>{{ p.stock }}</td>
                    <td>
                      @if (!p.active) { <ui-badge tone="neutral">Inativo</ui-badge> }
                      @else if (p.stock === 0) { <ui-badge tone="warn">Sem estoque</ui-badge> }
                      @else { <ui-badge tone="ok">Ativo</ui-badge> }
                    </td>
                    <td class="actions">
                      <a uiButton variant="outline" size="sm" [routerLink]="['/admin/produtos', p.id, 'editar']">Editar</a>
                      <button uiButton variant="danger" size="sm" type="button" [disabled]="!p.active" (click)="toDelete.set(p)">Excluir</button>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
          <footer>
            <span class="muted">Mostrando {{ from(s.page) }}–{{ to(s.page) }} de {{ s.page.totalElements }}</span>
            <ui-pagination [page]="page()" [totalPages]="s.page.totalPages" (pageChange)="page.set($event)" />
          </footer>
        }
      }
    </section>

    <ui-modal [open]="toDelete() !== null" title="Excluir produto?" (closed)="toDelete.set(null)">
      "{{ toDelete() ? shortName(toDelete()!) : '' }}" vai ficar inativo e deixa de aparecer na loja. Você pode reativá-lo depois editando o produto.
      <ng-container actions>
        <button uiButton variant="line" (click)="toDelete.set(null)">Cancelar</button>
        <button uiButton variant="cta" [disabled]="deleting()" (click)="confirmDelete()">{{ deleting() ? 'Excluindo…' : 'Excluir' }}</button>
      </ng-container>
    </ui-modal>`,
  styles: [`
    :host { display: grid; gap: 20px; align-content: start; } .head p { margin-top: 2px; }
    .box { padding: 16px; display: grid; gap: 14px; } .filters { display: grid; grid-template-columns: 1fr 190px 190px; gap: 12px; }
    .thumb { display: block; width: 42px; height: 42px; border-radius: 6px; overflow: hidden; } .w-thumb { width: 70px; }
    td s { display: block; font-size: 11px; color: var(--muted); } .actions { display: flex; gap: 8px; justify-content: flex-end; white-space: nowrap; }
    footer { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; font-size: 13px; }
    @media (max-width: 640px) { .filters { grid-template-columns: 1fr; } }
  `],
})
export class AdminProductsPage {
  private readonly api = inject(AdminProductsApi);
  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

  protected readonly q = signal('');
  protected readonly cat = signal<number | null>(null);
  protected readonly statusFilter = signal('');
  protected readonly page = signal(1);
  protected readonly reload = signal(0);
  protected readonly toDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);
  protected readonly actionError = signal('');

  protected readonly state = toSignal(
    toObservable(computed(() => ({ q: this.q(), cat: this.cat(), st: this.statusFilter(), page: this.page(), r: this.reload() }))).pipe(
      debounceTime(200),
      switchMap((f): Observable<State> =>
        this.api.list({ page: f.page - 1, size: SIZE, search: f.q, category: f.cat, status: f.st }).pipe(
          map((page): State => ({ status: 'ok', page })), startWith<State>({ status: 'loading' }), catchError(() => of<State>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as State },
  );

  protected shortName(p: Product): string { return p.name.split(' · ')[0]; }
  protected from(p: Page<Product>): number { return p.totalElements === 0 ? 0 : p.page * p.size + 1; }
  protected to(p: Page<Product>): number { return Math.min(p.totalElements, (p.page + 1) * p.size); }

  protected onSearch(e: Event): void { this.q.set((e.target as HTMLInputElement).value.trim()); this.page.set(1); }
  protected onCategory(e: Event): void { this.cat.set(Number((e.target as HTMLSelectElement).value) || null); this.page.set(1); }
  protected onStatus(e: Event): void { this.statusFilter.set((e.target as HTMLSelectElement).value); this.page.set(1); }

  protected confirmDelete(): void {
    const p = this.toDelete(); if (!p) return;
    this.deleting.set(true); this.actionError.set('');
    this.api.remove(p.id).subscribe({
      next: () => { this.deleting.set(false); this.toDelete.set(null); this.reload.set(this.reload() + 1); },
      error: () => { this.deleting.set(false); this.toDelete.set(null); this.actionError.set('Não foi possível excluir o produto.'); },
    });
  }
}
