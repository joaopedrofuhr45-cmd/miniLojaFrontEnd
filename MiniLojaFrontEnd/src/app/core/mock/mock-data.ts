import { Category } from '@shared/models/category';
import { Order, OrderStatus } from '@shared/models/order';
import { Product } from '@shared/models/product';
import { Address } from '@shared/models/user';

export interface MockProduct extends Product { createdAt: string; }
export interface MockOrder extends Order { mine: boolean; }

export const CATEGORIES: Category[] = [
  { id: 1, name: 'Categoria A' }, { id: 2, name: 'Categoria B' }, { id: 3, name: 'Categoria C' },
];

export const DEFAULT_ADDRESS: Address = {
  cep: '19840-000', street: 'Rua Exemplo', number: '123', complement: 'Apto 4', district: 'Centro', city: 'Maracaí', state: 'SP',
};

// [preço, preço original, estoque] dos 8 primeiros produtos — iguais ao Figma.
const FIRST: [number, number | null, number][] = [
  [49.9, 62.4, 12], [89.9, null, 5], [34.5, 49.9, 18], [129, 159, 20], [59.9, null, 8], [79, 98.75, 14], [24.9, null, 30], [69.9, 89.9, 9],
];
const CATEGORY_OF = [1, 2, 1, 3, 2, 3, 1, 2, 1, 2, 3, 2, 1, 2, 3, 1, 2, 3, 1, 2, 3, 2, 1, 3, 2];
const NEWEST: Record<number, string> = { 2: '2026-10-28', 5: '2026-10-27', 7: '2026-10-26', 8: '2026-10-25' };
const DESCRIPTION =
  'Texto de descrição do produto: o que é, material, tamanho e diferenciais. Esse conteúdo vem do campo description do back e pode ter vários parágrafos.\n\n' +
  'Segundo parágrafo com informações de uso, cuidados e garantia do item.';

export const PRODUCTS: MockProduct[] = Array.from({ length: 25 }, (_, i) => {
  const id = i + 1;
  const [price, originalPrice, stock] = FIRST[i] ?? (() => {
    const p = Number((15 + ((id * 47) % 180) + 0.9).toFixed(2));
    return [p, id % 3 === 0 ? Number((p * 1.25).toFixed(2)) : null, 3 + (id % 17)] as [number, number | null, number];
  })();
  const category = CATEGORIES[CATEGORY_OF[i] - 1];
  return {
    id, name: `Produto ${String(id).padStart(2, '0')} · Nome descritivo do item com variação`, description: DESCRIPTION,
    price, originalPrice, stock: id === 11 ? 0 : stock, imageUrl: null, active: id !== 25,
    category: { id: category.id, name: category.name },
    createdAt: NEWEST[id] ?? `2026-09-${String(10 + (id % 15)).padStart(2, '0')}`,
  };
});

export const shortName = (p: { name: string }) => p.name.split(' · ')[0];

let nextOrderId = 1043;
export const takeOrderId = () => nextOrderId++;

function seed(id: number, status: OrderStatus, createdAt: string, customerName: string, mine: boolean, total: number, shipping: number, picks: [number, number][]): MockOrder {
  const items = picks.map(([pid, quantity]) => {
    const p = PRODUCTS[pid - 1];
    return { productId: pid, name: shortName(p), imageUrl: null, quantity, unitPrice: p.price };
  });
  const subtotal = total - shipping;
  const diff = subtotal - items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const last = items[items.length - 1];
  last.unitPrice = Number((last.unitPrice + diff / last.quantity).toFixed(2));
  return { id, status, createdAt, items, subtotal, shipping, total, paymentMethod: 'PIX', address: DEFAULT_ADDRESS, customerName, mine };
}

export const ORDERS: MockOrder[] = [
  seed(1042, 'PAID', '2026-10-27', 'João Pedro', true, 263.3, 0, [[1, 2], [3, 1], [4, 1]]),
  seed(1041, 'PENDING', '2026-10-27', 'Maria Souza', false, 74.9, 15, [[5, 1]]),
  seed(1040, 'SHIPPED', '2026-10-26', 'Carlos Lima', false, 178.8, 15, [[5, 1], [6, 1], [7, 1]]),
  seed(1039, 'DELIVERED', '2026-10-26', 'Ana Costa', false, 104.9, 15, [[2, 1]]),
  seed(1038, 'CANCELED', '2026-10-25', 'Pedro Alves', false, 144, 15, [[4, 1]]),
  seed(1031, 'SHIPPED', '2026-10-14', 'João Pedro', true, 104.9, 15, [[2, 1]]),
  seed(1007, 'DELIVERED', '2026-10-02', 'João Pedro', true, 178.8, 15, [[5, 1], [6, 1], [7, 1]]),
  seed(988, 'CANCELED', '2026-09-21', 'João Pedro', true, 74.9, 15, [[5, 1]]),
];
