import { Injectable, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, firstValueFrom, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { AdminProductsService } from '../services/admin-products.service';

export type AdminProductListState = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Product> };
export const ADMIN_PRODUCTS_PAGE_SIZE = 6;

/** Admin · produtos: lista com busca/filtros/paginação e exclusão (soft delete). */
@Injectable()
export class AdminProductListFacade {
  private readonly admin = inject(AdminProductsService);

  readonly categories = inject(CategoriesService).categories;
  readonly q = signal('');
  readonly cat = signal<number | null>(null);
  readonly statusFilter = signal('');
  readonly page = signal(1);
  private readonly reload = signal(0);
  readonly deleting = signal(false);
  readonly actionError = signal('');

  readonly state = toSignal(
    toObservable(computed(() => ({ q: this.q(), cat: this.cat(), st: this.statusFilter(), page: this.page(), r: this.reload() }))).pipe(
      debounceTime(200),
      switchMap((f): Observable<AdminProductListState> =>
        this.admin.list({ page: f.page - 1, size: ADMIN_PRODUCTS_PAGE_SIZE, search: f.q, category: f.cat, status: f.st }).pipe(
          map((page): AdminProductListState => ({ status: 'ok', page })), startWith<AdminProductListState>({ status: 'loading' }), catchError(() => of<AdminProductListState>({ status: 'error' })),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as AdminProductListState },
  );

  retry(): void { this.reload.update((n) => n + 1); }
  setSearch(v: string): void { this.q.set(v.trim()); this.page.set(1); }
  setCategory(id: number | null): void { this.cat.set(id); this.page.set(1); }
  setStatus(v: string): void { this.statusFilter.set(v); this.page.set(1); }
  setPage(p: number): void { this.page.set(p); }

  async remove(p: Product): Promise<void> {
    this.deleting.set(true); this.actionError.set('');
    try {
      await firstValueFrom(this.admin.remove(p.id));
      this.retry();
    } catch {
      this.actionError.set('Não foi possível excluir o produto.');
    } finally {
      this.deleting.set(false);
    }
  }
}
