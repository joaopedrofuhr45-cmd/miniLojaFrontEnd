import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../../../shared/ui/logo/logo.component';
import { AuthStore } from '../../../../core/auth/services/auth.store';

/** Sidebar do admin. Resumo, Categorias e Usuários ainda não têm tela (v2). */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  templateUrl: './admin-shell.component.html',
  styleUrl: './admin-shell.component.scss',
})
export class AdminShellComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  protected logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
