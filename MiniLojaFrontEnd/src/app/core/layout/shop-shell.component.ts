import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, of } from 'rxjs';
import { BrlPipe } from '../../shared/pipes/brl.pipe';
import { Category } from '../../shared/models/category';
import { IconComponent } from '../../shared/ui/icon.component';
import { LogoComponent } from '../../shared/ui/logo.component';
import { AuthStore } from '../auth/auth.store';
import { CartStore } from '../cart/cart.store';
import { CategoriesApi } from '../catalog/categories.api';
import { StoreInfoStore } from '../store-info/store-info.store';
import { ShopFooterComponent } from './shop-footer.component';

/** Layout da loja: faixa de benefícios, header com busca, menu de categorias, conteúdo e footer. */
@Component({
  selector: 'app-shop-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, BrlPipe, IconComponent, LogoComponent, ShopFooterComponent],
  template: `
    <div class="strip">
      <b>Frete grátis</b>&nbsp;em compras acima de {{ info().freeShippingThreshold | brl: 0 }}&nbsp;·&nbsp;Parcele em até&nbsp;<b>{{ info().maxInstallments }}x sem juros</b>
    </div>
    <header class="hdr">
      <div class="container row">
        <a routerLink="/" class="logo" aria-label="MiniLoja — início"><ui-logo /></a>
        <form class="search" role="search" (submit)="search($event, q.value)">
          <input #q type="search" name="q" placeholder="Buscar produtos, categorias e muito mais…" aria-label="Buscar produtos" />
          <button type="submit" aria-label="Buscar"><ui-icon name="search" [size]="18" /></button>
        </form>
        <nav class="actions" aria-label="Conta">
          <div class="account">
            @if (auth.isLoggedIn()) {
              <button type="button" class="acc-btn"><strong>Olá, {{ auth.firstName() }}</strong><small>Minha conta ▾</small></button>
              <div class="menu">
                <a routerLink="/pedidos">Meus pedidos</a>
                @if (auth.isAdmin()) { <a routerLink="/admin/produtos">Painel admin</a> }
                <button type="button" (click)="logout()">Sair</button>
              </div>
            } @else {
              <a routerLink="/entrar" class="acc-btn"><strong>Entrar</strong><small>ou cadastre-se</small></a>
            }
          </div>
          <a routerLink="/pedidos" class="acc-btn"><strong>Meus</strong><small>pedidos</small></a>
          <a routerLink="/catalogo" class="icon" aria-label="Favoritos"><ui-icon name="heart" [size]="24" /></a>
          <a routerLink="/carrinho" class="icon" [attr.aria-label]="'Carrinho, ' + cart.count() + ' itens'">
            <ui-icon name="cart" [size]="26" />
            @if (cart.count() > 0) { <span class="count">{{ cart.count() }}</span> }
          </a>
        </nav>
      </div>
    </header>
    <nav class="menu-bar" aria-label="Categorias">
      <div class="container row">
        <a routerLink="/catalogo" class="all"><ui-icon name="menu" [size]="14" /> Categorias</a>
        @for (c of categories(); track c.id) {
          <a routerLink="/catalogo" [queryParams]="{ categoria: c.id }">{{ c.name }}</a>
        }
        <a routerLink="/catalogo" [queryParams]="{ desconto: 1 }" class="hot">Ofertas</a>
        <a routerLink="/catalogo" [queryParams]="{ ordem: 'lancamentos' }">Lançamentos</a>
        <a href="#" class="help">Ajuda</a>
      </div>
    </nav>
    <main><router-outlet /></main>
    <app-shop-footer />`,
  styles: [`
    :host { display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; }
    .strip { background: var(--brand-deep); color: #fff; text-align: center; font-size: 12px; padding: 6px 12px; }
    .hdr { background: var(--brand); } .row { display: flex; align-items: center; gap: 24px; }
    .hdr .row { height: 72px; }
    .search { flex: 1; display: flex; align-items: center; height: 44px; padding: 0 4px 0 20px; background: #fff; border-radius: 999px; box-shadow: 0 0 0 2px rgba(255,255,255,.25); }
    .search input { flex: 1; min-width: 0; height: 100%; border: 0; background: none; font: inherit; outline: none; }
    .search button { width: 36px; height: 36px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--cta); color: #fff; }
    .actions { display: flex; align-items: center; gap: 22px; color: #fff; }
    .actions a, .acc-btn { color: #fff; }
    .acc-btn { display: grid; background: none; border: 0; padding: 0; text-align: left; line-height: 1.25; }
    .acc-btn strong { font-size: 13px; } .acc-btn small { font-size: 11px; opacity: .85; }
    .icon { position: relative; display: inline-flex; }
    .count { position: absolute; top: -6px; right: -8px; min-width: 16px; height: 16px; padding: 0 4px; border-radius: 8px; background: var(--cta); font-size: 10px; font-weight: 700; display: grid; place-items: center; }
    .account { position: relative; }
    .menu { display: none; position: absolute; z-index: 20; top: 100%; left: 0; min-width: 160px; padding: 6px; background: #fff; border-radius: var(--radius); box-shadow: 0 6px 20px rgba(0,0,0,.18); }
    .account:hover .menu, .account:focus-within .menu { display: grid; }
    .menu a, .menu button { padding: 8px 10px; text-align: left; background: none; border: 0; color: var(--ink); font-size: 13px; border-radius: 4px; }
    .menu a:hover, .menu button:hover { background: var(--brand-soft); }
    .menu-bar { background: #fff; box-shadow: 0 1px 0 var(--line); }
    .menu-bar .row { height: 40px; gap: 28px; font-size: 13px; overflow-x: auto; white-space: nowrap; }
    .menu-bar a { color: var(--ink); } .menu-bar .all { display: inline-flex; align-items: center; gap: 6px; }
    .menu-bar .hot { color: var(--cta); font-weight: 600; } .menu-bar .help { margin-left: auto; }
    @media (max-width: 768px) {
      .hdr .row { flex-wrap: wrap; height: auto; padding: 10px 0; gap: 10px 16px; }
      .search { order: 3; flex-basis: 100%; } .actions { margin-left: auto; gap: 14px; } .acc-btn:not(.icon) { display: none; }
    }
  `],
})
export class ShopShellComponent {
  protected readonly auth = inject(AuthStore);
  protected readonly cart = inject(CartStore);
  private readonly router = inject(Router);
  protected readonly info = inject(StoreInfoStore).info;
  protected readonly categories = toSignal(inject(CategoriesApi).list().pipe(catchError(() => of([] as Category[]))), { initialValue: [] as Category[] });

  protected search(e: Event, term: string): void {
    e.preventDefault();
    this.router.navigate(['/catalogo'], { queryParams: { q: term.trim() || null } });
  }

  protected logout(): void { this.auth.logout(); this.router.navigate(['/']); }
}
