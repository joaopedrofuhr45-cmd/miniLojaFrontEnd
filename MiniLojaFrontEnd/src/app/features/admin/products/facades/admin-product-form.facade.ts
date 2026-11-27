import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, firstValueFrom, map, of, switchMap, tap } from 'rxjs';
import { CategoriesService } from '@core/catalog/services/categories.service';
import { Product } from '@shared/models/product';
import { ServerError, toServerError } from '@shared/utils/server-error';
import { AdminProductRequest, AdminProductsService } from '../services/admin-products.service';

/** Mesma tela para criar (/novo) e editar (/:id/editar): com :id carrega o produto e faz PUT; sem :id faz POST. */
@Injectable()
export class AdminProductFormFacade {
  private readonly admin = inject(AdminProductsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly categories = inject(CategoriesService).categories;
  readonly busy = signal(false);
  readonly loading = signal(false);
  readonly error = signal('');

  /** Parâmetro de rota :id. Ausente = novo produto. */
  readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), { initialValue: this.route.snapshot.paramMap.get('id') });

  /** Produto carregado para edição (null enquanto carrega ou no modo "novo"). */
  readonly product = toSignal(
    this.route.paramMap.pipe(
      map((p) => p.get('id')),
      switchMap((id) => {
        if (!id) return of(null);
        this.loading.set(true);
        return this.admin.get(+id).pipe(
          tap(() => this.loading.set(false)),
          catchError(() => { this.loading.set(false); this.error.set('Não foi possível carregar o produto.'); return of(null); }),
        );
      }),
    ),
    { initialValue: null as Product | null },
  );

  async save(body: AdminProductRequest): Promise<ServerError | null> {
    this.error.set('');
    this.busy.set(true);
    const id = this.id();
    try {
      await firstValueFrom(id ? this.admin.update(+id, body) : this.admin.create(body));
      this.router.navigate(['/admin/produtos']);
      return null;
    } catch (e) {
      const err = toServerError(e as HttpErrorResponse, 'Não foi possível salvar o produto.');
      this.error.set(err.message);
      this.busy.set(false);
      return err;
    }
  }
}
