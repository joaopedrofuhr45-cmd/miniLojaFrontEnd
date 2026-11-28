export interface Category {
  id: number;
  name: string;
  /** Opcional: usado na sidebar do catálogo ("Categoria A (8)"). */
  productCount?: number;
}
