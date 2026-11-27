import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from '../models/api-error';

export interface FieldError { field: string; message: string }
export interface ServerError { message: string; fields: FieldError[] }

/** Converte um erro HTTP do back em mensagem para a tela + erros por campo (para marcar no formulário). */
export function toServerError(e: HttpErrorResponse, fallback: string): ServerError {
  const api = e.error as Partial<ApiError> | null;
  const message = e.status === 0
    ? 'Sem conexão com o servidor. Tente de novo.'
    : e.status >= 500
      ? 'Algo deu errado do nosso lado. Tente de novo.'
      : (api?.message ?? fallback);
  return { message, fields: api?.fields ?? [] };
}
