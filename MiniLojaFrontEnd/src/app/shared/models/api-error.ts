export interface ApiFieldError { field: string; message: string; }

/** Formato único de erro do back (PLANEJAMENTO-BACK). */
export interface ApiError {
  status: number;
  error: string;
  message: string;
  fields?: ApiFieldError[];
}
