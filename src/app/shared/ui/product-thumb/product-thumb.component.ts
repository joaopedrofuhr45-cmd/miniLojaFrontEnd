import { Component, computed, input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

/** [fundo, traço] — o ciclo bate com as telas do Figma (Produto 01 = índigo, 02 = rosa...). */
const TINTS: [string, string][] = [
  ['#2b3527', '#7c8f6e'], ['#35302a', '#e39a6a'], ['#273127', '#8fa67f'], ['#38312a', '#eaaa81'],
  ['#2a352f', '#86a08f'], ['#332f28', '#d9a77f'], ['#2e3a28', '#9bb08b'], ['#3a322b', '#e3b08a'],
];

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
