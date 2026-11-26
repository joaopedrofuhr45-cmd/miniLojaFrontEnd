import { Component, computed, input } from '@angular/core';
import { IconComponent } from './icon.component';

/** [fundo, traço] — o ciclo bate com as telas do Figma (Produto 01 = índigo, 02 = rosa...). */
const TINTS: [string, string][] = [
  ['#e9ebfb', '#6c74f0'], ['#fceaf3', '#ec4c9b'], ['#e6f5ee', '#2dbe85'], ['#fff6e0', '#f59e0b'],
  ['#e8f1ff', '#38b6f5'], ['#efeafd', '#8b6cf0'], ['#fdecea', '#ef5a6f'], ['#e3f6f2', '#2dcdb5'],
];

/** Mostra a imagem do produto ou, sem imagem, o placeholder colorido com o cubo. */
@Component({
  selector: 'ui-product-thumb',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (imageUrl()) { <img [src]="imageUrl()" [alt]="alt()" /> }
    @else { <ui-icon name="cube" [size]="iconSize()" [stroke]="1.5" /> }`,
  host: { '[style.background]': 'tint()[0]', '[style.color]': 'tint()[1]' },
  styles: [`
    :host { display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; overflow: hidden; }
    img { width: 100%; height: 100%; object-fit: cover; }
  `],
})
export class ProductThumbComponent {
  readonly seed = input.required<number>();
  readonly imageUrl = input<string | null>(null);
  readonly alt = input('');
  readonly iconSize = input(48);
  protected readonly tint = computed(() => TINTS[(this.seed() - 1 + TINTS.length) % TINTS.length]);
}
