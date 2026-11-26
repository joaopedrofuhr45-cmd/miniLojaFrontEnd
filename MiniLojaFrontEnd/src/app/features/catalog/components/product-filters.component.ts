import { Component, input, output } from '@angular/core';
import { Category } from '../../../shared/models/category';

export type FilterChange = Record<string, string | number | null>;

/** Sidebar do catálogo: categoria, faixa de preço e "somente com desconto". Só emite o que mudou. */
@Component({
  selector: 'app-product-filters',
  standalone: true,
  template: `
    <section>
      <h2>Categorias</h2>
      <button type="button" class="opt" [class.active]="!categoria()" (click)="filtersChange.emit({ categoria: null, page: null })">Todas</button>
      @for (c of categories(); track c.id) {
        <button type="button" class="opt" [class.active]="categoria() === c.id" (click)="filtersChange.emit({ categoria: c.id, page: null })">
          {{ c.name }}@if (c.productCount !== undefined) { ({{ c.productCount }}) }
        </button>
      }
    </section>
    <section>
      <h2>Preço</h2>
      <form class="price" (submit)="applyPrice($event, min.value, max.value)">
        <input #min type="number" min="0" inputmode="decimal" placeholder="Mín" aria-label="Preço mínimo" [value]="de() ?? ''" />
        <span>–</span>
        <input #max type="number" min="0" inputmode="decimal" placeholder="Máx" aria-label="Preço máximo" [value]="ate() ?? ''" />
        <button type="submit" aria-label="Aplicar faixa de preço">›</button>
      </form>
    </section>
    <section>
      <h2>Ofertas</h2>
      <label class="check"><input type="checkbox" [checked]="desconto()" (change)="filtersChange.emit({ desconto: desconto() ? null : 1, page: null })" /> Somente com desconto</label>
    </section>`,
  styles: [`
    :host { display: grid; gap: 0; }
    section { display: grid; gap: 4px; padding: 14px 0; border-top: 1px solid var(--line); } section:first-child { border-top: 0; padding-top: 0; }
    h2 { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
    .opt { background: none; border: 0; padding: 4px 0; text-align: left; color: var(--ink2); } .opt:hover { color: var(--brand); }
    .opt.active { color: var(--ink); font-weight: 600; }
    .price { display: flex; align-items: center; gap: 6px; }
    .price input { width: 70px; height: 34px; padding: 0 8px; border: 1px solid #c9c9c9; border-radius: var(--radius); font: inherit; }
    .price button { width: 30px; height: 34px; border: 1px solid var(--brand); border-radius: var(--radius); background: var(--brand-soft); color: var(--brand); font-weight: 700; }
    .check { display: flex; align-items: center; gap: 8px; color: var(--ink2); cursor: pointer; }
  `],
})
export class ProductFiltersComponent {
  readonly categories = input.required<Category[]>();
  readonly categoria = input<number | null>(null);
  readonly de = input<number | null>(null);
  readonly ate = input<number | null>(null);
  readonly desconto = input(false);
  readonly filtersChange = output<FilterChange>();

  protected applyPrice(e: Event, min: string, max: string): void {
    e.preventDefault();
    this.filtersChange.emit({ de: min === '' ? null : Number(min), ate: max === '' ? null : Number(max), page: null });
  }
}
