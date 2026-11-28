import { Component, input } from '@angular/core';

/**
 * Texto que troca no hover (ou no foco) do elemento clicável em que estiver:
 * <a href="..."><ui-swap text="Entrar" hover="Vamos lá" /></a>
 * Leitores de tela leem só o `text`; o `hover` é decorativo.
 */
@Component({
  selector: 'ui-swap',
  standalone: true,
  template: `<span class="a">{{ text() }}</span><span class="b" aria-hidden="true">{{ hover() }}</span>`,
  styleUrl: './swap.component.scss',
})
export class SwapComponent {
  readonly text = input.required<string>();
  readonly hover = input.required<string>();
}
