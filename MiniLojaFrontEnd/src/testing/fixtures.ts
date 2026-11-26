import { CartItem } from '../app/core/cart/cart.store';
import { Order } from '../app/shared/models/order';
import { Product } from '../app/shared/models/product';

/** Dados de exemplo compartilhados pelos specs. */
export const PRODUCT: Product = {
  id: 1,
  name: 'Produto 01 · Nome descritivo do item com variação',
  description: 'Descrição do produto.\n\nSegundo parágrafo.',
  price: 49.9,
  originalPrice: 62.4,
  stock: 12,
  imageUrl: null,
  active: true,
  category: { id: 1, name: 'Categoria A' },
};

export const CART_ITEM: CartItem = {
  productId: 1,
  name: PRODUCT.name,
  categoryName: 'Categoria A',
  price: 49.9,
  originalPrice: 62.4,
  imageUrl: null,
  stock: 12,
  quantity: 2,
};

export const ORDER: Order = {
  id: 1042,
  status: 'PAID',
  createdAt: '2026-10-27',
  items: [
    { productId: 1, name: 'Produto 01', imageUrl: null, quantity: 2, unitPrice: 49.9 },
    { productId: 3, name: 'Produto 03', imageUrl: null, quantity: 1, unitPrice: 34.5 },
    { productId: 4, name: 'Produto 04', imageUrl: null, quantity: 1, unitPrice: 129 },
  ],
  subtotal: 263.3,
  shipping: 0,
  total: 263.3,
  paymentMethod: 'PIX',
  address: { cep: '19840-000', street: 'Rua Exemplo', number: '123', complement: 'Apto 4', district: 'Centro', city: 'Maracaí', state: 'SP' },
  customerName: 'João Pedro',
};
