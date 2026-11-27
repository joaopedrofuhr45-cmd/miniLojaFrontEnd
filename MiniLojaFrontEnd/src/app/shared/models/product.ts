import { Category } from '@shared/models/category';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number | null;
  stock: number;
  imageUrl: string | null;
  active: boolean;
  category: Pick<Category, 'id' | 'name'>;
}
