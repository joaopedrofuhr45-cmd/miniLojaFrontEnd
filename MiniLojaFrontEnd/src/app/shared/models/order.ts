import { Address } from '@shared/models/user';

export type OrderStatus = 'PENDING' | 'PAID' | 'SHIPPED' | 'DELIVERED' | 'CANCELED';
export type PaymentMethod = 'PIX' | 'CARD' | 'BOLETO';

export interface OrderItem {
  productId: number;
  name: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  paymentMethod: PaymentMethod;
  address: Address;
  customerName?: string;
}

export interface CreateOrderRequest {
  items: { productId: number; quantity: number }[];
  address: Address;
  paymentMethod: PaymentMethod;
}

export interface OrderSummary { pending: number; paid: number; shipped: number; monthRevenue: number; }
