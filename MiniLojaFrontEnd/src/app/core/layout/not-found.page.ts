import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonComponent } from '../../shared/ui/button.component';
import { EmptyStateComponent } from '../../shared/ui/empty-state.component';

@Component({
  selector: 'app-not-found-page',
  standalone: true,
  imports: [RouterLink, ButtonComponent, EmptyStateComponent],
  template: `
    <div class="container page">
      <ui-empty-state icon="search" title="Página não encontrada" message="O endereço não existe ou o conteúdo foi removido.">
        <a uiButton variant="cta" routerLink="/">Voltar para a home</a>
      </ui-empty-state>
    </div>`,
})
export class NotFoundPage {}
