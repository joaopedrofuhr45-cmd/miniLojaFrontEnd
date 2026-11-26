/** Valor mínimo de cada parcela (só para exibir "em Nx sem juros"). */
export const MIN_INSTALLMENT = 5.5;

export function discountPct(price: number, original: number | null | undefined): number {
  if (!original || original <= price) return 0;
  return Math.round((1 - price / original) * 100);
}

export function installments(price: number, max = 10): number {
  return Math.max(1, Math.min(max, Math.floor(price / MIN_INSTALLMENT)));
}
