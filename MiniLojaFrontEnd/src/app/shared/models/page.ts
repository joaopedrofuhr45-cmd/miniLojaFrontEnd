/** Resposta paginada do Spring (page é 0-based na API). */
export interface Page<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
