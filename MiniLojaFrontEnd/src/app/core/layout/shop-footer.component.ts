import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../../shared/ui/logo.component';

@Component({
  selector: 'app-shop-footer',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  template: `
    <footer>
      <div class="container cols">
        <div class="about">
          <ui-logo on="light" />
          <p>Projeto de portfólio. Compre com segurança e acompanhe seus pedidos.</p>
          <div class="chips"><span>PIX</span><span>CARTÃO</span><span>BOLETO</span></div>
        </div>
        <nav aria-label="Institucional"><h3>Institucional</h3><a href="#">Sobre a loja</a><a href="#">Contato</a><a href="#">Termos de uso</a></nav>
        <nav aria-label="Ajuda"><h3>Ajuda</h3><a href="#">Como comprar</a><a href="#">Entrega e frete</a><a href="#">Trocas e devoluções</a></nav>
        <nav aria-label="Minha conta"><h3>Minha conta</h3><a routerLink="/pedidos">Meus pedidos</a><a href="#">Favoritos</a><a routerLink="/entrar">Entrar</a></nav>
      </div>
      <div class="container bottom"><span>© {{ year }} MiniLoja</span><span>Privacidade · Cookies</span></div>
    </footer>`,
  styles: [`
    footer { background: #fff; margin-top: auto; padding: 32px 0 20px; }
    .cols { display: grid; grid-template-columns: 1.6fr 1fr 1fr 1fr; gap: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--line); }
    .about p { margin: 12px 0; max-width: 360px; color: var(--ink2); }
    .chips { display: flex; gap: 8px; } .chips span { padding: 3px 8px; border: 1px solid #cfcfcf; border-radius: 3px; font-size: 10px; font-weight: 600; color: var(--ink2); }
    nav { display: grid; gap: 8px; align-content: start; } h3 { font-size: 13px; font-weight: 600; margin-bottom: 4px; }
    nav a { color: var(--ink2); font-size: 13px; }
    .bottom { display: flex; justify-content: space-between; padding-top: 16px; font-size: 12px; color: var(--muted); }
    @media (max-width: 768px) { .cols { grid-template-columns: 1fr 1fr; } .about { grid-column: 1 / -1; } }
  `],
})
export class ShopFooterComponent {
  protected readonly year = new Date().getFullYear();
}
