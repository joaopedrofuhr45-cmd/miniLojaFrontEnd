import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** [fundo, traço] — o ciclo bate com as telas do Figma (Produto 01 = índigo, 02 = rosa...). */
const TINTS: [string, string][] = [
  '#8a9e7b', '#e8a478', '#9bb08b', '#eaaa81', '#86a08f', '#d9a77f', '#a3b894', '#e3b08a',
].map((c): [string, string] => [`color-mix(in oklab, ${c} 22%, var(--surface))`, c]);

/** Mostra a imagem do produto ou, sem imagem, o placeholder colorido com o cubo. */
@Component({
  selector: 'ui-product-thumb',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './product-thumb.component.html',
  host: { '[style.background]': 'tint()[0]', '[style.color]': 'tint()[1]' },
  styleUrl: './product-thumb.component.scss',
})
export class ProductThumbComponent {
  readonly seed = input.required<number>();
  readonly imageUrl = input<string | null>(null);
  readonly alt = input('');
  readonly iconSize = input(48);
  protected readonly tint = computed(() => TINTS[(this.seed() - 1 + TINTS.length) % TINTS.length]);
}
