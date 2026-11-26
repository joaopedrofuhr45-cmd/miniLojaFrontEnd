import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';
import { AuthStore } from '../auth/auth.store';

/** Sidebar do admin. Resumo, Categorias e Usuários ainda não têm tela (v2). */
@Component({
  selector: 'app-admin-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, LogoComponent],
  template: `
    <aside>
      <div class="brand"><ui-logo /><small>admin</small></div>
      <p class="group">GERENCIAR</p>
      <a class="item off" aria-disabled="true" title="Em breve">Resumo</a>
      <a class="item" routerLink="/admin/produtos" routerLinkActive="active">Produtos</a>
      <a class="item off" aria-disabled="true" title="Em breve">Categorias</a>
      <a class="item" routerLink="/admin/pedidos" routerLinkActive="active">Pedidos</a>
      <a class="item off" aria-disabled="true" title="Em breve">Usuários</a>
      <p class="group">CONTA</p>
      <a class="item" routerLink="/">Voltar à loja</a>
      <button class="item" type="button" (click)="logout()">Sair</button>
    </aside>
    <main><router-outlet /></main>`,
  styles: [`
    :host { display: grid; grid-template-columns: 253px 1fr; min-height: 100vh; }
    aside { background: var(--brand-deep); color: #fff; padding: 28px 16px; display: flex; flex-direction: column; gap: 2px; }
    .brand { display: flex; align-items: baseline; gap: 4px; padding: 0 8px 22px; } .brand ui-logo { font-size: 24px; } .brand small { font-size: 11px; opacity: .75; }
    .group { padding: 14px 12px 6px; font-size: 11px; letter-spacing: .04em; color: rgba(255,255,255,.55); }
    .item { display: block; width: 100%; padding: 10px 12px; border: 0; border-radius: 8px; background: none; color: #fff; text-align: left; font-size: 14px; cursor: pointer; }
    .item:hover:not(.off) { background: rgba(255,255,255,.08); } .item.active { background: var(--brand); font-weight: 600; }
    .item.off { opacity: .55; cursor: not-allowed; }
    main { padding: 28px 32px 48px; min-width: 0; }
    @media (max-width: 900px) { :host { grid-template-columns: 1fr; } aside { flex-direction: row; flex-wrap: wrap; padding: 12px; } .group, .brand small { display: none; } .item { width: auto; } }
  `],
})
export class AdminShellComponent {
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  protected logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
