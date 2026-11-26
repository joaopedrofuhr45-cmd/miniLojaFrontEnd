import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Category } from '../../../shared/models/category';
import { ProductThumbComponent } from '../../../shared/ui/product-thumb.component';

interface Shortcut { label: string; query: Record<string, string | number>; tint: number; }

@Component({
  selector: 'app-category-shortcuts',
  standalone: true,
  imports: [RouterLink, ProductThumbComponent],
  templateUrl: './category-shortcuts.component.html',
  styleUrl: './category-shortcuts.component.scss',
})
export class CategoryShortcutsComponent {
  readonly categories = input.required<Category[]>();
  protected readonly shortcuts = computed<Shortcut[]>(() => [
    ...this.categories().slice(0, 3).map((c, i): Shortcut => ({ label: c.name, query: { categoria: c.id }, tint: i + 1 })),
    { label: 'Ofertas', query: { desconto: 1 }, tint: 4 } as Shortcut,
    { label: 'Lançamentos', query: { ordem: 'lancamentos' }, tint: 6 } as Shortcut,
  ]);
}
