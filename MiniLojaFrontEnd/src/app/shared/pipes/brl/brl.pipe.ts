import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'brl', standalone: true })
export class BrlPipe implements PipeTransform {
  transform(value: number | null | undefined, digits = 2): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency', currency: 'BRL', minimumFractionDigits: digits, maximumFractionDigits: digits,
    }).format(value ?? 0);
  }
}
