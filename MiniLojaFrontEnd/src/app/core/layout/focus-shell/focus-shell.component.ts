import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterOutlet } from '@angular/router';
import { IconComponent } from '@shared/ui/icon/icon.component';
import { LogoComponent } from '@shared/ui/logo/logo.component';
import { ShopFooterComponent } from '../shop-footer/shop-footer.component';

/**
 * Layout enxuto (sem busca nem menu) para checkout e login/cadastro.
 * O texto do canto direito vem de `data: { note, icon }` na rota que usa o shell.
 */
@Component({
  selector: 'app-focus-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, IconComponent, LogoComponent, ShopFooterComponent],
  templateUrl: './focus-shell.component.html',
  styleUrl: './focus-shell.component.scss',
})
export class FocusShellComponent {
  private readonly data = inject(ActivatedRoute).snapshot.data;
  protected readonly note: string = this.data['note'] ?? '';
  protected readonly icon: string | null = this.data['icon'] ?? null;
}
