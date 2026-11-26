import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { IconComponent } from '../../shared/ui/icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { ShopFooterComponent } from './shop-footer.component';

/**
 * Layout enxuto (sem busca nem menu) para checkout e login/cadastro.
 * O texto do canto direito vem de `data: { note, icon }` na rota que usa o shell.
 */
@Component({
  selector: 'app-focus-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, IconComponent, LogoComponent, ShopFooterComponent],
  template: `
    <header>
      <div class="container row">
        <a routerLink="/" aria-label="MiniLoja — início"><ui-logo /></a>
        <span class="note">@if (icon) { <ui-icon [name]="icon" [size]="16" /> } {{ note }}</span>
      </div>
    </header>
    <main><router-outlet /></main>
    <app-shop-footer />`,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; } main { flex: 1; }
    header { background: var(--brand); } .row { display: flex; align-items: center; justify-content: space-between; height: 60px; }
    .note { display: inline-flex; align-items: center; gap: 6px; color: #fff; font-size: 13px; opacity: .92; }
  `],
})
export class FocusShellComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  protected readonly note: string = this.data['note'] ?? '';
  protected readonly icon: string | null = this.data['icon'] ?? null;
}
