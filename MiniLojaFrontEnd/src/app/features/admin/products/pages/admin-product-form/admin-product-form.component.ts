import { AdminProductFormFacade } from '../../facades/admin-product-form.facade';
import { Component, effect, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';

const MESSAGES: Record<string, string> = { required: 'Campo obrigatório', min: 'Valor inválido', };

/** Mesmo componente para criar (/novo) e editar (/:id/editar): se tem :id carrega e faz PUT; senão POST. */
@Component({
  selector: 'app-admin-product-form-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ButtonComponent, IconComponent, ProductThumbComponent],
  providers: [AdminProductFormFacade],
  templateUrl: './admin-product-form.component.html',
  styleUrl: './admin-product-form.component.scss',
})
export class AdminProductFormComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly facade = inject(AdminProductFormFacade);

  protected readonly id = this.facade.id;
  protected readonly categories = this.facade.categories;
  protected readonly busy = this.facade.busy;
  protected readonly loading = this.facade.loading;
  protected readonly error = this.facade.error;

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
    // edição: preenche o formulário quando o produto chega do back
    effect(() => {
      const p = this.facade.product();
      if (p) this.form.patchValue({ ...p, categoryId: p.category.id, imageUrl: p.imageUrl ?? '', description: p.description ?? '' });
    });
  }

  protected err(name: keyof typeof this.form.controls): string {
    const c = this.form.controls[name];
    if (!c.touched || !c.errors) return '';
    return c.errors['server'] ?? MESSAGES[Object.keys(c.errors)[0]] ?? 'Valor inválido';
  }

  protected async save(): Promise<void> {
    this.error.set('');
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const fail = await this.facade.save({
      name: v.name.trim(), description: v.description, price: v.price!, originalPrice: v.originalPrice || null,
      stock: v.stock!, categoryId: v.categoryId!, imageUrl: v.imageUrl.trim() || null, active: v.active,
    });
    if (!fail) return;
    fail.fields.forEach((f) => this.form.get(f.field)?.setErrors({ server: f.message }));
    this.form.markAllAsTouched();
  }
}
