export type ProductSort = 'relevance' | 'price_asc' | 'price_desc' | 'newest';

/** Filtros de GET /products. */
export interface ProductFilters {
  page?: number; // 0-based
  size?: number;
  search?: string;
  category?: number;
  minPrice?: number;
  maxPrice?: number;
  onSale?: boolean;
  sort?: ProductSort;
}
