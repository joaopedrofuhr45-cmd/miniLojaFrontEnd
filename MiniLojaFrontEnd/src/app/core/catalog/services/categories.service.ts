import { HttpClient } from '@angular/common/http';
import { Injectable, Injector, Signal, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { environment } from '@environment/environment';
import { Category } from '@shared/models/category';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private readonly http = inject(HttpClient);
  private readonly injector = inject(Injector);
  private cached?: Signal<Category[]>;

  list() { return this.http.get<Category[]>(`${environment.apiUrl}/categories`); }

  /** Categorias como signal, carregadas uma vez (na primeira leitura) e compartilhadas; falha vira lista vazia. */
  get categories(): Signal<Category[]> {
    return (this.cached ??= toSignal(this.list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[], injector: this.injector }));
  }
}
