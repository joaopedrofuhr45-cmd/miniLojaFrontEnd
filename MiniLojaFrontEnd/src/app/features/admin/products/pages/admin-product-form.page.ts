import { HttpErrorResponse } from '@angular/common/http';
import { Component, effect, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { catchError, of } from 'rxjs';
import { CategoriesApi } from '../../../../core/catalog/categories.api';
import { ApiError } from '../../../../shared/models/api-error';
import { Category } from '../../../../shared/models/category';
import { ButtonComponent } from '../../../../shared/ui/button.component';
import { IconComponent } from '../../../../shared/ui/icon.component';
import { ProductThumbComponent } from '../../../../shared/ui/product-thumb.component';
import { AdminProductRequest, AdminProductsApi } from '../data/admin-products.api';

const MESSAGES: Record<string, string> = { required: 'Campo obrigatório', min: 'Valor inválido', };

/** Mesmo componente para criar (/novo) e editar (/:id/editar): se tem :id carrega e faz PUT; senão POST. */
@Component({
  selector: 'app-admin-product-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, IconComponent, ProductThumbComponent],
  templateUrl: './admin-product-form.page.html',
  styleUrl: './admin-product-form.page.scss',
})
export class AdminProductFormPage {
  /** Parâmetro de rota :id (withComponentInputBinding). Ausente = novo produto. */
  readonly id = input<string>();
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(AdminProductsApi);
  private readonly router = inject(Router);
  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

  protected readonly busy = signal(false);
  protected readonly loading = signal(false);
  protected readonly error = signal('');

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [null as number | null, [Validators.required, Validators.min(0.01)]],
    originalPrice: [null as number | null],
    stock: [0 as number | null, [Validators.required, Validators.min(0)]],
    categoryId: [null as number | null, Validators.required],
    imageUrl: [''],
    active: [true],
  });

  constructor() {
    effect(() => {
      const id = this.id();
      if (!id) return;
      this.loading.set(true);
      this.api.get(+id).subscribe({
        next: (p) => {
          this.form.patchValue({ ...p, categoryId: p.category.id, imageUrl: p.imageUrl ?? '', description: p.description ?? '' });
          this.loading.set(false);
        },
        error: () => { this.loading.set(false); this.error.set('Não foi possível carregar o produto.'); },
      });
    }, { allowSignalWrites: true });
  }

  protected err(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.touched || !c.errors) return '';
    return c.errors['server'] ?? MESSAGES[Object.keys(c.errors)[0]] ?? 'Valor inválido';
  }

  protected save(): void {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const body: AdminProductRequest = {
      name: v.name.trim(), description: v.description, price: v.price!, originalPrice: v.originalPrice || null,
      stock: v.stock!, categoryId: v.categoryId!, imageUrl: v.imageUrl.trim() || null, active: v.active,
    };
    this.busy.set(true);
    const id = this.id();
    (id ? this.api.update(+id, body) : this.api.create(body)).subscribe({
      next: () => this.router.navigate(['/admin/produtos']),
      error: (e: HttpErrorResponse) => {
        this.busy.set(false);
        const api = e.error as Partial<ApiError> | null;
        api?.fields?.forEach((f) => this.form.get(f.field)?.setErrors({ server: f.message }));
        this.form.markAllAsTouched();
        this.error.set(e.status === 0 ? 'Sem conexão com o servidor.' : (api?.message ?? 'Não foi possível salvar o produto.'));
      },
    });
  }
}
