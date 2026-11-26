import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const ICONS: Record<string, string[]> = {
  cube: ['M12 2.8 3.6 7.4v9.2L12 21.2l8.4-4.6V7.4L12 2.8Z', 'M3.6 7.4 12 12l8.4-4.6', 'M12 12v9.2'],
  heart: ['M12 20.2s-7.6-4.5-8.9-9.4C2.2 7.4 4.3 4.6 7.2 4.6c1.9 0 3.4 1 4.8 3 1.4-2 2.9-3 4.8-3 2.9 0 5 2.8 4.1 6.2-1.3 4.9-8.9 9.4-8.9 9.4Z'],
  cart: ['M2.5 3.5h2.7l2.2 11.2h10.6l2-8H6.2', 'M9.5 17.9a1.2 1.2 0 1 0 .01 0Z', 'M17 17.9a1.2 1.2 0 1 0 .01 0Z'],
  search: ['M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z', 'm20 20-4.4-4.4'],
  lock: ['M6 10.5h12V20H6z', 'M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5'],
  truck: ['M2.5 6h11v10h-11z', 'M13.5 9.5h4l3 3.2V16h-7', 'M7 17a1.5 1.5 0 1 0 .01 0Z', 'M17 17a1.5 1.5 0 1 0 .01 0Z'],
  card: ['M3 6h18v12H3z', 'M3 10.2h18', 'M6.5 14.5h3'],
  return: ['M9 4 4 9l5 5', 'M4 9h10a6 6 0 0 1 0 12h-3'],
  check: ['m5 12.5 4.5 4.5L19 7'],
  x: ['m6 6 12 12', 'M18 6 6 18'],
  plus: ['M12 5v14M5 12h14'],
  minus: ['M5 12h14'],
  menu: ['M4 7h16M4 12h16M4 17h16'],
  bolt: ['M13 2.5 5 13.5h6.5L10.5 21.5 19 10.5h-6.5L13 2.5Z'],
  doc: ['M6.5 3h7.5l4 4v14H6.5z', 'M14 3v4h4', 'M9 12.5h6M9 16.5h6'],
  upload: ['M7 18.5a4.5 4.5 0 0 1-.6-8.96A6 6 0 0 1 18 9.8a4.2 4.2 0 0 1-.5 8.7', 'M12 20.5v-8', 'm8.8 15 3.2-3.2 3.2 3.2'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  'chevron-left': ['m15 6-6 6 6 6'],
  'chevron-right': ['m9 6 6 6-6 6'],
  'chevron-down': ['m6 9 6 6 6-6'],
};

@Component({
  selector: 'ui-icon',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { 'aria-hidden': 'true', style: 'display:inline-flex;line-height:0' },
  templateUrl: './icon.component.html',
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(20);
  readonly stroke = input(1.8);
  readonly filled = input(false);
  protected readonly paths = computed(() => ICONS[this.name()] ?? []);
}
