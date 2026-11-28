import { Component, input } from '@angular/core';

export type ButtonVariant = 'cta' | 'outline' | 'line' | 'ghost' | 'danger';

/**
 * Uso: <button uiButton variant="cta">Comprar</button> ou <a uiButton ...>
 * `hoverText` (opcional): texto que entra no lugar do rótulo quando o mouse passa ou o botão recebe foco.
 */
@Component({
  selector: 'button[uiButton], a[uiButton]',
  standalone: true,
  templateUrl: './button.component.html',
  host: { '[attr.data-variant]': 'variant()', '[attr.data-size]': 'size()', '[class.block]': 'block()', '[class.has-swap]': 'hoverText()' },
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('outline');
  readonly size = input<'sm' | 'md' | 'lg'>('md');
  readonly block = input(false);
  readonly hoverText = input('');
}
