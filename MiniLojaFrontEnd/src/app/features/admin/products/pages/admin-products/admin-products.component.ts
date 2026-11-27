import { AdminProductListFacade } from '../../facades/admin-product-list.facade';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Page } from '@shared/models/page';
import { Product } from '@shared/models/product';
import { BrlPipe } from '@shared/pipes/brl/brl.pipe';
import { BadgeComponent } from '@shared/ui/badge/badge.component';
import { ButtonComponent } from '@shared/ui/button/button.component';
import { EmptyStateComponent } from '@shared/ui/empty-state/empty-state.component';
import { ModalComponent } from '@shared/ui/modal/modal.component';
import { PaginationComponent } from '@shared/ui/pagination/pagination.component';
import { ProductThumbComponent } from '@shared/ui/product-thumb/product-thumb.component';


@Component({
  selector: 'app-admin-products-page',
  standalone: true,
  imports: [RouterLink, BrlPipe, BadgeComponent, ButtonComponent, EmptyStateComponent, ModalComponent, PaginationComponent, ProductThumbComponent],
  providers: [AdminProductListFacade],
  templateUrl: './admin-products.component.html',
  styleUrl: './admin-products.component.scss',
})
export class AdminProductsComponent {
  private readonly list = inject(AdminProductListFacade);

  protected readonly categories = this.list.categories;
  protected readonly state = this.list.state;
  protected readonly page = this.list.page;
  protected readonly deleting = this.list.deleting;
  protected readonly actionError = this.list.actionError;
  protected readonly toDelete = signal<Product | null>(null); // produto no modal de confirmação

  protected retry(): void { this.list.retry(); }
  protected setPage(p: number): void { this.list.setPage(p); }

  protected shortName(p: Product): string { return p.name.split(' · ')[0]; }
  protected from(p: Page<Product>): number { return p.totalElements === 0 ? 0 : p.page * p.size + 1; }
  protected to(p: Page<Product>): number { return Math.min(p.totalElements, (p.page + 1) * p.size); }

  protected onSearch(e: Event): void { this.list.setSearch((e.target as HTMLInputElement).value); }
  protected onCategory(e: Event): void { this.list.setCategory(Number((e.target as HTMLSelectElement).value) || null); }
  protected onStatus(e: Event): void { this.list.setStatus((e.target as HTMLSelectElement).value); }

  protected async confirmDelete(): Promise<void> {
    const p = this.toDelete(); if (!p) return;
    await this.list.remove(p);
    this.toDelete.set(null);
  }
}
