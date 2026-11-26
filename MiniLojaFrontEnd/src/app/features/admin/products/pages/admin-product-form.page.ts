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
  template: `
    <nav class="breadcrumb" aria-label="Você está aqui"><a routerLink="/admin/produtos">Produtos</a><span aria-current="page">{{ id() ? 'Editar produto' : 'Novo produto' }}</span></nav>
    <form [formGroup]="form" (ngSubmit)="save()" novalidate>
      <div class="page-head">
        <h1>{{ id() ? 'Editar produto' : 'Novo produto' }}</h1>
        <div class="btns">
          <a uiButton variant="line" routerLink="/admin/produtos">Cancelar</a>
          <button uiButton variant="cta" type="submit" [disabled]="busy() || loading()">{{ busy() ? 'Salvando…' : 'Salvar produto' }}</button>
        </div>
      </div>
      @if (error()) { <p class="alert error" role="alert">{{ error() }}</p> }

      <div class="cols">
        <section class="card box">
          <div class="field"><label for="name">Nome *</label><input id="name" formControlName="name" placeholder="Nome do produto" />
            @if (err('name'); as m) { <span class="error">{{ m }}</span> }</div>
          <div class="field"><label for="description">Descrição</label><textarea id="description" rows="5" formControlName="description" placeholder="Descrição completa do produto..."></textarea></div>
          <div class="two">
            <div class="field"><label for="price">Preço (R$) *</label><input id="price" type="number" step="0.01" min="0" formControlName="price" placeholder="0,00" />
              @if (err('price'); as m) { <span class="error">{{ m }}</span> }</div>
            <div class="field"><label for="original">Preço original (opcional)</label><input id="original" type="number" step="0.01" min="0" formControlName="originalPrice" placeholder="0,00" />
              <span class="hint">Se preenchido, a loja mostra o % OFF</span></div>
            <div class="field"><label for="stock">Estoque *</label><input id="stock" type="number" step="1" min="0" formControlName="stock" placeholder="0" />
              @if (err('stock'); as m) { <span class="error">{{ m }}</span> }</div>
            <div class="field"><label for="category">Categoria *</label>
              <select id="category" formControlName="categoryId"><option [ngValue]="null">Selecione</option>@for (c of categories(); track c.id) { <option [ngValue]="c.id">{{ c.name }}</option> }</select>
              @if (err('categoryId'); as m) { <span class="error">{{ m }}</span> }</div>
          </div>
          <div class="field"><span class="lbl">Status</span>
            <label class="toggle"><input type="checkbox" formControlName="active" /><span class="pill" [class.off]="!form.controls.active.value">{{ form.controls.active.value ? 'Ativo' : 'Inativo' }}</span>
              <span class="hint">Produtos inativos não aparecem na loja</span></label></div>
        </section>

        <section class="card box side">
          <h2>Imagem</h2>
          <div class="drop">
            @if (form.controls.imageUrl.value) { <ui-product-thumb [seed]="id() ? +id()! : 1" [imageUrl]="form.controls.imageUrl.value" alt="Pré-visualização" /> }
            @else { <ui-icon name="upload" [size]="34" [stroke]="1.5" /><b>Cole o link da imagem abaixo</b><small>PNG ou JPG, hospedada em um endereço público</small> }
          </div>
          <div class="field"><label for="imageUrl">URL da imagem</label><input id="imageUrl" type="url" formControlName="imageUrl" placeholder="https://..." /></div>
          <p class="hint">No MVP: campo imageUrl (upload fica para a v2).</p>
        </section>
      </div>
    </form>`,
  styles: [`
    :host { display: grid; gap: 14px; align-content: start; } form { display: grid; gap: 16px; } .btns { display: flex; gap: 10px; }
    .cols { display: grid; grid-template-columns: minmax(0, 1fr) 350px; gap: 24px; align-items: start; }
    .box { padding: 26px; display: grid; gap: 18px; } h2 { font-size: 18px; font-weight: 600; }
    .two { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; } .lbl { font-size: 12px; font-weight: 600; }
    .toggle { display: flex; align-items: center; gap: 10px; cursor: pointer; font-weight: 400 !important; } .toggle input { position: absolute; opacity: 0; }
    .pill { padding: 4px 12px; border-radius: 999px; background: var(--ok-soft); color: var(--ok); font-weight: 700; font-size: 12px; } .pill.off { background: #ececec; color: var(--ink2); }
    .toggle input:focus-visible + .pill { outline: 2px solid var(--brand); outline-offset: 2px; }
    .drop { display: grid; place-items: center; align-content: center; gap: 6px; min-height: 190px; border: 2px dashed #c4c8d4; border-radius: 8px; background: #f6f7f9; color: var(--brand); text-align: center; overflow: hidden; }
    .drop b { color: var(--ink); } .drop small { color: var(--muted); }
    @media (max-width: 960px) { .cols, .two { grid-template-columns: 1fr; } }
  `],
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
