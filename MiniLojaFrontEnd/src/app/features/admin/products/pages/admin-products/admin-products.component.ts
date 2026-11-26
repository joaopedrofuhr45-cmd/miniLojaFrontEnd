import { Component, computed, inject, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, debounceTime, map, Observable, of, startWith, switchMap } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { Category } from '@shared/models/category';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';
import { AdminProductsService } from '../../services/admin-products.service';

type State = { status: 'loading' } | { status: 'error' } | { status: 'ok'; page: Page<Product> };
const SIZE = 6;

@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [RouterLink, BrlPipe, BadgeComponent, ButtonComponent, EmptyStateComponent, ModalComponent, PaginationComponent, ProductThumbComponent],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent {
  private readonly api = inject(AdminProductsService);
  protected readonly categories = toSignal(inject(CategoriesService).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

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
